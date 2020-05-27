'use strict';

import * as login from './login';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { VaultSession, VaultToken } from '../model';

import { URL } from 'url';
import validator from 'validator';

interface CallableQuickPickItem extends vscode.QuickPickItem {
    callback(client: nv.client): Promise<VaultToken>;
}

const authenticationItems: CallableQuickPickItem[] = [
    { label: 'Native', description: 'Authenticate via an externally generated token', callback: login.native },
    { label: 'GitHub', description: 'Authenticate via a GitHub personal access token', callback: login.github },
    { label: 'Username & Password', description: 'Authenticate via a username and password', callback: login.userpass }
];

function validateURL(userInput: string): string | undefined {
    // If the input is a valid URL, return null (no error), otherwise return an error message
    return validator.isURL(userInput, { require_tld: false }) ? undefined : 'Not a valid URL';
}

export default async function(): Promise<VaultSession> {
    let session: VaultSession;
    // Prompt for the Vault endpoint
    let endpoint = await vscode.window.showInputBox({ prompt: 'Enter the address of your vault server', validateInput: validateURL, value: process.env.VAULT_ADDR });
    // If the Vault endpoint was collected
    if (endpoint) {
        // Remove any trailing slash from the input
        endpoint = endpoint.replace(/\/$/, '');
        // Create a URL object from the Vault endpoint
        const endpointUrl = new URL(endpoint);
        // Prompt for the friendly (display) name
        const name = await vscode.window.showInputBox({ prompt: 'Enter the friendly name of your vault', value: endpointUrl.host });
        // If the friendly (display) name was collected
        if (name) {
            // Show the list of authentication options
            const selectedItem = await vscode.window.showQuickPick(authenticationItems, { placeHolder: 'Select an authentication backend' });
            // If an authentication option was selected
            if (selectedItem) {
                // Create a new Vault session object
                session = new VaultSession(name, endpointUrl);
                // Call the selected authentication function
                const token = await selectedItem.callback(session.client);
                // If a token was collected
                if (token) {
                    // Cache the token
                    session.cacheToken(token);
                    vscode.window.vault.log(`Connected to ${endpointUrl}`, 'shield');
                }
            }
        }
    }
    return session;
}
