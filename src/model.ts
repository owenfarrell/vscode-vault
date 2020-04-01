"use strict";

import * as adaptors from "./adaptors";

import * as clipboardy from "clipboardy";
import * as nv from "node-vault";
import Uri from "vscode-uri";
import * as vscode from "vscode";

export class VaultSession implements vscode.Disposable {

    private _clientOptions: any = { followAllRedirects: true, strictSSL: true };
    private _clipboardTimer: NodeJS.Timer;
    private _outputChannel: vscode.OutputChannel;
    private _secretMounts = {};
    private _statusBar: vscode.StatusBarItem;
    private _statusBarTimer: NodeJS.Timer;
    private _tokenTimer: NodeJS.Timer;
    private _trustedAuthorities: string[] = [];

    public clipboardTimeout: number;
    public readonly client = nv({ requestOptions: this._clientOptions });
    public lastPath: string;

    constructor() {
        this._outputChannel = vscode.window.createOutputChannel("Password Vault");
        this._statusBar = vscode.window.createStatusBarItem();
        this._statusBar.show();
    }

    set trustedAuthorities(array: string[]) {
        this.log(`Updating trusted authorities to [${array}]`);
        this._trustedAuthorities = array;
    }

    dispose() {
        this._clipboardTimer && clearTimeout(this._clipboardTimer);
        this._statusBarTimer && clearTimeout(this._statusBarTimer);
        this._tokenTimer && clearTimeout(this._tokenTimer);
    }

    clip(key: string, value: string) {
        clipboardy.write(value)
            .then(() => this.clipboardTimeout > 0 ? this._clipboardTimer = setTimeout(() => this.clearClipboard(), this.clipboardTimeout) : undefined)
            .then(() => this.log(`Copied value of "${key}" to clipboard`, "clippy", this.clipboardTimeout));
    }

    cacheToken(token: VaultToken): void {
        if (token.renewable === true) {
            let ms = 900 * token.ttl;
            this._tokenTimer = setTimeout(() => this.renewToken(), ms);
            this.log(`Scheduling renewal of token in ${ms}ms`, "clock");
        }
        else if (token.ttl > 0) {
            let ms = 1000 * token.ttl;
            this._tokenTimer = setTimeout(() => this.clearToken(), ms);
            this.log(`Scheduling cleanup of token in ${ms}ms`, "clock");
        }
    }

    logError(msg: string) {
        vscode.window.showErrorMessage(msg);
        this.log(msg);
    }

    log(msg: string, octicon: string = undefined, ms: number = 5000) {
        this._outputChannel.appendLine(msg);
        if (octicon) {
            this._statusBarTimer && clearTimeout(this._statusBarTimer);
            this._statusBar.text = `$(${octicon}) ${msg}`;
            this._statusBarTimer = setTimeout(() => this.clearStatusBar(), ms);
        }
    }

    reset(endpoint: string, token?: string): Promise<any> {
        this._tokenTimer && clearTimeout(this._tokenTimer);
        this._secretMounts = {};
        return Promise.resolve(this.client.token && this.client.tokenRevokeSelf())
            .then((result: any) => result && this.log("Successfully revoked client token", "sign-out"))
            .catch((err: any) => this.logError(err))
            .then(() => {
                this.client.token = token;
                this.client.endpoint = endpoint;
                this.updateOptions();
            }).then(() => this.client.mounts())
            .then((mounts: any) => mounts.data)
            .then((data: any) => Object.keys(data).forEach((mountPoint) => {
                let adaptor = adaptors.getAdaptor(data[mountPoint]);
                if (adaptor !== undefined) {
                    adaptor.adapt(mountPoint, this.client);
                    this._secretMounts[mountPoint] = adaptor;
                }
            }));
    }

    private clearClipboard(): void {
        clipboardy.writeSync("");
        this.log("Cleared clipboard", "clippy");
    }

    private clearStatusBar(): void {
        this._statusBar.text = "";
    }

    private clearToken(): void {
        this.client.token = undefined;
    }

    private renewToken(): Thenable<any> {
        return this.client.tokenRenewSelf()
            .then((result: any) => <VaultToken>{ id: result.auth.client_token, renewable: result.renewable, ttl: result.lease_duration })
            .then((token: VaultToken) => this.cacheToken(token))
            .then(() => this.log(`Successfully renewed token for ${this.client.endpoint}`, "key"))
            .catch((err) => {
                this.clearToken();
                this.logError(`Unable to renew vault token: ${err.message}`);
            });
    }

    private updateOptions(): void {
        let vaultAuthority: string = Uri.parse(this.client.endpoint).authority;
        this.log(`Checking trusted authority list for ${vaultAuthority}`);
        this._clientOptions.strictSSL = this._trustedAuthorities.indexOf(vaultAuthority) < 0;
    }
}

export interface VaultToken {
    id: string;
    renewable: boolean;
    ttl: number;
}
