'use strict';

import * as adaptors from '../adaptors';
import * as model from '../model';
import * as nv from 'node-vault';
import * as path from 'path';
import * as vscode from 'vscode';

import { VaultPathTreeItem } from './path';
import { VaultShellTreeItem } from './shell';
import { VaultTreeItem } from './treeitem';

const ANY_LEADING_SLASHES = /^\/+/;
const OPTIONAL_TRAILING_SLASH = /\/?$/;
const PATH_SEGMENT = /[^\\/]+\/?/g;

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
        this.id = this.id.replace(OPTIONAL_TRAILING_SLASH, '/');
        this.session = session;
        // TODO Re-add support for custom options
    }
    //#endregion

    //#region Getters and Setters
    get client(): nv.client {
        return this.session.client;
    }

    public get connected(): boolean {
        return this.session.client?.token !== undefined;
    }
    //#endregion

    //#region VaultTreeItem Implementation
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
            this.session.mountPoints.sort().forEach((element: string) => this.expand(element));
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
    async browse(): Promise<VaultTreeItem> {
        // Prompt for the path
        const browseablePath = await vscode.window.showInputBox({ prompt: 'Enter path to browse' });
        // If no path was collected
        if (!browseablePath) {
            return undefined;
        }

        // Remove any leading slashes from the path and add a trailing slash to the path if it isn't already there
        const path = browseablePath.replace(ANY_LEADING_SLASHES, '').replace(OPTIONAL_TRAILING_SLASH, '/');
        // Prompt for the secrets engine
        const adaptor = await vscode.window.showQuickPick(adaptors.QUICK_PICK_LIST, { placeHolder: 'Select engine type' });
        // If no secrets engine was collected
        if (!adaptor) {
            return undefined;
        }

        // Add the mount using the adaptor for the selected engine
        this.session.mount(path, adaptor);
        // Expand the path in to a hierarchy
        this.expand(path);
    }
    //#endregion

    //#region User Interface Helper Methods
    private expand(path: string): VaultTreeItem {
        // Track the last-known segment that already exists
        let refreshTreeItem: VaultTreeItem = this;
        // Track the last-known-parentx
        let parentTreeItem: VaultTreeItem = this;
        // Split the path in to segments
        const pathSegments = path.match(PATH_SEGMENT);
        // For each segment
        pathSegments.forEach((label: string, index: number) => {
            let childTreeItem = parentTreeItem.getChild(label);
            // If a child item for this segment already exists
            if (childTreeItem) {
                // Update the refresh item reference
                refreshTreeItem = childTreeItem;
            }
            // If no child item for this segment already exists
            else {
                // Determine the child tree item type (path items are reserved for leaf nodes)
                const ChildTreeItemType = index === pathSegments.length - 1 ? VaultPathTreeItem : VaultShellTreeItem;
                // Create a new child tree itme
                childTreeItem = new ChildTreeItemType(label, parentTreeItem);
                // Add the child to the parent
                parentTreeItem.addChild(childTreeItem);
            }
            // Update the parent reference
            parentTreeItem = childTreeItem;
        });
        // Return the deepest tree item that already existed
        return refreshTreeItem;
    }
    //#endregion
}
