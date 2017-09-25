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
        .then(() => path || vscode.window.showInputBox({ prompt: "Enter Vault path to browse", value: vscode.window.vault.lastPath }))
        .then((userInput: string) => (path = userInput) || Promise.reject("No path to list specified"))
        .then(() => path += path.endsWith("/") ? "" : "/")
        .then(() => vscode.window.vault.client.list(path))
        .then((result: any) => result.data.keys)
        .then((relativePaths: string[]) => relativePaths.map((element) => createCallableItem(path + element)))
        .then((items: vscode.CallableQuickPickItem[]) => vscode.window.showQuickPick(items))
        .then((selectedItem: vscode.CallableQuickPickItem) => selectedItem || Promise.reject("No path to list selected"))
        .then((selectedItem: vscode.CallableQuickPickItem) => selectedItem.callback(selectedItem.label));
}
