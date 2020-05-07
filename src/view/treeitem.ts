'use strict';

import * as nv from 'node-vault';
import * as path from 'path';
import * as vscode from 'vscode';

export interface TreeItemIconPath {
    light: string | vscode.Uri;
    dark: string | vscode.Uri
}

export abstract class VaultTreeItem extends vscode.TreeItem {
    protected static readonly WARNING_ICON: TreeItemIconPath = {
        light: path.join(__dirname, '..', 'resources', 'light', 'warning.svg'),
        dark: path.join(__dirname, '..', 'resources', 'dark', 'warning.svg')
    };

    //#region Attributes
    private _children: VaultTreeItem[];
    protected _defaultIconPath : TreeItemIconPath;
    public readonly parent: VaultTreeItem;
    public path: string = '';
    //#endregion

    //#region Constructors
    constructor(label: string, parent?: VaultTreeItem, collapsableState = vscode.TreeItemCollapsibleState.Collapsed) {
        super(label, collapsableState);
        this.id = (parent?.id || '') + label;
        this.parent = parent;
    }
    //#endregion

    get children(): VaultTreeItem[] {
        return this._children;
    }

    set children(value: VaultTreeItem[]) {
        this._children = value;
        if (value === undefined) {
            this.iconPath = VaultTreeItem.WARNING_ICON;
        }
        else {
            this.iconPath = this._defaultIconPath;
            if (value.length === 0) {
                this.collapsibleState = vscode.TreeItemCollapsibleState.None;
            }
            else if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
                this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            }
        }
    }

    //#region Custom Command Methods
    async refresh(): Promise<boolean> {
        return true;
    }

    getClient(): nv.client {
        return this.parent.getClient();
    }
    //#endregion
}
