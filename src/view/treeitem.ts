'use strict';

import * as nv from 'node-vault';
import * as path from 'path';
import * as vscode from 'vscode';

import { PATH_SEPARATOR } from 'src/util';

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
    readonly parent: VaultTreeItem;
    path: string = '';
    //#endregion

    //#region Constructors
    constructor(label: string, parent?: VaultTreeItem, collapsableState = vscode.TreeItemCollapsibleState.Collapsed) {
        super(label, collapsableState);
        this.id = (parent?.id || PATH_SEPARATOR) + label;
        this.parent = parent;
    }
    //#endregion

    //#region Getters and Setters
    get children(): VaultTreeItem[] {
        return this._children ? [...this._children] : undefined;
    }

    set children(value: VaultTreeItem[]) {
        // Set the field to the specified value
        this._children = [...value];
        this.onChildTreeItemChanges();
    }

    get client(): nv.client {
        return this.parent.client;
    }
    //#endregion

    //#region Custom Command Methods
    addChild(child: VaultTreeItem) {
        if (this._children) {
            let index = 0;
            // For each sibling that is alphabetically before the specified element
            while (index < this._children.length && this._children[index].label.localeCompare(child.label) < 0) {
                // Increment the index of the specified element
                index++;
            }
            // Insert the specified element in alphabetical order
            this._children.splice(index, 0, child);
        }
        else {
            this._children = [child];
        }
        this.onChildTreeItemChanges();
    }

    getChild(label: string): VaultTreeItem {
        return this._children ? this._children.find((value: VaultTreeItem) => value.label === label) : undefined;
    }

    abstract async refresh(): Promise<boolean>;
    //#endregion

    //#region User Interface Helper Methods
    private onChildTreeItemChanges() {
        // If the specified value is undefined
        if (this._children === undefined) {
            // Update the icon to indicate an error
            this.iconPath = VaultTreeItem.WARNING_ICON;
        }
        else {
            // Update the icon to use the default icon
            this.iconPath = this._defaultIconPath;
            // If the specified value is empty
            if (this._children.length === 0) {
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
}
