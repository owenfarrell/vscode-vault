'use strict';

import * as login from './login';
import * as vscode from 'vscode';

import { URL } from 'url';
import validator from 'validator';
import { VaultSession } from '../model';

function validateURL(userInput: string): string | undefined {
    // If the input is a valid URL, return null (no error), otherwise return an error message
    return validator.isURL(userInput, { require_tld: false }) ? undefined : 'Not a valid URL';
}

export default async function(session?: VaultSession): Promise<VaultSession> {
    // If creating a new session
    if (session === undefined) {
        // Prompt for the Vault endpoint
        const endpoint = await vscode.window.showInputBox({ prompt: 'Enter the address of your vault server', validateInput: validateURL, value: process.env.VAULT_ADDR });
        // If the Vault endpoint was collected
        if (endpoint) {
            // Create a URL object from the Vault endpoint
            const endpointUrl = new URL(endpoint);
            // Prompt for the friendly (display) name
            const name = await vscode.window.showInputBox({ prompt: 'Enter the friendly name of your vault', value: endpointUrl.host });
            // If the friendly (display) name was collected
            if (name) {
                // Create a new Vault session object
                session = new VaultSession(name, endpointUrl);
            }
        }
    }
    // If using an existing session, or a newly created session
    if (session) {
        // Show the list of authentication options
        const selectedItem = await vscode.window.showQuickPick(login.AUTHENTICATION_ITEMS, { placeHolder: 'Select an authentication backend' });
        // If an authentication option was selected
        if (selectedItem) {
            // Call the selected authentication function
            const token = await selectedItem.callback(session.client);
            // If a token was collected
            if (token) {
                // Cache the token
                session.cacheToken(token);
                vscode.window.vault.log(`Connected to ${session.client.endpoint}`, 'shield');
            }
        }
    }
    return session;
}
