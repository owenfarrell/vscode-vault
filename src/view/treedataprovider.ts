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
        if (element === undefined) {
            vscode.window.vault.log('No tree element specified, returning server list');
            providerResult = this._serverList;
        }
        else if (element.children === undefined) {
            vscode.window.vault.log(`Tree element ${element.id} has no children defined, refreshing`);
            providerResult = this.refresh(element);
        }
        else {
            vscode.window.vault.log(`Tree element ${element.id} has children cached`);
            providerResult = element.children;
        }
        return providerResult;
    }

    getParent(element: VaultTreeItem): VaultTreeItem {
        return element.parent;
    }

    getTreeItem(element: VaultTreeItem): vscode.TreeItem {
        return element;
    }
    //#endregion

    //#region Custom Command Methods
    async connect(): Promise<void> {
        const session = await commands.connect();
        const treeItem = new VaultServerTreeItem(session);
        if (session) {
            this._serverList.push(treeItem);
            this._onDidChangeTreeData.fire();
        }
    }

    async refresh(element: VaultTreeItem): Promise<VaultTreeItem[]> {
        if (await element.refresh() === true) {
            this._onDidChangeTreeData.fire();
        }
        return undefined;
    }
    //#endregion
}
