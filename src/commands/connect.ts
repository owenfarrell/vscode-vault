'use strict';

import * as login from './login';
import * as model from 'src/model';
import * as url from 'url';
import * as vscode from 'vscode';

import validator from 'validator';

function validateURL(userInput: string): string | undefined {
    // If the input is a valid URL, return undefined (no error), otherwise return an error message
    return validator.isURL(userInput, { require_tld: false }) ? undefined : 'Not a valid URL';
}

export default async function(reservedNames: string[] = []): Promise<model.VaultConnectionConfig> {
    // Prompt for the Vault endpoint
    const endpoint = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter the address of your vault server', validateInput: validateURL, value: process.env.VAULT_ADDR });
    // If no Vault endpoint was collected
    if (!endpoint) {
        return undefined;
    }

    // Prompt for the Vault namespace
    const namespace = await vscode.window.showInputBox({ ignoreFocusOut: true, placeHolder: 'leave blank for the root namespace', prompt: 'Enter the namespace of your vault tenant' });
    // If no Vault namespace was collected
    if (namespace === undefined) {
        return undefined;
    }

    // Create a URL object from the Vault endpoint
    const endpointUrl = new url.URL(endpoint);
    // Create an anonymous function that ensures names are unique
    const validateName = (userInput: string): string | undefined => {
        // If the input is included in the list of reserved names, return an error, otherwise undefined (no error)
        return reservedNames.indexOf(userInput) < 0 ? undefined : 'Vault names must be unique';
    };
    // If the default name is reserved, don't preload the input box
    const nameInputBoxValue = validateName(endpointUrl.host) ? undefined : endpointUrl.host;
    // Prompt for the friendly (display) name
    const name = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter the friendly name of your vault', validateInput: validateName, value: nameInputBoxValue });
    // If no friendly (display) name was collected
    if (!name) {
        return undefined;
    }

    // Show the list of authentication options
    const selectedItem = await vscode.window.showQuickPick(login.QUICK_PICK_LIST, { placeHolder: 'Select an authentication backend' });
    // If no authentication option was selected
    if (!selectedItem) {
        return undefined;
    }

    // Create a new Vault session config object
    return { endpoint, login: selectedItem.label, name, namespace };
}
