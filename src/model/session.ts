'use strict';

import * as adaptors from 'src/adaptors';
import * as config from 'src/config';
import * as login from 'src/commands/login';
import * as nv from 'node-vault';
import * as request from 'request';
import * as url from 'url';
import * as vscode from 'vscode';

import { VaultConnectionConfig, VaultMountPointConfig } from './config';

import { splitPath } from 'src/util';
import { VaultToken } from './token';
import { VaultWindow } from './window';

export class VaultSession implements vscode.Disposable {
    //#region Attributes
    private readonly _config: VaultConnectionConfig;
    private _client: nv.client;
    private readonly _impliedMountPoints: Map<string, adaptors.SecretsEngineAdaptor> = new Map();
    private readonly _login: (client: nv.client) => Promise<VaultToken>;
    private readonly _mountPoints: Map<string, adaptors.SecretsEngineAdaptor> = new Map();
    private readonly _options: request.CoreOptions;
    private readonly _specifiedMountPoints: Map<string, adaptors.SecretsEngineAdaptor> = new Map();
    private _tokenTimer: NodeJS.Timer;
    //#endregion

    constructor(myConfig: VaultConnectionConfig) {
        // If the URL was provided as a string
        const endpointUrl = new url.URL(myConfig.endpoint);
        // Get the login selection
        const quickPick = login.get(myConfig.login);
        // If mount points are explicitly defined
        if (myConfig.mountPoints) {
            // For each mount point in the configuration
            myConfig.mountPoints.forEach((element:VaultMountPointConfig) => {
                // Get the adaptor by name
                const adaptor = adaptors.get(element.adaptor);
                // If no adaptor was found
                if (adaptor === undefined) {
                    // Throw an error
                    VaultWindow.INSTANCE.log(`Unable to get ${element.adaptor} adaptor`);
                }
                // If an adaptor was found
                else {
                    // Add the path to the list of mount points
                    this._specifiedMountPoints.set(element.path, adaptor);
                }
            });
        }
        // Create fields from the sanitized parameter
        this._config = {
            endpoint: url.format(endpointUrl).replace(/\/$/, ''),
            login: quickPick.label,
            name: myConfig.name
        };
        this._login = quickPick.callback;
        this._options = {
            followAllRedirects: true,
            strictSSL: config.TRUSTED_AUTHORITIES.indexOf(endpointUrl.host) < 0
        };
    }

    //#region Getters and Setters
    public getAdaptor(path: string) {
        // Get the mount point from the specified path
        const mountPoint = splitPath(path)[0];
        // Return the adaptor for the mount point (if defined)
        return this._mountPoints.get(mountPoint);
    }

    public get client(): nv.client {
        return this._client;
    }

    public get config(): VaultConnectionConfig {
        const mountPoints : VaultMountPointConfig[] = [];
        this._specifiedMountPoints.forEach((value: adaptors.SecretsEngineAdaptor, key: string) => {
            mountPoints.push({ adaptor: value.label, path: key });
        });
        return { ...this._config, mountPoints };
    }

    public get mountPoints(): string[] {
        return [...Array.from(this._impliedMountPoints.keys()), ...Array.from(this._specifiedMountPoints.keys())];
    }

    public get name(): string {
        return this._config.name;
    }
    //#endregion

    //#region Disposable Method Implementations
    dispose() {
        this._tokenTimer && clearTimeout(this._tokenTimer);
        this._client && (this._client.token = undefined);
    }
    //#endregion

    //#region Session Management
    public async login(): Promise<void> {
        // Create a Vault client
        this._client = nv({
            endpoint: this._config.endpoint,
            requestOptions: this._options
        });
        // Call the selected authentication function
        const token = await this._login(this._client);
        // If a token was collected
        if (token) {
            // Cache the token
            this.cacheToken(token);
            VaultWindow.INSTANCE.log(`Connected to ${this._client.endpoint}`, 'shield');
        }
        // Clear the existing set of mount points
        this._mountPoints.clear();
        try {
            // Fetch the list of mounts from Vault (NOTE: this is likely fail due to user access restrictions)
            const mounts: any = await this.client.mounts();
            // For each mount point
            for (const key in mounts.data) {
                // Get the adaptor for the specified mount point
                const adaptor = adaptors.get(mounts.data[key]);
                // If the mount point is supported
                if (adaptor !== undefined) {
                    // Mount the path
                    this.mountPath(key, adaptor);
                    // Map the mount point to the adaptor
                    this._impliedMountPoints.set(key, adaptor);
                }
            }
        }
        catch (err) {
            VaultWindow.INSTANCE.log(`Unable to retrieve mount points for ${this._client.endpoint} (${err.message})`);
        }
        // For each explicitly specified path to mount, mount the path
        this._specifiedMountPoints.forEach((value: adaptors.SecretsEngineAdaptor, key: string) => this.mountPath(key, value));
    }
    //#endregion

    //#region Mount Point Management
    public mount(path: string, adaptor: adaptors.SecretsEngineAdaptor) {
        // If no adaptor was specified
        if (adaptor === undefined) {
            throw new Error(`No adaptor defined for ${path}`);
        }
        // Mount the path with the adaptor
        this.mountPath(path, adaptor);
        // Add the path to the list of mount points
        this._specifiedMountPoints.set(path, adaptor);
    }

    private mountPath(path: string, adaptor: adaptors.SecretsEngineAdaptor) {
        // Extract the mount from the path
        const mountPoint = splitPath(path)[0];
        // If the specified path is already mounted
        if (this._mountPoints.has(mountPoint) === true) {
            VaultWindow.INSTANCE.log(`${path} is already mounted`);
            return;
        }
        VaultWindow.INSTANCE.log(`Adapting ${path} for ${adaptor.label}`);
        // Adapt the client for requests to the specified path
        adaptor.adapt(mountPoint, this.client);
        // Map the mount point to the adaptor
        this._mountPoints.set(mountPoint, adaptor);
    }
    //#endregion

    //#region Session Management Helpers
    private cacheToken(token: VaultToken): void {
        let action: string;
        let callback: () => void;
        let ms: number;
        // If the token is renewable
        if (token.renewable === true) {
            action = 'renewal';
            // Set the callback function to renew the token
            callback = () => this.renewToken();
            // Calculate 90% of the TTL (s) in ms
            ms = 900 * token.ttl;
        }
        else if (token.ttl > 0) {
            action = 'cleanup';
            // Set the callback function to clear the token
            callback = () => this.clearToken();
            // Calculate the TTL (s) in ms
            ms = 1000 * token.ttl;
        }
        // If a scheduled action should take place
        if (action) {
            VaultWindow.INSTANCE.log(`Scheduling ${action} of token in ${ms}ms`, 'clock');
            this._tokenTimer = setTimeout(callback, ms);
        }
    }

    private clearToken(): void {
        VaultWindow.INSTANCE.log(`Clearing token for ${this.client.endpoint}`);
        // Clear the token
        this.client.token = undefined;
    }

    private async renewToken(): Promise<any> {
        try {
            // Submit a renewal request
            const tokenRenewResult = await this.client.tokenRenewSelf();
            // Cache the renewal request
            this.cacheToken({ id: tokenRenewResult.auth.client_token, renewable: tokenRenewResult.renewable, ttl: tokenRenewResult.lease_duration });
            VaultWindow.INSTANCE.log(`Successfully renewed token for ${this.client.endpoint}`, 'key');
        }
        catch (err) {
            // Clear the cached token
            this.clearToken();
            VaultWindow.INSTANCE.logError(`Unable to renew vault token: ${err.message}`);
        }
    }
    //#endregion
}
