'use strict';

import * as config from './config';
import * as model from './model';
import * as view from './view';
import * as vscode from 'vscode';

const CONFIGURATION_SECTION = 'vault';
const GLOBAL_STATE_SESSIONS_KEY = 'sessions';

export function activate(context: vscode.ExtensionContext) {
    const vaultWindow = model.VaultWindow.INSTANCE;

    const clearSavedSessions = () => context.globalState.update(GLOBAL_STATE_SESSIONS_KEY, undefined);

    let sessionList: model.VaultSession[];
    const loadSavedSessions = () => {
        try {
            // Get the list of saved configurations from the global state
            const savedConfigList = context.globalState.get<model.VaultConnectionConfig[]>(GLOBAL_STATE_SESSIONS_KEY);
            // If a list of saved configurations exists
            if (savedConfigList) {
                // For each configuration, create a new session
                sessionList = savedConfigList.map((element : model.VaultConnectionConfig) => new model.VaultSession(element));
            }
        }
        catch (err) {
            // Log an error
            vaultWindow.logError(`Unable to load session configuration from global state (${err.message})`);
            // Clear the list of saved configurations (if any) from disk
            clearSavedSessions();
        }
    };

    let saveConfigurations: boolean;
    const loadConfig = () => {
        // Get the Vault extension configuration
        const configuration = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
        // Update the clipboard timeout based on the clipboardTimeout value from the configuration
        vaultWindow.clipboardTimeout = configuration.get<number>('clipboardTimeout') * 1000;
        // Clear the list of trusted authorities
        config.TRUSTED_AUTHORITIES.length = 0;
        // Get the trustedAuthorities value from the configuration
        config.TRUSTED_AUTHORITIES.push(...configuration.get<string[]>('trustedAuthorities'));
        // Get the saveSessionConfiguration value from the configuration
        saveConfigurations = configuration.get<boolean>('saveConfigurations');
        // If configuration saving is enabled
        if (saveConfigurations) {
            // Load the saved sessions
            loadSavedSessions();
        }
        else {
            // Clear the list of saved configurations (if any) from disk
            clearSavedSessions();
        }
    };

    // Load the configuration to start
    loadConfig();
    // Subscribe to configuration event changes
    const eventListener: vscode.Disposable = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
        // If the Vault extension configuration changed
        if (event.affectsConfiguration(CONFIGURATION_SECTION)) {
            // (Re)Load the configuration
            loadConfig();
        }
    });

    const vaultTreeDataProvider = new view.VaultTreeDataProvider(sessionList);

    const saveSessionList = () => {
        // If configuration saving is enabled
        if (saveConfigurations === true) {
            // Update the list of saved sessions
            context.globalState.update(GLOBAL_STATE_SESSIONS_KEY, vaultTreeDataProvider.sessionList.map((element : model.VaultSession) => element.config));
        }
    };

    const browseFn = (treeItem: view.VaultServerTreeItem) => treeItem.browse()
        .then((updatedItem: view.VaultTreeItem) => updatedItem && vaultTreeDataProvider.refresh(treeItem))
        .then(saveSessionList)
        .catch((err: Error) => vaultWindow.logError(`Unable to browse Vault path (${err.message})`));

    const connectFn = (treeItem?: view.VaultServerTreeItem) => vaultTreeDataProvider.connect(treeItem)
        .then(saveSessionList)
        .catch((err: Error) => vaultWindow.logError(`Unable to connect to Vault (${err.message})`));

    const deleteFn = (treeItem: view.VaultSecretTreeItem) => treeItem.delete()
        .then(() => vaultTreeDataProvider.refresh(treeItem.parent))
        .catch((err: Error) => vaultWindow.logError(`Unable to delete Vault path (${err.message})`));

    const disconnectFn = (treeItem: view.VaultServerTreeItem) => vaultTreeDataProvider.disconnect(treeItem)
        .then(saveSessionList)
        .catch((err: Error) => vaultWindow.logError(`Unable to disconnect from Vault (${err.message})`));

    const listFn = (treeItem: view.VaultTreeItem) => vaultTreeDataProvider.refresh(treeItem)
        .catch((err: Error) => vaultWindow.logError(`Unable to list Vault path (${err.message})`));

    const readFn = (treeItem: view.VaultSecretTreeItem) => treeItem.read()
        .catch((err: Error) => vaultWindow.logError(`Unable to read Vault path (${err.message})`));

    const writeFn = (treeItem: view.VaultPathTreeItem | view.VaultSecretTreeItem) => treeItem.write()
        .then((updatedItem: view.VaultPathTreeItem) => updatedItem && vaultTreeDataProvider.refresh(updatedItem))
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
