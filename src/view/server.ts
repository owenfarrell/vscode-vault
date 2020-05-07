'use strict';

import { VaultPathTreeItem } from './path';
import { VaultTreeItem } from './treeitem';

import * as adaptors from '../adaptors';
import { VaultSession } from '../model';

import * as path from 'path';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

export class VaultServerTreeItem extends VaultTreeItem {
    private readonly _session: VaultSession

    contextValue = 'server';

    //#region Constructors
    constructor(session: VaultSession) {
        super(session.name);
        this.iconPath = this._defaultIconPath = {
            light: path.join(__dirname, '..', 'resources', 'light', 'server.svg'),
            dark: path.join(__dirname, '..', 'resources', 'dark', 'server.svg')
        };
        this.id += session.name.endsWith('/') ? '' : '/';
        this._session = session;
        // TODO Re-add support for custom options
    }
    //#endregion

    //#region VaultTreeItem Implementation
    getClient(): nv.client {
        return this._session.client;
    }

    async refresh(): Promise<boolean> {
        vscode.window.vault.log(`Refreshing server ${this.label}`);
        try {
            await this._session.cacheMountPoints();
            this.children = this._session.mountPoints.map((element: string) => new VaultPathTreeItem(element, this));
        }
        catch (err) {
            vscode.window.vault.log(`Unable to cache mount points: ${err.message}`);
            this.children = undefined;
            this.refresh = super.refresh;
        }
        if (this.children === undefined || this.children.length === 0) {
            vscode.window.showErrorMessage('Unable to list mounts', 'Browse...')
                .then((selectedAction: string) => selectedAction && vscode.commands.executeCommand('vault.browse', this));
        }
        return true;
    }

    async browse(): Promise<boolean> {
        let browseablePath = await vscode.window.showInputBox({ prompt: 'Enter path to browse' });
        if (browseablePath === undefined) {
            return;
        }
        // Remove any leading slashes
        browseablePath = browseablePath.replace(/^\/+/, '');
        // Add a trailing slash
        browseablePath += browseablePath.endsWith('/') ? '' : '/';

        const adaptor = await vscode.window.showQuickPick(adaptors.adaptorList, { placeHolder: 'Select engine type' });
        if (adaptor === undefined) {
            return;
        }

        const mountPoint = browseablePath.split('/')[0];
        this._session.mount(mountPoint, adaptor);

        const treeItem = new VaultPathTreeItem(browseablePath, this);
        if (this.children === undefined) {
            this.children = [treeItem];
        }
        else {
            this.children.push(treeItem);
        }
        return true;
    }
    //#endregion
}
