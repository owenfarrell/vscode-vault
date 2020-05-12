'use strict';

import * as commands from '../commands';
import * as path from 'path';
import * as vscode from 'vscode';

import { VaultTreeItem } from './treeitem';

export class VaultSecretTreeItem extends VaultTreeItem {
    contextValue = 'secret';

    //#region Constructors
    constructor(label: string, parent: VaultTreeItem) {
        super(label, parent, vscode.TreeItemCollapsibleState.None);
        this.iconPath = this._defaultIconPath = {
            light: path.join(__dirname, '..', 'resources', 'light', 'tree', 'secret.svg'),
            dark: path.join(__dirname, '..', 'resources', 'dark', 'tree', 'secret.svg')
        };
        this.path = parent.path + label;
    }
    //#endregion

    //#region Custom Command Methods
    async delete(): Promise<void> {
        // Get the client stub
        const client = this.getClient();
        // Delete the path
        return commands.delete(client, this.path);
    }

    async read(): Promise<void> {
        // Get the client stub
        const client = this.getClient();
        // Read the path
        return commands.read(client, this.path);
    }

    async write(): Promise<boolean> {
        // Get the client stub
        const client = this.getClient();
        // Write the path
        return commands.write(client, this.path);
    }
    //#endregion
}
