"use strict";

import { VaultToken } from "../../model";

import * as fs from "fs";
import * as os from "os";
import * as Path from "path";
import * as vscode from "vscode";

const nativeTokenPath: string = Path.resolve(os.homedir(), ".vault-token");
let nativeToken: string = process.env.VAULT_TOKEN;
let nativeTokenTime: Date = new Date(nativeToken ? Date.now() - (process.uptime() * 1000) : 0);

export default function (endpoint: string): Thenable<VaultToken> {
    // If a token file exists
    if (fs.existsSync(nativeTokenPath)) {
        // Get the last modified timestamp of the token file
        let lastModified: Date = fs.statSync(nativeTokenPath).mtime;
        vscode.window.vault.log(`Comparing last modified native token time (${nativeTokenTime}) to token file (${lastModified})`);
        // If the last modified timestamp of the token file is more recent than the most-recently cached token value
        if (lastModified > nativeTokenTime) {
            // Update the cached token value and timestamp
            nativeTokenTime = lastModified;
            // TODO Auto-detect character encoding
            nativeToken = fs.readFileSync(nativeTokenPath, "utf-8");
        }
    }
    // Prompt for the vault token
    return vscode.window.showInputBox({ prompt: "Enter Vault token", value: nativeToken })
        // If input was collected, continue, otherwise break the chain
        .then((userInput: string) => userInput || Promise.reject("Not connected to Vault (no token provided)"))
        // Reset the client with the new endpoint address
        .then((userInput: string) => vscode.window.vault.reset(endpoint, userInput))
        .then(() => vscode.window.vault.log("Logging in with native token", "key"))
        // Lookup the token
        .then(() => vscode.window.vault.client.tokenLookupSelf())
        // Cache the token for future use
        .then((result: any) => <VaultToken>{ id: result.data.id, renewable: result.data.renewable, ttl: result.data.ttl });
}
