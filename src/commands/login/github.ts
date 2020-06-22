'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { CallableQuickPickItem, VaultToken } from '../../model';
import validator from 'validator';

const githubLoginRequest = { mount_point: 'github', token: process.env.VAULT_AUTH_GITHUB_TOKEN };

function validateGitHubToken(userInput: string): string | undefined {
    return userInput.length === 40 && validator.isHexadecimal(userInput) ? undefined : 'Not a valid GitHub token';
}

async function login(client: nv.client): Promise<VaultToken> {
    let token: VaultToken;
    // Prompt for the mount point
    const newGitgubMountPoint = await vscode.window.showInputBox({ prompt: 'Enter authentication mount point', value: githubLoginRequest.mount_point });
    // If the mount point was collected
    if (newGitgubMountPoint) {
        // Prompt for the GitHub token
        const newGithubToken = await vscode.window.showInputBox({ prompt: 'Enter GitHub access token', value: githubLoginRequest.token, validateInput: validateGitHubToken });
        // If the GitHub token was collected
        if (newGithubToken) {
            // Cache the collected inputs
            githubLoginRequest.mount_point = newGitgubMountPoint;
            githubLoginRequest.token = newGithubToken;
            // Submit a login request
            const githubLoginResult = await client.githubLogin(githubLoginRequest);
            // Parse the login response
            token = { id: githubLoginResult.auth.client_token, renewable: githubLoginResult.auth.renewable, ttl: githubLoginResult.auth.lease_duration };
            vscode.window.vault.log('Logging in with access token', 'mark-github');
        }
    }
    // Return the token (if defined)
    return token;
}

export const QUICK_PICK: CallableQuickPickItem = {
    label: 'GitHub',
    description: 'Authenticate via a GitHub personal access token',
    callback: login
};
