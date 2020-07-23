'use strict';

import * as model from '../../model';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { CallableQuickPickItem } from './base';

async function login(client: nv.client): Promise<model.VaultToken> {
    const ldapLoginRequest = { mount_point: 'ldap', username: process.env.USER || process.env.USERNAME, password: undefined };

    // Prompt the user for the authentication mount point
    ldapLoginRequest.mount_point = await vscode.window.showInputBox({ prompt: 'Enter LDAP authentication mount point', value: ldapLoginRequest.mount_point });
    // If no username was collected
    if (!ldapLoginRequest.mount_point) {
        return undefined;
    }

    // Prompt the user for the authentication username
    ldapLoginRequest.username = await vscode.window.showInputBox({ prompt: 'Enter Username', value: ldapLoginRequest.username });
    // If no password was collected
    if (!ldapLoginRequest.username) {
        return undefined;
    }

    // Prompt the user for the authentication password
    ldapLoginRequest.password = await vscode.window.showInputBox({ password: true, prompt: 'Enter Password', value: ldapLoginRequest.password });
    // If no input was collected
    if (!ldapLoginRequest.password) {
        return undefined;
    }

    // Submit a login request
    const ldapLoginResult = await client.userpassLogin(ldapLoginRequest);
    // Parse the login response
    const token : model.VaultToken = { id: ldapLoginResult.auth.client_token, renewable: ldapLoginResult.auth.renewable, ttl: ldapLoginResult.auth.lease_duration };
    vscode.window.vault.log('Logging in with username and password', 'person');

    // Return the token (if defined)
    return token;
}

const ldap: CallableQuickPickItem = {
    label: 'LDAP',
    description: 'Authenticate via a username and password',
    callback: login
};

export default ldap;
