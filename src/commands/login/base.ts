'use strict';

import * as model from '../../model';
import * as nv from 'node-vault';
import * as vscode from 'vscode';

export interface CallableQuickPickItem extends vscode.QuickPickItem {
    callback(client: nv.client): Promise<model.VaultToken>;
}
