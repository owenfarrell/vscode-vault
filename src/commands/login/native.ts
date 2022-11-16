'use strict';

import * as fs from 'fs';
import * as nv from 'node-vault';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

import { CallableQuickPickItem } from './base';
import { VaultToken } from 'src/model/token';
import { VaultWindow } from 'src/model/window';

const nativeTokenPath: string = path.resolve(os.homedir(), '.vault-token');
let nativeToken: string = process.env.VAULT_TOKEN;
let nativeTokenTime: Date = new Date(nativeToken ? Date.now() - (process.uptime() * 1000) : 0);

async function login(client: nv.client): Promise<VaultToken> {
    // If a token file exists
    if (fs.existsSync(nativeTokenPath)) {
        // Get the last modified timestamp of the token file
        const lastModified: Date = fs.statSync(nativeTokenPath).mtime;
        VaultWindow.INSTANCE.log(`Comparing last modified native token time (${nativeTokenTime}) to token file (${lastModified})`);
        // If the last modified timestamp of the token file is more recent than the most-recently cached token value
        if (lastModified > nativeTokenTime) {
            // Update the cached token value and timestamp
            nativeTokenTime = lastModified;
            // TODO Auto-detect character encoding
            nativeToken = fs.readFileSync(nativeTokenPath, 'utf-8');
        }
    }

    // Prompt for the Vault token
    const userInput = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter Vault token', value: nativeToken });
    // If the Vault token was collected
    if (!userInput) {
        return undefined;
    }

    // Cache the collected inputs
    client.token = userInput;
    // Submit a lookup request
    const tokenLookupResult = await client.tokenLookupSelf();
    // Parse the lookup response
    const token: VaultToken = { id: tokenLookupResult.data.id, renewable: tokenLookupResult.data.renewable, ttl: tokenLookupResult.data.ttl };
    VaultWindow.INSTANCE.log('Logging in with native token', 'key');

    // Return the token (if defined)
    return token;
}

const native: CallableQuickPickItem = {
    label: 'Native',
    description: 'Authenticate via an externally generated token',
    callback: login
};

export default native;
