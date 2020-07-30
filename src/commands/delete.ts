'use strict';

import * as model from '../model';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

export default async function(client: nv.client, path: string): Promise<void> {
    // Show an error message and prompt the user for an action
    const selectedAction = await vscode.window.showWarningMessage(`Are your sure you want to delete ${path}? This action CANNOT be undone.`, 'Delete');
    // If the (1) action is selected, execute the associated command
    if (selectedAction) {
        // Delete the specified path
        await client.delete(path);
        model.VaultWindow.INSTANCE.log(`Successfully deleted ${path}`, 'trashcan');
    }
}
