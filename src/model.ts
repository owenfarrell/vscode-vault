'use strict';

import * as adaptors from './adaptors';
import * as clipboardy from 'clipboardy';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { SecretsEngineAdaptor } from './adaptors/base';

export class VaultSession implements vscode.Disposable {
    //#region Attributes
    public readonly client = nv();
    public readonly name: string;
    public readonly mountPoints: string[] = [];
    private _tokenTimer: NodeJS.Timer;
    //#endregion

    constructor(name: string) {
        this.name = name;
    }

    //#region Disposable Method Implementations
    dispose() {
        this._tokenTimer && clearTimeout(this._tokenTimer);
    }
    //#endregion

    public async cacheMountPoints(): Promise<void> {
        const mounts: any = await this.client.mounts();
        for (const key in mounts.data) {
            const adaptor = adaptors.getAdaptor(mounts.data[key]);
            if (adaptor !== undefined) {
                this.mount(key, adaptor);
            }
        }
    }

    public async mount(mountPoint: string, adaptor: SecretsEngineAdaptor): Promise<void> {
        vscode.window.vault.log(`Adapting '${mountPoint}' for ${adaptor.label} `);
        adaptor.adapt(mountPoint, this.client);
        this.mountPoints.push(mountPoint);
    }

    //#region Session Management
    public cacheToken(token: VaultToken): void {
        if (token.renewable === true) {
            const ms = 900 * token.ttl;
            this._tokenTimer = setTimeout(() => this.renewToken(), ms);
            vscode.window.vault.log(`Scheduling renewal of token in ${ms}ms`, 'clock');
        }
        else if (token.ttl > 0) {
            const ms = 1000 * token.ttl;
            this._tokenTimer = setTimeout(() => this.clearToken(), ms);
            vscode.window.vault.log(`Scheduling cleanup of token in ${ms}ms`, 'clock');
        }
    }

    private clearToken(): void {
        this.client.token = undefined;
    }

    private async renewToken(): Promise<any> {
        try {
            const tokenRenewResult = await this.client.tokenRenewSelf();
            const token: VaultToken = { id: tokenRenewResult.auth.client_token, renewable: tokenRenewResult.renewable, ttl: tokenRenewResult.lease_duration };
            this.cacheToken(token);
            vscode.window.vault.log(`Successfully renewed token for ${this.client.endpoint}`, 'key');
        }
        catch (err) {
            this.clearToken();
            vscode.window.vault.logError(`Unable to renew vault token: ${err.message}`);
        }
    }
    //#endregion
}

export class VaultWindow implements vscode.Disposable {
    private _clipboardTimer: NodeJS.Timer;
    private _outputChannel: vscode.OutputChannel;
    private _statusBar: vscode.StatusBarItem;
    private _statusBarTimer: NodeJS.Timer;
    private _trustedAuthorities: string[] = [];

    public clipboardTimeout: number;

    constructor() {
        this._outputChannel = vscode.window.createOutputChannel('Password Vault');
        this._statusBar = vscode.window.createStatusBarItem();
        this._statusBar.show();
    }

    set trustedAuthorities(array: string[]) {
        this.log(`Updating trusted authorities to [${array}]`);
        this._trustedAuthorities = array;
    }

    clip(key: string, value: string): void {
        clipboardy.writeSync(value);
        this.log(`Copied value of "${key}" to clipboard`, 'clippy', this.clipboardTimeout);
        if (this.clipboardTimeout > 0) {
            this._clipboardTimer = setTimeout(() => this.clearClipboard(), this.clipboardTimeout);
        }
    }

    dispose(): void {
        this._clipboardTimer && clearTimeout(this._clipboardTimer);
        this._statusBarTimer && clearTimeout(this._statusBarTimer);
    }

    log(msg: string, octicon: string = undefined, ms: number = 5000): void {
        this._outputChannel.appendLine(msg);
        if (octicon) {
            this._statusBarTimer && clearTimeout(this._statusBarTimer);
            this._statusBar.text = `$(${octicon}) ${msg}`;
            this._statusBarTimer = setTimeout(() => this.clearStatusBar(), ms);
        }
    }

    logError(msg: string): void {
        vscode.window.showErrorMessage(msg);
        this.log(msg);
    }

    private clearClipboard(): void {
        clipboardy.writeSync('');
        this.log('Cleared clipboard', 'clippy');
    }

    private clearStatusBar(): void {
        this._statusBar.text = '';
    }
}

export interface VaultToken {
    id: string;
    renewable: boolean;
    ttl: number;
}
