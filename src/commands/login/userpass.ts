'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { VaultToken } from '../../model';

const userpassLoginRequest = { mount_point: 'userpass', username: process.env.USER || process.env.USERNAME, password: undefined };

export default async function(client: nv.client): Promise<VaultToken> {
    // Prompt the user for the authentication mount point
    const newUserpassMountPoint = await vscode.window.showInputBox({ prompt: 'Enter userpass authentication mount point', value: userpassLoginRequest.mount_point });
    // If input was collected, cache the input, otherwise cancel
    if (newUserpassMountPoint === undefined) {
        return;
    }

    // Prompt the user for the authentication username
    const newUserpassUsername = await vscode.window.showInputBox({ prompt: 'Enter Username', value: userpassLoginRequest.username });
    // If input was collected, cache the input, otherwise cancel
    if (newUserpassUsername === undefined) {
        return;
    }

    // Prompt the user for the authentication password
    const newUserpassPassword = await vscode.window.showInputBox({ password: true, prompt: 'Enter Password', value: userpassLoginRequest.password });
    // If input was collected, cache the input, otherwise cancel
    if (newUserpassPassword === undefined) {
        return;
    }

    // Cache the collected inputs
    userpassLoginRequest.mount_point = newUserpassMountPoint;
    userpassLoginRequest.username = newUserpassUsername;
    userpassLoginRequest.password = newUserpassPassword;

    vscode.window.vault.log('Logging in with username and password', 'person');
    const userpassLoginResult = await client.userpassLogin(userpassLoginRequest);
    return <VaultToken>{ id: userpassLoginResult.auth.client_token, renewable: userpassLoginResult.auth.renewable, ttl: userpassLoginResult.auth.lease_duration };
}
