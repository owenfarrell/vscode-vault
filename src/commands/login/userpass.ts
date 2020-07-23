'use strict';

import * as model from '../../model';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { CallableQuickPickItem } from './base';

async function login(client: nv.client): Promise<model.VaultToken> {
    const userpassLoginRequest = { mount_point: 'userpass', username: process.env.USER || process.env.USERNAME, password: undefined };

    // Prompt the user for the authentication mount point
    userpassLoginRequest.mount_point = await vscode.window.showInputBox({ prompt: 'Enter userpass authentication mount point', value: userpassLoginRequest.mount_point });
    // If no username was collected
    if (!userpassLoginRequest.mount_point) {
        return undefined;
    }

    // Prompt the user for the authentication username
    userpassLoginRequest.username = await vscode.window.showInputBox({ prompt: 'Enter Username', value: userpassLoginRequest.username });
    // If no password was collected
    if (!userpassLoginRequest.username) {
        return undefined;
    }

    // Prompt the user for the authentication password
    userpassLoginRequest.password = await vscode.window.showInputBox({ password: true, prompt: 'Enter Password', value: userpassLoginRequest.password });
    // If no input was collected
    if (!userpassLoginRequest.password) {
        return undefined;
    }

    // Submit a login request
    const userpassLoginResult = await client.userpassLogin(userpassLoginRequest);
    // Parse the login response
    const token : model.VaultToken = { id: userpassLoginResult.auth.client_token, renewable: userpassLoginResult.auth.renewable, ttl: userpassLoginResult.auth.lease_duration };
    vscode.window.vault.log('Logging in with username and password', 'person');

    // Return the token (if defined)
    return token;
}

const userpass: CallableQuickPickItem = {
    label: 'Username & Password',
    description: 'Authenticate via a username and password',
    callback: login
};

export default userpass;
