"use strict";

import { default as connect } from "./connect";

import * as clipboardy from "clipboardy";
import { flatten } from "flat";
import * as vscode from "vscode";

export default function (path?: string): Thenable<any> {
    return connect(true)
        .then(() => path || vscode.window.showInputBox({ prompt: "Enter path to read from Vault", value: vscode.window.vault.lastPath }))
        .then((userInput: string) => (path = userInput) || Promise.reject("No path specified"))
        .then(() => vscode.window.vault.client.read(path))
        .then((result: any) => flatten(result.data))
        .then((data: any) => Object.keys(data).map((element) => <vscode.SecretQuickPickItem>{ label: element, secretValue: data[element] }))
        .then((items: vscode.SecretQuickPickItem[]) => items.length === 1 ? items[0] : vscode.window.showQuickPick(items, { placeHolder: "Select an attribute" }))
        .then((selectedItem: vscode.SecretQuickPickItem) => selectedItem || Promise.reject("No key selected"))
        .then((selectedItem: vscode.SecretQuickPickItem) => vscode.window.vault.clip(selectedItem.label, selectedItem.secretValue))
        .then(() => vscode.window.vault.lastPath = path);
}
