'use strict';

import * as commands from 'src/commands';
import * as HTTPStatusCodes from 'http-status-codes';

import { PATH_SEPARATOR } from 'src/util';
import { VaultSecretTreeItem } from './secret';
import { VaultShellTreeItem } from './shell';
import { VaultTreeItem } from './treeitem';

export class VaultPathTreeItem extends VaultShellTreeItem {
    contextValue = 'path';

    //#region VaultTreeItem Implementation
    async refresh(): Promise<boolean> {
        try {
            // List the path
            const pathList = await commands.list(this.client, this.path);
            // Update the list of children based on the list of paths
            this.children = pathList.map((element: string) => {
                // If the path ends with a slash, create a child path, otherwise create a child secret
                const ChildTreeItem = element.endsWith(PATH_SEPARATOR) ? VaultPathTreeItem : VaultSecretTreeItem;
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
    async write(): Promise<VaultTreeItem> {
        let treeItem: VaultTreeItem = this;
        // While the tree item has a parent with a path
        while (treeItem.parent.path.length > 0) {
            // Navigate up to the parent
            treeItem = treeItem.parent;
        }
        // Write the path
        return await commands.write(this.client, this.path, treeItem.path) === true ? treeItem : undefined;
    }
    //#endregion
}
