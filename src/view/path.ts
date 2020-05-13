'use strict';

import * as commands from '../commands';
import * as HTTPStatusCodes from 'http-status-codes';
import * as path from 'path';

import { VaultSecretTreeItem } from './secret';
import { VaultTreeItem } from './treeitem';

export class VaultPathTreeItem extends VaultTreeItem {
    contextValue = 'path';

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
        try {
            // Get the client stub
            const client = this.getClient();
            // List the path
            const pathList = await commands.list(client, this.path);
            // Update the list of children based on the list of paths
            this.children = pathList.map((element: string) => {
                // If the path ends with a slash, create a child path, otherwise create a child secret
                const ChildTreeItem = element.endsWith('/') ? VaultPathTreeItem : VaultSecretTreeItem;
                // Instantiate a new child element
                return new ChildTreeItem(element, this);
            });
        }
        catch (err) {
            // Clear the list of children
            this.children = [];
            // If the response status code is a 404, but the response body indicates no error
            if (err.response?.statusCode === HTTPStatusCodes.NOT_FOUND && err.response?.body?.errors?.length === 0) {
                // That's just Vault's way of saying that there are no children
                // If the parent is a path
                if (this.parent.contextValue === this.contextValue) {
                    // Refresh the parent path
                    return this.parent.refresh();
                }
            }
            else {
                // Update the icon to indicate an error
                this.iconPath = VaultTreeItem.WARNING_ICON;
                // Update the tooltip to include the error message
                this.tooltip = err.toString().trim();
            }
        }
        return true;
    }
    //#endregion

    //#region Custom Command Methods
    async write(): Promise<boolean> {
        // Get the client stub
        const client = this.getClient();
        // Write the path
        return commands.write(client, this.path);
    }
    //#endregion
}
