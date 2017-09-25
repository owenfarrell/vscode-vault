"use strict";

import { VaultToken } from "../../model";

import { isHexadecimal } from "validator";
import * as vscode from "vscode";

const githubLoginRequest = { mount_point: "github", token: process.env.VAULT_AUTH_GITHUB_TOKEN };

function validateGitHubToken(userInput: string): string | undefined {
    return userInput.length === 40 && isHexadecimal(userInput) ? undefined : "Not a valid GitHub token";
}

export default function (endpoint: string): Thenable<VaultToken> {
    let newGitgubMountPoint: string;
    let newGithubToken: string;
    // Prompt for the mount point
    return vscode.window.showInputBox({ prompt: "Enter authentication mount point", value: githubLoginRequest.mount_point })
        // If input was collected, cache the input, otherwise cancel
        .then((userInput: string) => (newGitgubMountPoint = userInput) || Promise.reject("Not Connected to Vault (no mount point provided)"))
        // Prompt for the GitHub token
        .then(() => vscode.window.showInputBox({ prompt: "Enter GitHub access token", value: githubLoginRequest.token, validateInput: validateGitHubToken }))
        // If input was collected, cache the input, otherwise cancel
        .then((userInput: string) => (newGithubToken = userInput) || Promise.reject("Not Connected to Vault (no access token provided)"))
        // Reset the client
        .then(() => vscode.window.vault.reset(endpoint))
        // Cache the collected inputs
        .then(() => {
            githubLoginRequest.mount_point = newGitgubMountPoint;
            githubLoginRequest.token = newGithubToken;
        })
        .then(() => vscode.window.vault.log("Logging in with access token", "mark-github"))
        .then(() => vscode.window.vault.client.githubLogin(githubLoginRequest))
        .then((result: any) => <VaultToken>{ id: result.auth.client_token, renewable: result.auth.renewable, ttl: result.auth.lease_duration });
}
