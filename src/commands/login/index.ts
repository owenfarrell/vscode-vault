'use strict';

import { CallableQuickPickItem } from './base';
import { QUICK_PICK as github } from './github';
import { QUICK_PICK as native } from './native';
import { QUICK_PICK as userpass } from './userpass';

export const AUTHENTICATION_ITEMS : CallableQuickPickItem[] = [
    native,
    github,
    userpass
];

export function get(label: string): CallableQuickPickItem {
    return AUTHENTICATION_ITEMS.find(element => element.label === label);
}
