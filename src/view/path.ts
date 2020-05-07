'use strict';

import { VaultTreeItem } from './treeitem';

import * as commands from '../commands';

import * as HTTPStatusCodes from 'http-status-codes';
import * as path from 'path';
import * as vscode from 'vscode';
import { VaultSecretTreeItem } from './secret';

export class VaultPathTreeItem extends VaultTreeItem {

    contextValue = 'path';

    //#region Constructors
    constructor(label: string, parent: VaultTreeItem) {
        super(label, parent);
        this.iconPath = this._defaultIconPath = {
            light: path.join(__dirname, '..', 'resources', 'light', 'folder.svg'),
            dark: path.join(__dirname, '..', 'resources', 'dark', 'folder.svg')
        };
        this.path = parent.path + label;
    }
    //#endregion

    //#region VaultTreeItem Implementation
    async refresh(): Promise<any> {
        vscode.window.vault.log(`Refreshing path ${this.path}`);
        try {
            const client = this.getClient();
            const pathList = await commands.list(client, this.path);

            this.children = pathList.map((element: string) => {
                const ChildTreeItem = element.endsWith('/') ? VaultPathTreeItem : VaultSecretTreeItem;
                return new ChildTreeItem(element, this);
            });
        }
        catch (err) {
            this.children = [];
            if (err.response?.statusCode === HTTPStatusCodes.NOT_FOUND && err.response?.body?.errors?.length === 0) {
                // Just means its empty
            }
            else {
                this.iconPath = VaultTreeItem.WARNING_ICON;
                this.tooltip = err.toString().trim();
            }
        }
        return true;
    }
    //#endregion

    //#region Custom Command Methods
    async write(): Promise<boolean> {
        const client = this.getClient();
        return commands.write(client, this.path);
    }
    //#endregion
}
