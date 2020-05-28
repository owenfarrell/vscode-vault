'use strict';

import * as vscode from 'vscode';

export class VaultWindow implements vscode.Disposable {
    private _clipboardTimer: NodeJS.Timer;
    private _outputChannel: vscode.OutputChannel;
    private _statusBar: vscode.StatusBarItem;
    private _statusBarTimer: NodeJS.Timer;

    public clipboardTimeout: number;

    constructor() {
        this._outputChannel = vscode.window.createOutputChannel('Password Vault');
        this._statusBar = vscode.window.createStatusBarItem();
        this._statusBar.show();
    }

    clip(key: string, value: string): void {
        // If a clipboard timer is already defined
        if (this._clipboardTimer) {
            // Cancel the timer
            this._clipboardTimer.unref();
        }
        // Write the specified value to the clipboard
        vscode.env.clipboard.writeText(value);
        this.log(`Copied value of "${key}" to clipboard`, 'clippy', this.clipboardTimeout);
        // If a clipboard timeout is set
        if (this.clipboardTimeout > 0) {
            // Create a timeout function to clear the clipboard
            this._clipboardTimer = setTimeout(() => this.clearClipboard(value), this.clipboardTimeout);
        }
    }

    dispose(): void {
        // Clear the timeout function that clears the clipboard (if defined)
        this._clipboardTimer && clearTimeout(this._clipboardTimer);
        // Clear the timeout function that clears the status bar (if defined)
        this._statusBarTimer && clearTimeout(this._statusBarTimer);
    }

    log(msg: string, octicon: string = undefined, ms: number = 5000): void {
        // Write the message to the output channel
        this._outputChannel.appendLine(msg);
        // If an icon is defined
        if (octicon) {
            // Clear the timeout function that clears the status bar (if already defined)
            this._statusBarTimer && clearTimeout(this._statusBarTimer);
            // Set the icon/message to the status bar text
            this._statusBar.text = `$(${octicon}) ${msg}`;
            // Create a timeout function to clear the status bar
            this._statusBarTimer = setTimeout(() => this.clearStatusBar(), ms);
        }
    }

    logError(msg: string): void {
        // Show the message
        vscode.window.showErrorMessage(msg);
        // Log the message
        this.log(msg);
    }

    private clearClipboard(expectedValue: string): void {
        // Read the clipboard contents
        vscode.env.clipboard.readText()
            .then((actualValue: string) => {
                // If the actual clipboard contents match the expected contents
                if (actualValue === expectedValue) {
                    // Write an empty string to the clipboard
                    vscode.env.clipboard.writeText('');
                    this.log('Cleared clipboard', 'clippy');
                }
                // If the actual clipboard contents differ from the expected contents
                else {
                    // Clear the status bar
                    this.clearStatusBar();
                }
            });
    }

    private clearStatusBar(): void {
        this._statusBar.text = '';
    }
}
