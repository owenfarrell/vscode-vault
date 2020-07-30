'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { VaultToken } from 'src/model/token';

export interface CallableQuickPickItem extends vscode.QuickPickItem {
    callback(client: nv.client): Promise<VaultToken>;
}
