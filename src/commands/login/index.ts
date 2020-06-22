'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { QUICK_PICK as github } from './github';
import { QUICK_PICK as native } from './native';
import { QUICK_PICK as userpass } from './userpass';
import { VaultToken } from '../../model';

interface CallableQuickPickItem extends vscode.QuickPickItem {
    callback(client: nv.client): Promise<VaultToken>;
}

export const AUTHENTICATION_ITEMS : CallableQuickPickItem[] = [
    native,
    github,
    userpass
];

export function get(label: string): CallableQuickPickItem {
    return AUTHENTICATION_ITEMS.find(element => element.label === label);
}
