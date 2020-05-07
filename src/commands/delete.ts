'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

export default async function(client: nv.client, path: string): Promise<void> {
    await client.delete(path);
    vscode.window.vault.log(`Successfully deleted ${path}`, 'trashcan');
}
