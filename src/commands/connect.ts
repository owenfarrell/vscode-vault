'use strict';

import { VaultSession } from '../model';
import * as login from './login';

import { URL } from 'url';
import validator from 'validator';
import * as vscode from 'vscode';

const authenticationItems: vscode.CallableQuickPickItem[] = [
    { label: 'Native', description: 'Authenticate via an externally generated token', callback: login.native },
    { label: 'GitHub', description: 'Authenticate via a GitHub personal access token', callback: login.github },
    { label: 'Username & Password', description: 'Authenticate via a username and password', callback: login.userpass }
];

function validateURL(userInput: string): string | undefined {
    return validator.isURL(userInput, { require_tld: false }) ? undefined : 'Not a valid URL';
}

export default async function(): Promise<VaultSession> {
    let endpoint = await vscode.window.showInputBox({ prompt: 'Enter the address of your vault server', validateInput: validateURL, value: process.env.VAULT_ADDR });
    if (endpoint === undefined) {
        return;
    }
    // Remove any trailing slash from the input
    endpoint = endpoint.replace(/\/$/, '');

    const endpointUrl = new URL(endpoint);
    const name = await vscode.window.showInputBox({ prompt: 'Enter the friendly name of your vault', value: endpointUrl.host });
    if (name === undefined) {
        return;
    }

    // Show the list of authentication options
    const selectedItem = await vscode.window.showQuickPick(authenticationItems, { placeHolder: 'Select an authentication backend' });
    if (selectedItem === undefined) {
        return;
    }

    const session = new VaultSession(name);
    session.client.endpoint = endpoint;

    const token = await selectedItem.callback(session.client);
    if (token === undefined) {
        return;
    }

    session.cacheToken(token);
    vscode.window.vault.log(`Connected to ${endpointUrl}`, 'shield');

    return session;
}
