'use strict';

import * as adaptors from '../adaptors';
import * as config from '../config';
import * as login from '../commands/login';
import * as nv from 'node-vault';
import * as request from 'request';
import * as url from 'url';
import * as vscode from 'vscode';

import { VaultConnectionConfig, VaultMountPointConfig } from './config';
import { VaultToken } from './token';

export class VaultSession implements vscode.Disposable {
    //#region Attributes
    private readonly _config: VaultConnectionConfig;
    private _client: nv.client;
    private readonly _login: (client: nv.client) => Promise<VaultToken>;
    private readonly _mountPoints: Set<string> = new Set();
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
                    vscode.window.vault.log(`Unable to get ${element.adaptor} adaptor`);
                }
                // Add the path to the list of mount points
                this._specifiedMountPoints.set(element.path, adaptor);
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
        return Array.from(this._mountPoints);
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
            vscode.window.vault.log(`Connected to ${this._client.endpoint}`, 'shield');
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
                }
            }
        }
        catch (err) {
            vscode.window.vault.log(`Unable to retrieve mount points for ${this._client.endpoint} (${err.message})`);
        }
        // For each explicitly specified path to mount
        for (const entry of this._specifiedMountPoints.entries()) {
            // Mount the path
            this.mountPath(entry[0], entry[1]);
        }
    }
    //#endregion

    //#region Mount Point Management
    public mount(path: string, adaptor: adaptors.SecretsEngineAdaptor) {
        // If no adaptor or adaptor type was specified
        if (adaptor === undefined) {
            throw new Error(`No adaptor defined for ${path}`);
        }
        // Extract the mount from the path
        const mountPoint = path.split('/')[0];
        // Mount the path with the adaptor
        this.mountPath(mountPoint, adaptor);
        // Add the path to the list of mount points
        this._specifiedMountPoints.set(path, adaptor);
    }

    private mountPath(path: string, adaptor: adaptors.SecretsEngineAdaptor) {
        // If the specified path is already mounted
        if (this._mountPoints.has(path) === true) {
            vscode.window.vault.log(`${path} is already mounted`);
            return;
        }
        vscode.window.vault.log(`Adapting ${path} for ${adaptor.label}`);
        // Adapt the client for requests to the specified path
        adaptor.adapt(path, this.client);
        this._mountPoints.add(path);
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
            vscode.window.vault.log(`Scheduling ${action} of token in ${ms}ms`, 'clock');
            this._tokenTimer = setTimeout(callback, ms);
        }
    }

    private clearToken(): void {
        vscode.window.vault.log(`Clearing token for ${this.client.endpoint}`);
        // Clear the token
        this.client.token = undefined;
    }

    private async renewToken(): Promise<any> {
        try {
            // Submit a renewal request
            const tokenRenewResult = await this.client.tokenRenewSelf();
            // Cache the renewal request
            this.cacheToken({ id: tokenRenewResult.auth.client_token, renewable: tokenRenewResult.renewable, ttl: tokenRenewResult.lease_duration });
            vscode.window.vault.log(`Successfully renewed token for ${this.client.endpoint}`, 'key');
        }
        catch (err) {
            // Clear the cached token
            this.clearToken();
            vscode.window.vault.logError(`Unable to renew vault token: ${err.message}`);
        }
    }
    //#endregion
}
