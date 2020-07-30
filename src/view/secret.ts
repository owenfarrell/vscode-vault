'use strict';

import * as commands from 'src/commands';
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

    //#region VaultTreeItem Implementation
    async refresh(): Promise<boolean> {
        return this.parent.refresh();
    }
    //#endregion

    //#region Custom Command Methods
    async delete(): Promise<void> {
        // Delete the path
        return commands.delete(this.client, this.path);
    }

    async read(): Promise<void> {
        // Read the path
        return commands.read(this.client, this.path);
    }

    async write(): Promise<VaultTreeItem> {
        // Write the path
        return await commands.write(this.client, this.path) ? this : undefined;
    }
    //#endregion
}
