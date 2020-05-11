'use strict';

import * as fs from 'fs';
import * as nv from 'node-vault';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

import { VaultToken } from '../../model';

const nativeTokenPath: string = path.resolve(os.homedir(), '.vault-token');
let nativeToken: string = process.env.VAULT_TOKEN;
let nativeTokenTime: Date = new Date(nativeToken ? Date.now() - (process.uptime() * 1000) : 0);

export default async function(client: nv.client): Promise<VaultToken> {
    // If a token file exists
    if (fs.existsSync(nativeTokenPath)) {
        // Get the last modified timestamp of the token file
        const lastModified: Date = fs.statSync(nativeTokenPath).mtime;
        vscode.window.vault.log(`Comparing last modified native token time (${nativeTokenTime}) to token file (${lastModified})`);
        // If the last modified timestamp of the token file is more recent than the most-recently cached token value
        if (lastModified > nativeTokenTime) {
            // Update the cached token value and timestamp
            nativeTokenTime = lastModified;
            // TODO Auto-detect character encoding
            nativeToken = fs.readFileSync(nativeTokenPath, 'utf-8');
        }
    }

    let token: VaultToken;
    // Prompt for the vault token
    const userInput = await vscode.window.showInputBox({ prompt: 'Enter Vault token', value: nativeToken });
    // If no input was collected, cancel
    if (userInput) {
        // Set the token to the client
        client.token = userInput;
        vscode.window.vault.log('Logging in with native token', 'key');
        // Lookup the token
        const tokenLookupResult = await client.tokenLookupSelf();
        // Cache the token for future use
        token = { id: tokenLookupResult.data.id, renewable: tokenLookupResult.data.renewable, ttl: tokenLookupResult.data.ttl };
    }
    return token;
}
