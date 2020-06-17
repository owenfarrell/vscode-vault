'use strict';

import * as vscode from 'vscode';

import { VaultTreeItem } from './treeitem';

export class VaultShellTreeItem extends VaultTreeItem {
    contextValue = 'shell';

    //#region Constructors
    constructor(label: string, parent: VaultTreeItem) {
        super(label, parent);
        this.iconPath = this._defaultIcon = new vscode.ThemeIcon('folder-opened');
        this.path = parent.path + label;
    }
    //#endregion

    //#region VaultTreeItem Implementation
    async refresh(): Promise<boolean> {
        return false;
    }
    //#endregion
}
