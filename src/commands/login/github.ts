'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { CallableQuickPickItem } from './base';
import validator from 'validator';
import { VaultToken } from 'src/model/token';
import { VaultWindow } from 'src/model/window';

const PREFIXED_TOKEN_FORMAT = /ghp_\w{36,}/;

function validateGitHubToken(userInput: string): string | undefined {
    return PREFIXED_TOKEN_FORMAT.test(userInput) || (userInput.length === 40 && validator.isAlphanumeric(userInput)) ? undefined : 'Not a valid GitHub token';
}

async function login(client: nv.client): Promise<VaultToken> {
    const githubLoginRequest = { mount_point: 'github', token: process.env.VAULT_AUTH_GITHUB_TOKEN };

    // Prompt for the mount point
    githubLoginRequest.mount_point = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter authentication mount point', value: githubLoginRequest.mount_point });
    // If the mount point was not collected
    if (!githubLoginRequest.mount_point) {
        return undefined;
    }

    // Prompt for the GitHub token
    githubLoginRequest.token = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter GitHub access token', value: githubLoginRequest.token, validateInput: validateGitHubToken });
    // If the GitHub token was not collected
    if (!githubLoginRequest.token) {
        return undefined;
    }

    // Submit a login request
    const githubLoginResult = await client.githubLogin(githubLoginRequest);
    // Parse the login response
    const token : VaultToken = { id: githubLoginResult.auth.client_token, renewable: githubLoginResult.auth.renewable, ttl: githubLoginResult.auth.lease_duration };
    VaultWindow.INSTANCE.log('Logging in with access token', 'mark-github');

    // Return the token (if defined)
    return token;
}

const github: CallableQuickPickItem = {
    label: 'GitHub',
    description: 'Authenticate via a GitHub personal access token',
    callback: login
};

export default github;
