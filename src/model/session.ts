'use strict';

import * as adaptors from '../adaptors';
import * as config from '../config';
import * as login from '../commands/login';
import * as nv from 'node-vault';
import * as request from 'request';
import * as url from 'url';
import * as vscode from 'vscode';

import { VaultClientConfig, VaultConnectionConfig } from './config';
import { VaultToken } from './token';

export class VaultSession implements vscode.Disposable {
    //#region Attributes
    public readonly mountPoints: Map<string, adaptors.SecretsEngineAdaptor> = new Map();
    private readonly _config: VaultClientConfig;
    private _client: nv.client;
    private _login: (client: nv.client) => Promise<VaultToken>;
    private _options: request.CoreOptions;
    private _tokenTimer: NodeJS.Timer;
    //#endregion

    constructor(clientConfig: VaultClientConfig) {
        this._config = clientConfig;
        this._login = login.MAP.get(clientConfig.login).callback;

        // If the URL was provided as a string
        const endpointUrl = new url.URL(clientConfig.endpoint);
        // Remove any trailing slash from the URL
        clientConfig.endpoint = url.format(endpointUrl).replace(/\/$/, '');
        this._options = {
            followAllRedirects: true,
            strictSSL: config.TRUSTED_AUTHORITIES.indexOf(endpointUrl.host) < 0
        };

        this._client = nv({
            endpoint: clientConfig.endpoint,
            requestOptions: this._options
        });
    }

    //#region Getters and Setters
    public get client(): nv.client {
        return this._client;
    }

    public get config(): VaultConnectionConfig {
        const mapEntries = Array.from(this.mountPoints.entries());
        const mountPointConfig = mapEntries.map(entry => <any>{ path: entry[0], adaptor: entry[1].label });
        return Object.assign(this._config, { mountPoints: mountPointConfig });
    }

    public get name(): string {
        return this._config.name;
    }
    //#endregion

    //#region Disposable Method Implementations
    dispose() {
        this._tokenTimer && clearTimeout(this._tokenTimer);
        this._client = nv({
            endpoint: this._config.endpoint,
            requestOptions: this._options
        });
        for (const entry of this.mountPoints.entries()) {
            this.mount(entry[0], entry[1]);
        }
    }
    //#endregion

    //#region Session Management
    public async login(): Promise<void> {
        // Call the selected authentication function
        const token = await this._login(this._client);
        // If a token was collected
        if (token) {
            // Cache the token
            this.cacheToken(token);
            vscode.window.vault.log(`Connected to ${this._client.endpoint}`, 'shield');
        }
    }
    //#endregion

    //#region Mount Point Management
    public async cacheMountPoints(): Promise<void> {
        // Fetch the list of client mounts
        const mounts: any = await this.client.mounts();
        // Clear the existing array
        this.mountPoints.clear();
        // For each mount point
        for (const key in mounts.data) {
            // Get the adaptor for the specified mount point
            const adaptor = adaptors.getAdaptor(mounts.data[key]);
            // If the mount point is supported
            if (adaptor !== undefined) {
                // Mount the path
                this.mount(key, adaptor);
            }
        }
    }

    public async mount(mountPoint: string, adaptor: SecretsEngineAdaptor | string): Promise<void> {
        if (typeof adaptor === 'string') {
            adaptor = adaptors.MAP.get(adaptor);
        }
        vscode.window.vault.log(`Adapting '${mountPoint}' for ${adaptor.label} `);
        // Adapt the client for requests to the specified path
        adaptor.adapt(mountPoint, this.client);
        // Add the path to the list of mount points
        this.mountPoints.set(mountPoint, adaptor);
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
