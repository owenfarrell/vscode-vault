'use strict';

import * as commands from '../commands';
import * as vscode from 'vscode';

import { VaultServerTreeItem } from './server';
import { VaultTreeItem } from './treeitem';

export class VaultTreeDataProvider implements vscode.TreeDataProvider<VaultTreeItem> {
    //#region Attributes
    private _serverList: VaultServerTreeItem[] = [];
    private _onDidChangeTreeData = new vscode.EventEmitter<VaultTreeItem>();
    //#endregion

    //#region TreeDataProvider Implementation
    public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    getChildren(element?: VaultTreeItem): vscode.ProviderResult<VaultTreeItem[]> {
        let providerResult: vscode.ProviderResult<VaultTreeItem[]>;
        // If no element is selected in the tree view
        if (element === undefined) {
            // Return the top level elements of the tree view
            providerResult = this._serverList;
        }
        // If the selected element has no children defined
        else if (element.children === undefined) {
            // If the selected element has no children defined
            vscode.window.vault.log(`Refreshing ${element.id}`);
            providerResult = this.refresh(element);
        }
        // If the selected element has children defined
        else {
            // Return the children
            providerResult = element.children;
        }
        return providerResult;
    }

    getParent(element: VaultTreeItem): VaultTreeItem {
        // Return the parent
        return element.parent;
    }

    getTreeItem(element: VaultTreeItem): vscode.TreeItem {
        // Return the element
        return element;
    }
    //#endregion

    //#region Custom Command Methods
    async connect(treeItem?: VaultServerTreeItem): Promise<void> {
        // Establish a new session by connecting to a server
        const session = await commands.connect(treeItem?.session);
        // If a new session was created
        if (session && treeItem === undefined) {
            // Create a new tree item from the session
            treeItem = new VaultServerTreeItem(session);
            // Add the server to the list of top-level tree items
            this._serverList.push(treeItem);
        }
        // Trigger a refresh of the (new) server
        this.refresh(treeItem);
    }

    async disconnect(server: VaultServerTreeItem): Promise<void> {
        // If the server is connected
        if (server.connected) {
            // Dispose of the server's session
            server.session.dispose();
            // Trigger a refresh
            this.refresh(server);
            vscode.window.showInformationMessage(`Disconnected from ${server.id}`);
        }
        else {
            // Find the specified server in the list
            const index = this._serverList.indexOf(server);
            // If the element was found in the list
            if (index > -1) {
                // Remove the element
                this._serverList.splice(index, 1);
                vscode.window.showInformationMessage(`Removed ${server.id}`);
            }
            // Trigger a refresh of window
            this._onDidChangeTreeData.fire();
        }
    }

    async refresh(element: VaultTreeItem): Promise<VaultTreeItem[]> {
        // If refreshing the element changed the content
        if (await element.refresh() === true) {
            // Fire an event to trigger a refresh of the tree view
            this._onDidChangeTreeData.fire();
        }
        return undefined;
    }
    //#endregion
}
