'use strict';

import * as adaptors from '../adaptors';
import * as nv from 'node-vault';
import * as request from 'request';
import * as url from 'url';
import * as vscode from 'vscode';

import { SecretsEngineAdaptor } from '../adaptors/base';
import { VaultToken } from './token';

export class VaultSession implements vscode.Disposable {
    //#region Attributes
    public readonly client: nv.client;
    public readonly endpoint: url.Url;
    public readonly name: string;
    public readonly mountPoints: string[] = [];
    public readonly requestOptions: request.CoreOptions = { followAllRedirects: true, strictSSL: true };
    private _tokenTimer: NodeJS.Timer;
    //#endregion

    constructor(name: string, endpointUrl : url.Url) {
        this.client = nv({ endpoint: url.format(endpointUrl), requestOptions: this.requestOptions });
        this.endpoint = endpointUrl;
        this.name = name;
    }

    //#region Disposable Method Implementations
    dispose() {
        this._tokenTimer && clearTimeout(this._tokenTimer);
    }
    //#endregion

    //#region Mount Point Management
    public async cacheMountPoints(): Promise<void> {
        // Fetch the list of client mounts
        const mounts: any = await this.client.mounts();
        // Clear the existing array
        this.mountPoints.length = 0;
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

    public async mount(mountPoint: string, adaptor: SecretsEngineAdaptor): Promise<void> {
        vscode.window.vault.log(`Adapting '${mountPoint}' for ${adaptor.label} `);
        // Adapt the client for requests to the specified path
        adaptor.adapt(mountPoint, this.client);
        // Add the path to the list of mount points
        this.mountPoints.push(mountPoint);
    }
    //#endregion

    //#region Session Management
    public cacheToken(token: VaultToken): void {
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
        // Clear the token
        // TODO How do we re-login?
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
