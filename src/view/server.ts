'use strict';

import * as adaptors from '../adaptors';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { VaultPathTreeItem } from './path';
import { VaultSession } from '../model';
import { VaultTreeItem } from './treeitem';

export class VaultServerTreeItem extends VaultTreeItem {
    public readonly session: VaultSession
    private _dirtyCache: boolean;

    contextValue = 'server';

    //#region Constructors
    constructor(session: VaultSession) {
        super(session.name);
        this.iconPath = this._defaultIcon = new vscode.ThemeIcon('server');
        this.id += session.name.endsWith('/') ? '' : '/';
        this.session = session;
        // TODO Re-add support for custom options
    }
    //#endregion

    //#region VaultTreeItem Implementation
    getClient(): nv.client {
        return this.session.client;
    }

    async refresh(): Promise<boolean> {
        let returnValue : boolean;
        // If mount points are not being explicitly tracked
        if (this._dirtyCache === undefined) {
            try {
                // Fetch the list of mounts from Vault (NOTE: this is likely fail due to user access restrictions)
                await this.session.cacheMountPoints();
                // Map the list of mounts to a list of tree items
                this.children = this.session.mountPoints.map((element: string) => new VaultPathTreeItem(element, this));
            }
            catch (err) {
                vscode.window.vault.log(`Unable to cache mount points: ${err.message}`);
                // Clear the list of child elements
                this.children = undefined;
                // Start tracking mount points explicitly and prevent subsequent refreshes from triggering this same error
                this._dirtyCache = false;
            }
            // If no list of children or no children are defined
            if (this.children === undefined || this.children.length === 0) {
                // Show an error message and prompt the user for an action
                vscode.window.showErrorMessage('Unable to list mounts', 'Browse...')
                    // If the (1) action is selected, execute the associated command
                    .then((selectedAction: string) => selectedAction && vscode.commands.executeCommand('vault.browse', this));
            }
            returnValue = true;
        }
        // If mount points are being explicitly tracked
        else {
            // Return the current value of the cache status flag
            returnValue = this._dirtyCache;
            // Reset the current value of the cache status flag
            this._dirtyCache = false;
        }
        return returnValue;
    }
    //#endregion

    //#region Custom Command Methods
    async browse(): Promise<void> {
        // Prompt for the path
        let browseablePath = await vscode.window.showInputBox({ prompt: 'Enter path to browse' });
        // If the path was collected
        if (browseablePath) {
            // Remove any leading slashes from the path
            browseablePath = browseablePath.replace(/^\/+/, '');
            // Add a trailing slash to the path if it isn't already there
            browseablePath += browseablePath.endsWith('/') ? '' : '/';
            // Promopt for the secrets engine
            const adaptor = await vscode.window.showQuickPick(adaptors.adaptorList, { placeHolder: 'Select engine type' });
            // If the secrets engine was collected
            if (adaptor) {
                // Extract the mount from the path
                const mountPoint = browseablePath.split('/')[0];
                // Add the mount using the adaptor for the selected engine
                this.session.mount(mountPoint, adaptor);
                // Create a new tree item for the path
                const treeItem = new VaultPathTreeItem(browseablePath, this);
                // If no children are defined
                if (this.children === undefined) {
                    // Create a list of children
                    this.children = [treeItem];
                }
                // If children are defined
                else {
                    // Add the tree item to the list of children
                    this.children.push(treeItem);
                }
                // Flag the need for a refresh of the tree view
                this._dirtyCache = true;
            }
        }
    }
    //#endregion
}
