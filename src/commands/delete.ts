"use strict";

import { default as connect } from "./connect";

import * as vscode from "vscode";

export default function (): Thenable<any> {
    let path: string;
    return connect(true)
        .then(() => vscode.window.showInputBox({ prompt: "Enter path to delete from Vault", value: vscode.window.vault.lastPath }))
        .then((userInput: string) => (path = userInput) || Promise.reject("No path to delete specified"))
        .then(() => vscode.window.vault.client.delete(path))
        .then(() => vscode.window.vault.log(`Successfully deleted ${path}`, "trashcan"))
        .then(() => vscode.window.vault.lastPath = path);
}
