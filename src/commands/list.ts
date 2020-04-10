"use strict";

import { default as connect } from "./connect";
import read from "./read";

import * as vscode from "vscode";

function createCallableItem(path: string): vscode.CallableQuickPickItem {
    let itemDescription: string;
    let itemCallback: (...args: any[]) => void;
    // If the element represents a listable path
    if (path.endsWith("/")) {
        itemDescription = "List Path";
        itemCallback = list;
    }
    // If the element represents a readable path
    else {
        itemDescription = "Read Path";
        itemCallback = read;
    }
    // Return the adaptation
    return { callback: itemCallback, description: itemDescription, label: path };
}

export default function list(path?: string): Thenable<any> {
    return connect(true)
        .then(() => path ? vscode.window.vault.client.list(path).then((result) => result.data.keys) : vscode.window.vault.getSecretMounts())
        .then((relativePaths: string[]) => relativePaths.map((element) => createCallableItem(path || "" + element)))
        // FIXME add a single item when relative path list is empty
        .then((items: vscode.CallableQuickPickItem[]) => vscode.window.showQuickPick(items))
        .then((selectedItem: vscode.CallableQuickPickItem) => selectedItem || Promise.reject("No path to list selected"))
        .then((selectedItem: vscode.CallableQuickPickItem) => selectedItem.callback(selectedItem.label));
}
