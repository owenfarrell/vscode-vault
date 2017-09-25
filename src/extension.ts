"use strict";

import * as commands from "./commands";
import { VaultSession } from "./model";

import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    let session = vscode.window.vault = new VaultSession();
    if (process.env.VAULT_ADDR) vscode.window.vault.client.endpoint = process.env.VAULT_ADDR;
    // Load the configuration to start
    loadConfiguration();
    // Subscribe to configuration event changes
    vscode.workspace.onDidChangeConfiguration(loadConfiguration);
    // Push disposables on to context
    context.subscriptions.push(
        session,
        // Subscribe to "vault.connect" events
        vscode.commands.registerCommand("vault.connect", () => Promise.resolve(commands.connect()).catch((err: any) => session.logError(err))),
        // Subscribe to "vault.delete" events
        vscode.commands.registerCommand("vault.delete", () => Promise.resolve(commands.delete()).catch((err: any) => session.logError(err))),
        // Subscribe to "vault.list" events
        vscode.commands.registerCommand("vault.list", () => Promise.resolve(commands.list()).catch((err: any) => session.logError(err))),
        // Subscribe to "vault.read" events
        vscode.commands.registerCommand("vault.read", () => Promise.resolve(commands.read()).catch((err: any) => session.logError(err))),
        // Subscribe to "vault.write" events
        vscode.commands.registerCommand("vault.write", () => Promise.resolve(commands.write()).catch((err: any) => session.logError(err)))
    );
}

export function deactivate() {
}

function loadConfiguration() {
    let configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("vault");
    vscode.window.vault.trustedAuthorities = <string[]>configuration.get("trustedAuthorities");
    vscode.window.vault.clipboardTimeout = <number>configuration.get("clipboardTimeout") * 1000;
}
