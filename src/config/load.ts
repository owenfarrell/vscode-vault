'use strict';

import * as model from '../model';
import * as vscode from 'vscode';

export let TRUSTED_AUTHORITIES : string[] = [];

export default async function(window: model.VaultWindow) {
    // Get the Vault extension configuration
    const configuration = vscode.workspace.getConfiguration('vault');
    // Update the clipboard timeout based on the clipboardTimeout value from the configuration
    // TODO Disentangle this from the model?
    window.clipboardTimeout = <number>configuration.get('clipboardTimeout') * 1000;
    // Get the trustedAuthorities value from the configuration
    TRUSTED_AUTHORITIES = configuration.get('trustedAuthorities');
}
