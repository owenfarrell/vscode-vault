'use strict';

import * as adaptors from '../adaptors';
import * as nv from 'node-vault';
import * as path from 'path';
import * as vscode from 'vscode';

import { VaultPathTreeItem } from './path';
import { VaultSession } from '../model';
import { VaultTreeItem } from './treeitem';

export class VaultServerTreeItem extends VaultTreeItem {
    private static readonly CONNECTED_CONTEXT = 'connection';
    private static readonly DISCONNECTED_CONTEXT = 'server';
    public readonly session: VaultSession
    private _dirtyCache: boolean;

    //#region Constructors
    constructor(session: VaultSession) {
        super(session.name);
        this.children = [];
        this.contextValue = VaultServerTreeItem.DISCONNECTED_CONTEXT;
        this.iconPath = this._defaultIconPath = {
            light: path.join(__dirname, '..', 'resources', 'light', 'tree', 'server.svg'),
            dark: path.join(__dirname, '..', 'resources', 'dark', 'tree', 'server.svg')
        };
        this.id += session.name.endsWith('/') ? '' : '/';
        this.session = session;
        // TODO Re-add support for custom options
    }
    //#endregion

    //#region Getters and Setters
    public get connected() : boolean {
        return this.session.client.token !== undefined;
    }
    //#endregion

    //#region VaultTreeItem Implementation
    getClient(): nv.client {
        return this.session.client;
    }

    async refresh(): Promise<boolean> {
        vscode.window.vault.log(`Refreshing server ${this.id}`);
        // Capture the existing context value
        const oldContextValue = this.contextValue;
        let returnValue: boolean;
        // If the Vault client is not connected
        if (!this.connected) {
            vscode.window.vault.log(`Resetting ${this.id} session`);
            // Clear the list of children
            this.children = [];
            // Update the context value
            this.contextValue = VaultServerTreeItem.DISCONNECTED_CONTEXT;
            // Clear tracked mount points
            this._dirtyCache = undefined;
        }
        // If the Vault client is connected
        else {
            // Update the context value
            this.contextValue = VaultServerTreeItem.CONNECTED_CONTEXT;
            // If mount points are not being explicitly tracked
            if (this._dirtyCache === undefined) {
                try {
                    // Fetch the list of mounts from Vault (NOTE: this is likely fail due to user access restrictions)
                    await this.session.cacheMountPoints();
                    // Map the list of mounts to a list of tree items
                    this.children = Array.from(this.session.mountPoints.keys()).map((element: string) => new VaultPathTreeItem(element, this));
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
        }
        // Return the calculated result, or if the context has switched
        return returnValue || oldContextValue !== this.contextValue;
    }
    //#endregion

    //#region Custom Command Methods
    async browse(): Promise<void> {
        // Prompt for the path
        let browseablePath = await vscode.window.showInputBox({ prompt: 'Enter path to browse' });
        // If no path was collected
        if (!browseablePath) {
            return undefined;
        }

        // Remove any leading slashes from the path
        browseablePath = browseablePath.replace(/^\/+/, '');
        // Add a trailing slash to the path if it isn't already there
        browseablePath += browseablePath.endsWith('/') ? '' : '/';
        // Promopt for the secrets engine
        const adaptor = await vscode.window.showQuickPick(adaptors.LIST, { placeHolder: 'Select engine type' });
        // If no secrets engine was collected
        if (!adaptor) {
            return undefined;
        }

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
    //#endregion
}
