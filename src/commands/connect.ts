"use strict";

import { VaultToken } from "../model";
import * as login from "./login";

import { isURL } from "validator";
import * as vscode from "vscode";

const authenticationItems: vscode.CallableQuickPickItem[] = [
    { label: "Native", description: "Authenticate via an externally generated token", callback: login.native },
    { label: "GitHub", description: "Authenticate via a GitHub personal access token", callback: login.github },
    { label: "Username & Password", description: "Authenticate via a username and password", callback: login.userpass },
];

function validateURL(userInput: string): string | undefined {
    return isURL(userInput, { require_tld: false }) ? undefined : "Not a valid URL";
}

export default function (lax: boolean = false): Thenable<any> {
    let newEndpoint: string;
    // If a token already exists and lax mode is enabled, return the existing token, otherwise prompt for the vault address
    return vscode.window.vault.client.token && lax === true ? Promise.resolve(vscode.window.vault.client.token) : vscode.window.showInputBox({ value: vscode.window.vault.client.endpoint, prompt: "Enter the address of your vault server", validateInput: validateURL })
        // If input was collected, cache the input, otherwise cancel
        .then((userInput: string) => (newEndpoint = userInput) || Promise.reject("Not connected to Vault (no endpoint provided)"))
        // Show the list of authentication options
        .then(() => vscode.window.showQuickPick(authenticationItems, { placeHolder: "Select an authentication backend" }))
        // If input was collected, continue, otherwise cancel
        .then((selectedItem: vscode.CallableQuickPickItem) => selectedItem || Promise.reject("Not connected to Vault (no authentication selected)"))
        // Execute the selected item's callback method
        .then((selectedItem: vscode.CallableQuickPickItem) => selectedItem.callback(newEndpoint))
        .then((token: VaultToken) => vscode.window.vault.cacheToken(token))
        .then(() => vscode.window.vault.log(`Connected to ${newEndpoint}`, "shield"));
}
