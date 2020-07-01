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
        light: path.join(__dirname, '..', 'resources', 'light', 'tree', 'warning.svg'),
        dark: path.join(__dirname, '..', 'resources', 'dark', 'tree', 'warning.svg')
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
        this.id = (parent?.id || '/') + label;
        this.parent = parent;
    }
    //#endregion

    //#region Getters and Setters
    get children(): VaultTreeItem[] {
        return this._children;
    }

    set children(value: VaultTreeItem[]) {
        // Set the field to the specified value
        this._children = value;
        // If the specified value is undefined
        if (value === undefined) {
            // Update the icon to indicate an error
            this.iconPath = VaultTreeItem.WARNING_ICON;
        }
        else {
            // Update the icon to use the default icon
            this.iconPath = this._defaultIconPath;
            // If the specified value is empty
            if (value.length === 0) {
                // Update the collapsable state
                this.collapsibleState = vscode.TreeItemCollapsibleState.None;
            }
            // If the specified value is *not* empty, but was previously empty
            else if (this.collapsibleState === vscode.TreeItemCollapsibleState.None) {
                // Update the collapsable state
                this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            }
        }
    }
    //#endregion

    //#region Custom Command Methods
    abstract async refresh(): Promise<boolean>;

    getClient(): nv.client {
        return this.parent.getClient();
    }
    //#endregion
}
