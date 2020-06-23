'use strict';

import * as view from './view';
import * as vscode from 'vscode';

import loadConfig from './config/load';
import { VaultWindow } from './model';

declare module 'vscode' {
    export namespace window {
        export let vault: VaultWindow;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const vaultWindow = vscode.window.vault = new VaultWindow();
    const vaultTreeDataProvider = new view.VaultTreeDataProvider();

    // Load the configuration to start
    loadConfig(vaultWindow);
    // Subscribe to configuration event changes
    const eventListener : vscode.Disposable = vscode.workspace.onDidChangeConfiguration((event : vscode.ConfigurationChangeEvent) => {
        // If the Vault extension configuration changed
        if (event.affectsConfiguration('vault')) {
            // (Re)Load the configuration
            loadConfig(vaultWindow);
        }
    });

    const browseFn = (treeItem: view.VaultServerTreeItem) => treeItem.browse()
        .then(() => vaultTreeDataProvider.refresh(treeItem))
        .catch((err: Error) => vaultWindow.logError(`Unable to browse Vault path (${err.message})`));

    const connectFn = (treeItem?: view.VaultServerTreeItem) => vaultTreeDataProvider.connect(treeItem)
        .catch((err: Error) => vaultWindow.logError(`Unable to connect to Vault (${err.message})`));

    const deleteFn = (treeItem: view.VaultSecretTreeItem) => treeItem.delete()
        .then(() => vaultTreeDataProvider.refresh(treeItem.parent))
        .catch((err: Error) => vaultWindow.logError(`Unable to delete Vault path (${err.message})`));

    const disconnectFn = (treeItem: view.VaultServerTreeItem) => vaultTreeDataProvider.disconnect(treeItem)
        .catch((err: Error) => vaultWindow.logError(`Unable to connect to Vault (${err.message})`));

    const listFn = (treeItem: view.VaultTreeItem) => vaultTreeDataProvider.refresh(treeItem)
        .catch((err: Error) => vaultWindow.logError(`Unable to list Vault path (${err.message})`));

    const readFn = (treeItem: view.VaultSecretTreeItem) => treeItem.read()
        .catch((err: Error) => vaultWindow.logError(`Unable to read Vault path (${err.message})`));

    const writeFn = (treeItem: view.VaultPathTreeItem | view.VaultSecretTreeItem) => treeItem.write()
        .then((requiresRefresh: boolean) => requiresRefresh === true && vaultTreeDataProvider.refresh(treeItem))
        .catch((err: Error) => vaultWindow.logError(`Unable to write Vault path (${err.message})`));

    // Push disposables on to context
    context.subscriptions.push(
        vaultWindow,
        eventListener,
        vscode.window.createTreeView('vaultSecrets', { treeDataProvider: vaultTreeDataProvider }),
        // Subscribe to "vault.browse" events
        vscode.commands.registerCommand('vault.browse', browseFn),
        // Subscribe to "vault.connect" events
        vscode.commands.registerCommand('vault.connect', connectFn),
        // Subscribe to "vault.reconnect" events
        vscode.commands.registerCommand('vault.reconnect', connectFn),
        // Subscribe to "vault.delete" events
        vscode.commands.registerCommand('vault.delete', deleteFn),
        // Subscribe to "vault.disconnect" events
        vscode.commands.registerCommand('vault.disconnect', disconnectFn),
        // Subscribe to "vault.remove" events
        vscode.commands.registerCommand('vault.remove', disconnectFn),
        // Subscribe to "vault.list" events
        vscode.commands.registerCommand('vault.list', listFn),
        // Subscribe to "vault.read" events
        vscode.commands.registerCommand('vault.read', readFn),
        // Subscribe to "vault.write" events
        vscode.commands.registerCommand('vault.write', writeFn)
    );
}

export function deactivate() {
}
