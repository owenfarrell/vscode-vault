'use strict';

import * as path from 'path';

import { VaultTreeItem } from './treeitem';

export class VaultShellTreeItem extends VaultTreeItem {
    contextValue = 'shell';

    //#region Constructors
    constructor(label: string, parent: VaultTreeItem) {
        super(label, parent);
        this.iconPath = this._defaultIconPath = {
            light: path.join(__dirname, '..', 'resources', 'light', 'tree', 'folder.svg'),
            dark: path.join(__dirname, '..', 'resources', 'dark', 'tree', 'folder.svg')
        };
        this.path = parent.path + label;
    }
    //#endregion

    //#region VaultTreeItem Implementation
    async refresh(): Promise<boolean> {
        return false;
    }
    //#endregion
}
