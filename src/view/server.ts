'use strict';

import * as adaptors from '../adaptors';
import * as model from '../model';
import * as nv from 'node-vault';
import * as path from 'path';
import * as vscode from 'vscode';

import { VaultPathTreeItem } from './path';
import { VaultTreeItem } from './treeitem';

export class VaultServerTreeItem extends VaultTreeItem {
    private static readonly CONNECTED_CONTEXT = 'connection';
    private static readonly DISCONNECTED_CONTEXT = 'server';
    public readonly session: model.VaultSession

    //#region Constructors
    constructor(session: model.VaultSession) {
        super(session.name);
        this.children = [];
        this.contextValue = VaultServerTreeItem.DISCONNECTED_CONTEXT;
        this.iconPath = this._defaultIconPath = {
            light: path.join(__dirname, '..', 'resources', 'light', 'tree', 'server.svg'),
            dark: path.join(__dirname, '..', 'resources', 'dark', 'tree', 'server.svg')
        };
        this.id = this.id.replace(/\/?$/, '/');
        this.session = session;
        // TODO Re-add support for custom options
    }
    //#endregion

    //#region Getters and Setters
    public get connected(): boolean {
        return this.session.client?.token !== undefined;
    }
    //#endregion

    //#region VaultTreeItem Implementation
    getClient(): nv.client {
        return this.session.client;
    }

    async refresh(): Promise<boolean> {
        vscode.window.vault.log(`Refreshing ${this.id}`);
        // If the Vault client is not connected
        if (!this.connected) {
            vscode.window.vault.log(`Resetting ${this.id} session`);
            // Clear the list of children
            this.children = [];
            // Capture the existing context value
            const oldContextValue = this.contextValue;
            // Update the context value
            this.contextValue = VaultServerTreeItem.DISCONNECTED_CONTEXT;
            // Return true if the context has switched
            return oldContextValue !== this.contextValue;
        }

        // If the server is not connected
        if (this.contextValue === VaultServerTreeItem.DISCONNECTED_CONTEXT) {
            // Update the context value
            this.contextValue = VaultServerTreeItem.CONNECTED_CONTEXT;
            // Map the list of mounts to a list of tree items
            this.children = this.session.mountPoints.map((element: string) => new VaultPathTreeItem(element, this));
            // If no list of children or no children are defined
            if (this.children === undefined || this.children.length === 0) {
                // Show an error message and prompt the user for an action
                vscode.window.showErrorMessage('Unable to list mounts', 'Browse...')
                    // If the (1) action is selected, execute the associated command
                    .then((selectedAction: string) => selectedAction && vscode.commands.executeCommand('vault.browse', this));
            }
        }
        return true;
    }
    //#endregion

    //#region Custom Command Methods
    async browse(): Promise<VaultPathTreeItem> {
        // Prompt for the path
        let browseablePath = await vscode.window.showInputBox({ prompt: 'Enter path to browse' });
        // If no path was collected
        if (!browseablePath) {
            return undefined;
        }

        // Remove any leading slashes from the path and add a trailing slash to the path if it isn't already there
        browseablePath = browseablePath.replace(/^\/+/, '').replace(/\/?$/, '/');
        // Prompt for the secrets engine
        const adaptor = await vscode.window.showQuickPick(adaptors.QUICK_PICK_LIST, { placeHolder: 'Select engine type' });
        // If no secrets engine was collected
        if (!adaptor) {
            return undefined;
        }

        // Add the mount using the adaptor for the selected engine
        this.session.mount(browseablePath, adaptor);
        // Create a new tree item for the path
        const treeItem = new VaultPathTreeItem(browseablePath, this);
        // Add the tree item to the list of children
        this.children.push(treeItem);
        // If this tree item is currently empty
        if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
            // Expand the tree item to display the new child
            this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        }
        return treeItem;
    }
    //#endregion
}
