'use strict';

import * as flat from 'flat';
import * as model from 'src/model';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

interface SecretQuickPickItem extends vscode.QuickPickItem {
    key: string
    secretValue: string;
}

export default async function(client: nv.client, path: string): Promise<void> {
    // Read the path
    const result = await client.read(path);
    // Flatten the data (if it is an object) in to a dot-separated list of key/value pairs
    const flattenedData: any = flat.flatten(result.data);
    // Create a list of quick pick items for the the flattened data
    const items: SecretQuickPickItem[] = [];
    // For each field
    for (const key in flattenedData) {
        // Get the value of the field
        const value = flattenedData[key];
        // Create a new quick pick item from the key/value pair
        items.push({ label: `$(symbol-${typeof value}) ${key}`, key: key, secretValue: value });
    }
    // If only one quick pick item exists, automatically select it, otherwise prompt for the item to pick
    const selectedItem = items.length === 1 ? items[0] : await vscode.window.showQuickPick(items, { placeHolder: 'Select an attribute' });
    // If an item was (automatically or manually) selected
    if (selectedItem) {
        // Clip the value of the selected item
        model.VaultWindow.INSTANCE.clip(selectedItem.key, selectedItem.secretValue);
    }
}
