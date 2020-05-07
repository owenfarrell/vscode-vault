
'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

export default async function(client: nv.client, path?: string): Promise<string[]> {
    vscode.window.vault.log(`Listing ${path}`);
    let children: string[] = [];
    if (path) {
        const listResponse = await client.list(path);
        children = listResponse.data.keys;
    }
    return children;
}
