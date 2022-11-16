'use strict';

import * as model from 'src/model';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

import validator from 'validator';

const KEY_VALUE_PAIR: RegExp = new RegExp('([\\w_]+)=([^ ]+)', 'g');
const KEY_VALUE_PAIR_LIST: RegExp = new RegExp(`^((${KEY_VALUE_PAIR.source}) *)+$`);

interface UserInput {
    data: any;
    fieldCount: number;
}

function parseFields(input: string): UserInput {
    let data: any;
    let fieldCount: number;
    // If the specified value is valid JSON
    if (validator.isJSON(input)) {
        // Parse the specified value as JSON
        data = JSON.parse(input);
        // Get the number of fields parsed
        fieldCount = Object.keys(data).length;
    }
    else {
        // Create an empty object
        data = {};
        // Initialize the field count counter
        fieldCount = 0;
        // Create a clone of the validation regex
        const regex: RegExp = new RegExp(KEY_VALUE_PAIR.source, KEY_VALUE_PAIR.flags);
        let match: RegExpExecArray;
        // While more regex matches exist
        while ((match = regex.exec(input)) !== null) {
            // Extract the key from the first capture group
            const key: string = match[1];
            // Extract the key from the second capture group
            const value: string = match[2];
            // Add the key/value pair to the object
            data[key] = value;
            // Increment the field count counter
            fieldCount++;
        }
    }
    model.VaultWindow.INSTANCE.log(`Parsed ${fieldCount} fields`);
    return data;
}

function validateFields(userInput: string) {
    // If the input is valid JSON or key/value pairs, return null (no error), otherwise return an error message
    return validator.isJSON(userInput) || userInput.match(KEY_VALUE_PAIR_LIST) ? null : 'Must be JSON or key/value pairs';
}

export default async function(client: nv.client, path: string, mountPoint?: string): Promise<boolean> {
    let requiresRefresh = false;
    // If a mount point is specified
    if (mountPoint) {
        // If the specified path isn't a child of the mount point, don't preload the input box
        const pathInputBoxValue = path.startsWith(mountPoint) ? path : mountPoint;
        // Create an anonymous function that ensures writes to the same mount point
        const pathValidator = (userInput: string) => userInput.startsWith(mountPoint) ? null : 'Path is part of a different mount point';
        // Prompt for the path
        path = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter path to write to Vault', validateInput: pathValidator, value: pathInputBoxValue, valueSelection: [path.length, path.length] });
    }
    // If no path was collected
    if (!path) {
        return undefined;
    }

    // Prompt for the fields to write
    const dataToWrite = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter data to write', placeHolder: 'Enter JSON or key=value pairs', validateInput: validateFields });
    // If no fields to write were collected
    if (!dataToWrite || dataToWrite.length === 0) {
        return undefined;
    }

    // Parse the fields
    const parsedInput = parseFields(dataToWrite);
    // Write the fields to the path
    await client.write(path, parsedInput);
    // Flag the need for a refresh of the tree view
    requiresRefresh = true;
    model.VaultWindow.INSTANCE.log(`Successfully wrote to ${path}`, 'checklist');

    return requiresRefresh;
}
