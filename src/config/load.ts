'use strict';

import * as model from '../model';
import * as view from '../view';
import * as vscode from 'vscode';

export default async function(window: model.VaultWindow, treeDataProvider : view.VaultTreeDataProvider) {
    // Get the Vault extension configuration
    const configuration = vscode.workspace.getConfiguration('vault');
    // Update the clipboard timeout based on the clipboardTimeout value from the configuration
    window.clipboardTimeout = <number>configuration.get('clipboardTimeout') * 1000;
    // Get the trustedAuthorities value from the configuration
    const trustedAuthorities: string[] = configuration.get('trustedAuthorities');
    // Get the tree provider's children
    const serverList: view.VaultTreeItem[] = await treeDataProvider.getChildren();
    // For each child (server)
    serverList.forEach((server: view.VaultServerTreeItem) => {
        // Update the strictSSL flag based on the list of trusted authorities
        server.session.requestOptions.strictSSL = trustedAuthorities.indexOf(server.session.endpoint.host) < 0;
    });
}
