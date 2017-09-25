"use strict";

import { VaultToken } from "../../model";

import * as vscode from "vscode";

const userpassLoginRequest = { mount_point: "userpass", username: undefined, password: undefined };

export default function (endpoint: string): Thenable<VaultToken> {
    let newUserpassMountPoint: string;
    let newUserpassUsername: string;
    let newUserpassPassword: string;
    // Prompt the user for the authentication mount point
    return vscode.window.showInputBox({ prompt: "Enter userpass authentication mount point", value: userpassLoginRequest.mount_point })
        // If input was collected, cache the input, otherwise cancel
        .then((userInput: string) => (newUserpassMountPoint = userInput) || Promise.reject("Not Connected to Vault (no mount point provided)"))
        // Prompt the user for the authentication username
        .then(() => vscode.window.showInputBox({ prompt: "Enter Username", value: userpassLoginRequest.username }))
        // If input was collected, cache the input, otherwise cancel
        .then((userInput: string) => (newUserpassUsername = userInput) || Promise.reject("Not Connected to Vault (no username provided)"))
        // Prompt the user for the authentication password
        .then(() => vscode.window.showInputBox({ password: true, prompt: "Enter Password", value: userpassLoginRequest.password }))
        // If input was collected, cache the input, otherwise cancel
        .then((userInput: string) => (newUserpassPassword = userInput) || Promise.reject("Not Connected to Vault (no password provided)"))
        // Reset the client
        .then(() => vscode.window.vault.reset(endpoint))
        // Persist the collected inputs
        .then(() => {
            userpassLoginRequest.mount_point = newUserpassMountPoint;
            userpassLoginRequest.username = newUserpassUsername;
            userpassLoginRequest.password = newUserpassPassword;
        })
        .then(() => vscode.window.vault.log("Logging in with username and password", "person"))
        .then(() => vscode.window.vault.client.userpassLogin(userpassLoginRequest))
        .then((result: any) => <VaultToken>{ id: result.auth.client_token, renewable: result.auth.renewable, ttl: result.auth.lease_duration });
}
