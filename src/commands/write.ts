"use strict";

import { default as connect } from "./connect";

import { isJSON } from "validator";
import * as vscode from "vscode";

const keyValuePairRegex: RegExp = /([\w_]+)=([^ \n]+)/g.compile();

interface UserInput {
    data: any;
    fieldCount: number;
}

function parseFields(input: string): UserInput {
    let data: any;
    if (isJSON(input)) {
        vscode.window.vault.log("Parsing data as JSON");
        data = JSON.parse(input);
    }
    else {
        data = {};
        let regex: RegExp = /([\w_]+)=([^ \n]+)/g;
        let match: RegExpExecArray;
        while ((match = regex.exec(input)) !== null) {
            let key: string = match[1];
            let value: string = match[2];
            data[key] = value;
        }
    }
    let fieldCount: number = Object.keys(data).length;
    vscode.window.vault.log(`Parsed ${fieldCount} fields`);
    return { data: data, fieldCount: fieldCount };
}

export default function (path?: string): Thenable<any> {
    return connect(true)
        .then(() => path || vscode.window.showInputBox({ prompt: "Enter path to write to Vault", value: vscode.window.vault.lastPath }))
        .then((userInput: string) => (path = userInput) || Promise.reject("No path specified"))
        .then(() => vscode.window.showInputBox({ prompt: "Enter data to write", placeHolder: "Enter JSON or key=value pairs" }))
        .then((userInput: string) => userInput || Promise.reject("No data provided"))
        .then((userInput: string) => parseFields(userInput))
        .then((userInput: UserInput) => userInput.fieldCount > 0 ? userInput : Promise.reject("No data to write"))
        .then((userInput: UserInput) => {
            return vscode.window.vault.client.write(path, userInput.data)
                .then(() => vscode.window.vault.log(`Successfully wrote ${userInput.fieldCount} fields to ${path}`, "checklist"))
                .then(() => vscode.window.vault.lastPath = path);
        });
}
