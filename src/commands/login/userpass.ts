'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { VaultToken } from '../../model';

const userpassLoginRequest = { mount_point: 'userpass', username: process.env.USER || process.env.USERNAME, password: undefined };

export default async function(client: nv.client): Promise<VaultToken> {
    let token: VaultToken;
    // Prompt the user for the authentication mount point
    const newUserpassMountPoint = await vscode.window.showInputBox({ prompt: 'Enter userpass authentication mount point', value: userpassLoginRequest.mount_point });
    // If input was collected, cache the input, otherwise cancel
    if (newUserpassMountPoint) {
        // Prompt the user for the authentication username
        const newUserpassUsername = await vscode.window.showInputBox({ prompt: 'Enter Username', value: userpassLoginRequest.username });
        // If input was collected, cache the input, otherwise cancel
        if (newUserpassUsername) {
            // Prompt the user for the authentication password
            const newUserpassPassword = await vscode.window.showInputBox({ password: true, prompt: 'Enter Password', value: userpassLoginRequest.password });
            // If input was collected, cache the input, otherwise cancel
            if (newUserpassPassword) {
                // Cache the collected inputs
                userpassLoginRequest.mount_point = newUserpassMountPoint;
                userpassLoginRequest.username = newUserpassUsername;
                userpassLoginRequest.password = newUserpassPassword;

                vscode.window.vault.log('Logging in with username and password', 'person');
                const userpassLoginResult = await client.userpassLogin(userpassLoginRequest);
                token = { id: userpassLoginResult.auth.client_token, renewable: userpassLoginResult.auth.renewable, ttl: userpassLoginResult.auth.lease_duration };
            }
        }
    }
    return token;
}
