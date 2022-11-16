'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { CallableQuickPickItem } from './base';
import { VaultToken } from 'src/model/token';
import { VaultWindow } from 'src/model/window';

async function login(client: nv.client): Promise<VaultToken> {
    const ldapLoginRequest = { mount_point: 'ldap', username: process.env.USER || process.env.USERNAME, password: undefined };

    // Prompt the user for the authentication mount point
    ldapLoginRequest.mount_point = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter LDAP authentication mount point', value: ldapLoginRequest.mount_point });
    // If no username was collected
    if (!ldapLoginRequest.mount_point) {
        return undefined;
    }

    // Prompt the user for the authentication username
    ldapLoginRequest.username = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter Username', value: ldapLoginRequest.username });
    // If no password was collected
    if (!ldapLoginRequest.username) {
        return undefined;
    }

    // Prompt the user for the authentication password
    ldapLoginRequest.password = await vscode.window.showInputBox({ ignoreFocusOut: true, password: true, prompt: 'Enter Password', value: ldapLoginRequest.password });
    // If no input was collected
    if (!ldapLoginRequest.password) {
        return undefined;
    }

    // Submit a login request
    const ldapLoginResult = await client.userpassLogin(ldapLoginRequest);
    // Parse the login response
    const token : VaultToken = { id: ldapLoginResult.auth.client_token, renewable: ldapLoginResult.auth.renewable, ttl: ldapLoginResult.auth.lease_duration };
    VaultWindow.INSTANCE.log('Logging in with username and password', 'person');

    // Return the token (if defined)
    return token;
}

const ldap: CallableQuickPickItem = {
    label: 'LDAP',
    description: 'Authenticate via a username and password',
    callback: login
};

export default ldap;
