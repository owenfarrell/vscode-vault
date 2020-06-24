'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { VaultToken } from '../../model';

export interface CallableQuickPickItem extends vscode.QuickPickItem {
    callback(client: nv.client): Promise<VaultToken>;
}