'use strict';

import { CallableQuickPickItem } from './base';
import { QUICK_PICK as github } from './github';
import { QUICK_PICK as native } from './native';
import { QUICK_PICK as userpass } from './userpass';

export const LIST : CallableQuickPickItem[] = [
    native,
    github,
    userpass
];

export const MAP = new Map<string, CallableQuickPickItem>(LIST.map(element => [element.label, element]));
