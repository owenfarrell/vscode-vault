'use strict';

import * as view from './view';
import * as vscode from 'vscode';

import { VaultWindow } from './model';

declare module 'vscode' {
    export namespace window {
        export let vault: VaultWindow;
    }
}

function loadConfiguration() {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('vault');
    vscode.window.vault.clipboardTimeout = <number>configuration.get('clipboardTimeout') * 1000;
}

export function activate(context: vscode.ExtensionContext) {
    vscode.window.vault = new VaultWindow();
    // Load the configuration to start
    loadConfiguration();
    // Subscribe to configuration event changes
    vscode.workspace.onDidChangeConfiguration(loadConfiguration);

    // Push disposables on to context
    context.subscriptions.push(vscode.window.vault);

    // Create a tree view
    const treeDataProvider = new view.VaultProvider();
    vscode.window.createTreeView('vaultSecrets', { treeDataProvider: treeDataProvider });
    // Subscribe to "vault.browse" events
    vscode.commands.registerCommand('vault.browse', (treeItem: view.VaultServerTreeItem) => treeItem.browse().then((requiresRefresh: boolean) => requiresRefresh === true && treeDataProvider.refresh(treeItem)).catch((error: any) => vscode.window.vault.logError(error)));
    // Subscribe to "vault.connect" events
    vscode.commands.registerCommand('vault.connect', () => treeDataProvider.connect().catch((error: any) => vscode.window.vault.logError(error)));
    // Subscribe to "vault.delete" events
    vscode.commands.registerCommand('vault.delete', (treeItem: view.VaultSecretTreeItem) => treeItem.delete().then(() => treeDataProvider.refresh(treeDataProvider.getParent(treeItem))).catch((err: any) => vscode.window.vault.logError(err)));
    // Subscribe to "vault.list" events
    vscode.commands.registerCommand('vault.list', (treeItem: view.VaultTreeItem) => treeDataProvider.refresh(treeItem).catch((err: any) => vscode.window.vault.logError(err)));
    // Subscribe to "vault.read" events
    vscode.commands.registerCommand('vault.read', (treeItem: view.VaultSecretTreeItem) => treeItem.read().catch((err: any) => vscode.window.vault.logError(err)));
    // Subscribe to "vault.write" events
    vscode.commands.registerCommand('vault.write', (treeItem: view.VaultPathTreeItem | view.VaultSecretTreeItem) => treeItem.write().then((requiresRefresh: boolean) => requiresRefresh === true && treeDataProvider.refresh(treeItem)).catch((err: any) => vscode.window.vault.logError(err)));
}

export function deactivate() {
}
