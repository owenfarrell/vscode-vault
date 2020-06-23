'use strict';

import * as model from '../model';
import * as vscode from 'vscode';

import { TRUSTED_AUTHORITIES } from './index';

export default function(window: model.VaultWindow) {
    // Get the Vault extension configuration
    const configuration = vscode.workspace.getConfiguration('vault');
    // Update the clipboard timeout based on the clipboardTimeout value from the configuration
    window.clipboardTimeout = configuration.get<number>('clipboardTimeout') * 1000;
    // Clear the list of trusted authorities
    TRUSTED_AUTHORITIES.length = 0;
    // Get the trustedAuthorities value from the configuration
    Array.prototype.push.apply(TRUSTED_AUTHORITIES, configuration.get<string[]>('trustedAuthorities'));
}
