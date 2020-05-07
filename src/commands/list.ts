
"use strict";

import read from "./read";

import * as nv from "node-vault";
import * as vscode from "vscode";

// TODO need to return an object here for the mount scenario
export default async function (client: nv.client, path?: string): Promise<string[]> {
    vscode.window.vault.log(`Listing ${path}`);
    let children: string[] = [];
    if (path) {
        let listResponse = await client.list(path);
        children = listResponse.data.keys;
    }
    return children;
}
