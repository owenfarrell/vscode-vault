'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import validator from 'validator';

const keyValuePairRegex: RegExp = /([\w_]+)=([^ \n]+)/g.compile();

interface UserInput {
    data: any;
    fieldCount: number;
}

function parseFields(input: string): UserInput {
    let data: any;
    if (validator.isJSON(input)) {
        vscode.window.vault.log('Parsing data as JSON');
        data = JSON.parse(input);
    }
    else {
        data = {};
        const regex: RegExp = /([\w_]+)=([^ \n]+)/g;
        let match: RegExpExecArray;
        while ((match = regex.exec(input)) !== null) {
            const key: string = match[1];
            const value: string = match[2];
            data[key] = value;
        }
    }
    const fieldCount: number = Object.keys(data).length;
    vscode.window.vault.log(`Parsed ${fieldCount} fields`);
    return { data: data, fieldCount: fieldCount };
}

export default async function(client: nv.client, path: string): Promise<boolean> {
    const pathValidator = (userInput: string) => userInput.startsWith(path) ? null : 'Not a child of this path';
    path = await vscode.window.showInputBox({ prompt: 'Enter path to write to Vault', validateInput: pathValidator, value: path });
    if (path) {
        const fieldValidator = (userInput: string) => validator.isJSON(userInput) || keyValuePairRegex.test(userInput) ? null : 'Must be JSON or key/value pairs';
        const userInput = await vscode.window.showInputBox({ prompt: 'Enter data to write', placeHolder: 'Enter JSON or key=value pairs', validateInput: fieldValidator });
        if (userInput) {
            const parsedInput = parseFields(userInput);
            if (parsedInput.fieldCount > 0) {
                await client.write(path, parsedInput);
                vscode.window.vault.log(`Successfully wrote ${parsedInput.fieldCount} fields to ${path}`, 'checklist');
            }
        }
    }
    return true;
}
