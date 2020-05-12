'use strict';

import * as flat from 'flat';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

interface SecretQuickPickItem extends vscode.QuickPickItem {
    secretValue: string;
}

export default async function(client: nv.client, path: string): Promise<void> {
    // Read the path
    const result = await client.read(path);
    // Flatten the data (if it is an object) in to a dot-separated list of key/value pairs
    const flattenedData: any = flat.flatten(result.data);
    // Create a list of quick pick items for the the flattened data
    const items: SecretQuickPickItem[] = [];
    // For each mount point
    for (const key in flattenedData) {
        // Create a new quick pick item from the key/value pair
        items.push({ label: `$(symbol-${typeof flattenedData[key]}) ${key}`, secretValue: flattenedData[key] });
    }
    // If only one quick pick item exists, automatically select it, otherwise prompt for the item to pick
    const selectedItem = items.length === 1 ? items[0] : await vscode.window.showQuickPick(items, { placeHolder: 'Select an attribute' });
    // If an item was (automatically or manually) selected
    if (selectedItem) {
        // Clip the value of the selected item
        vscode.window.vault.clip(selectedItem.label, selectedItem.secretValue);
    }
}
