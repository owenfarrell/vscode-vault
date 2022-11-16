'use strict';

import approle from './approle';
import { CallableQuickPickItem } from './base';
import github from './github';
import ldap from './ldap';
import native from './native';
import userpass from './userpass';

export const QUICK_PICK_LIST : CallableQuickPickItem[] = [
    native,
    approle,
    github,
    ldap,
    userpass
];

const QUICK_PICK_MAP = new Map<string, CallableQuickPickItem>(QUICK_PICK_LIST.map((element: CallableQuickPickItem) => [element.label, element]));

export function get(label: string): CallableQuickPickItem {
    return QUICK_PICK_MAP.get(label);
}
