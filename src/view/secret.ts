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
            light: path.join(__dirname, '..', 'resources', 'light', 'document.svg'),
            dark: path.join(__dirname, '..', 'resources', 'dark', 'document.svg')
        };
        this.path = parent.path + label;
    }
    //#endregion

    //#region Custom Command Methods
    async delete(): Promise<void> {
        const client = this.getClient();
        return commands.delete(client, this.path);
    }

    async read(): Promise<void> {
        const client = this.getClient();
        return commands.read(client, this.path);
    }

    async write(): Promise<boolean> {
        const client = this.getClient();
        return commands.write(client, this.path);
    }
    //#endregion
}