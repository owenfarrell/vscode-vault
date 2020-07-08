'use strict';

import * as model from '../../model';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { CallableQuickPickItem } from './base';

const ldapLoginRequest = { mount_point: 'ldap', username: process.env.USER || process.env.USERNAME, password: undefined };

async function login(client: nv.client): Promise<model.VaultToken> {
    // Prompt the user for the authentication mount point
    const newLdapMountPoint = await vscode.window.showInputBox({ prompt: 'Enter LDAP authentication mount point', value: ldapLoginRequest.mount_point });
    // If no username was collected
    if (!newLdapMountPoint) {
        return undefined;
    }

    // Prompt the user for the authentication username
    const newLdapUsername = await vscode.window.showInputBox({ prompt: 'Enter Username', value: ldapLoginRequest.username });
    // If no password was collected
    if (!newLdapUsername) {
        return undefined;
    }

    // Prompt the user for the authentication password
    const newLdapPassword = await vscode.window.showInputBox({ password: true, prompt: 'Enter Password', value: ldapLoginRequest.password });
    // If no input was collected
    if (!newLdapPassword) {
        return undefined;
    }

    // Cache the collected inputs
    ldapLoginRequest.mount_point = newLdapMountPoint;
    ldapLoginRequest.username = newLdapUsername;
    ldapLoginRequest.password = newLdapPassword;
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
