'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import validator from 'validator';
import { VaultToken } from '../../model';

const githubLoginRequest = { mount_point: 'github', token: process.env.VAULT_AUTH_GITHUB_TOKEN };

function validateGitHubToken(userInput: string): string | undefined {
    return userInput.length === 40 && validator.isHexadecimal(userInput) ? undefined : 'Not a valid GitHub token';
}

export default async function(client: nv.client): Promise<VaultToken> {
    let token: VaultToken;
    // Prompt for the mount point
    const newGitgubMountPoint = await vscode.window.showInputBox({ prompt: 'Enter authentication mount point', value: githubLoginRequest.mount_point });
    // If no input was collected, cancel
    if (newGitgubMountPoint) {
        // Prompt for the GitHub token
        const newGithubToken = await vscode.window.showInputBox({ prompt: 'Enter GitHub access token', value: githubLoginRequest.token, validateInput: validateGitHubToken });
        // If no input was collected, cancel
        if (newGithubToken) {
            // Cache the collected inputs
            githubLoginRequest.mount_point = newGitgubMountPoint;
            githubLoginRequest.token = newGithubToken;
            vscode.window.vault.log('Logging in with access token', 'mark-github');
            const githubLoginResult = await client.githubLogin(githubLoginRequest);
            token = { id: githubLoginResult.auth.client_token, renewable: githubLoginResult.auth.renewable, ttl: githubLoginResult.auth.lease_duration };
        }
    }

    return token;
}
