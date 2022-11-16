'use strict';

import * as commands from 'src/commands';
import * as model from 'src/model';
import * as vscode from 'vscode';

import { VaultServerTreeItem } from './server';
import { VaultTreeItem } from './treeitem';

export class VaultTreeDataProvider implements vscode.TreeDataProvider<VaultTreeItem> {
    //#region Attributes
    private _serverList: VaultServerTreeItem[] = [];
    private _onDidChangeTreeData = new vscode.EventEmitter<VaultTreeItem>();
    //#endregion

    //#region Constructors
    constructor(sessionList: model.VaultSession[] = []) {
        sessionList.forEach((element: model.VaultSession) => this._serverList.push(new VaultServerTreeItem(element)));
    }
    //#endregion

    //#region Getters and Setters
    get sessionList(): model.VaultSession[] {
        return this._serverList.map((element: VaultServerTreeItem) => element.session);
    }
    //#endregion

    //#region TreeDataProvider Implementation
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

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
            model.VaultWindow.INSTANCE.log(`Refreshing ${element.id}`);
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
    async connect(treeItem?: VaultServerTreeItem): Promise<VaultServerTreeItem> {
        // If no tree item was specified
        if (!treeItem) {
            const reservedNames: string[] = [];
            // Get the list of server IDs and session names
            this._serverList.forEach((element: VaultServerTreeItem) => {
                reservedNames.push(element.id);
                reservedNames.push(element.session.name);
            });
            // Establish a new session by connecting to a server
            const config = await commands.connect(reservedNames);
            // If a new session config was created
            if (config) {
                // Create a new session
                const session = new model.VaultSession(config);
                // Create a new tree item from the session
                treeItem = new VaultServerTreeItem(session);
                // Add the server to the list of top-level tree items
                this._serverList.push(treeItem);
                // Trigger a refresh of the paenl
                this._onDidChangeTreeData.fire();
            }
        }
        // If a tree item was provided or created
        if (treeItem) {
            // Log in to the session
            await treeItem.session.login();
        }
        // Return the resulting tree item
        return treeItem;
    }

    async disconnect(server: VaultServerTreeItem): Promise<void> {
        // Dispose of the server's session
        server.session.dispose();
        // Trigger a refresh
        this.refresh(server);
        vscode.window.showInformationMessage(`Disconnected from ${server.label}`);
    }

    async refresh(element: VaultTreeItem): Promise<VaultTreeItem[]> {
        // If refreshing the element changed the content
        if (await element.refresh() === true) {
            // Fire an event to trigger a refresh of the tree view
            this._onDidChangeTreeData.fire();
        }
        return undefined;
    }

    async remove(server: VaultServerTreeItem): Promise<void> {
        // Find the specified server in the list
        const index = this._serverList.indexOf(server);
        // If the element was found in the list
        if (index > -1) {
            // Remove the element
            this._serverList.splice(index, 1);
            vscode.window.showInformationMessage(`Removed ${server.label}`);
        }
        // Trigger a refresh of window
        this._onDidChangeTreeData.fire();
    }
    //#endregion
}
