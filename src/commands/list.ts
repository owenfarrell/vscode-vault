'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

export default async function(client: nv.client, path: string): Promise<string[]> {
    // List the path
    const listResponse = await client.list(path);
    // Parse the list of child paths
    const children = listResponse.data.keys;
    vscode.window.vault.log(`Listing ${path}`);
    return children;
}
