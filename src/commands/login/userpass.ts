'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { CallableQuickPickItem, VaultToken } from '../../model';

const userpassLoginRequest = { mount_point: 'userpass', username: process.env.USER || process.env.USERNAME, password: undefined };

async function login(client: nv.client): Promise<VaultToken> {
    let token: VaultToken;
    // Prompt the user for the authentication mount point
    const newUserpassMountPoint = await vscode.window.showInputBox({ prompt: 'Enter userpass authentication mount point', value: userpassLoginRequest.mount_point });
    // If the username was collected
    if (newUserpassMountPoint) {
        // Prompt the user for the authentication username
        const newUserpassUsername = await vscode.window.showInputBox({ prompt: 'Enter Username', value: userpassLoginRequest.username });
        // If the password was collected
        if (newUserpassUsername) {
            // Prompt the user for the authentication password
            const newUserpassPassword = await vscode.window.showInputBox({ password: true, prompt: 'Enter Password', value: userpassLoginRequest.password });
            // If input was collected, cache the input, otherwise cancel
            if (newUserpassPassword) {
                // Cache the collected inputs
                userpassLoginRequest.mount_point = newUserpassMountPoint;
                userpassLoginRequest.username = newUserpassUsername;
                userpassLoginRequest.password = newUserpassPassword;
                // Submit a login request
                const userpassLoginResult = await client.userpassLogin(userpassLoginRequest);
                // Parse the login response
                token = { id: userpassLoginResult.auth.client_token, renewable: userpassLoginResult.auth.renewable, ttl: userpassLoginResult.auth.lease_duration };
                vscode.window.vault.log('Logging in with username and password', 'person');
            }
        }
    }
    // Return the token (if defined)
    return token;
}

export const QUICK_PICK: CallableQuickPickItem = {
    label: 'Username & Password',
    description: 'Authenticate via a username and password',
    callback: login
};
