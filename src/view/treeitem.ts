'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

export abstract class VaultTreeItem extends vscode.TreeItem {
    protected static readonly WARNING_ICON = new vscode.ThemeIcon('warning');
    //#region Attributes
    private _children: VaultTreeItem[];
    protected _defaultIcon : vscode.ThemeIcon;
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
        // Set the field to the specified value
        this._children = value;
        // If the specified value is undefined
        if (value === undefined) {
            // Update the icon to indicate an error
            this.iconPath = VaultTreeItem.WARNING_ICON;
        }
        else {
            // Update the icon to use the default icon
            this.iconPath = this._defaultIcon;
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

    //#region Custom Command Methods
    abstract async refresh(): Promise<boolean>;

    getClient(): nv.client {
        return this.parent.getClient();
    }
    //#endregion
}
