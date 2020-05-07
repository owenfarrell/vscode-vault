'use strict';

import * as flat from 'flat';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

export default async function(client: nv.client, path: string): Promise<void> {
    const result = await client.read(path);
    const flattenedData: any = flat.flatten(result.data);
    const items: vscode.SecretQuickPickItem[] = [];
    for (const key in flattenedData) {
        items.push({ label: key, secretValue: flattenedData[key] });
    }
    const selectedItem = items.length === 1 ? items[0] : await vscode.window.showQuickPick(items, { placeHolder: 'Select an attribute' });
    if (selectedItem) {
        vscode.window.vault.clip(selectedItem.label, selectedItem.secretValue);
    }
}
