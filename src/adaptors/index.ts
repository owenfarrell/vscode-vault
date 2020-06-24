'use strict';

import { CubbyholeAdaptor } from './cubbyhole';
import { KeyValueVersion1Adaptor } from './kv';
import { KeyValueVersion2Adaptor } from './kv2';
import { SecretsEngineAdaptor } from './base';

export { SecretsEngineAdaptor };

export const QUICK_PICK_LIST: SecretsEngineAdaptor[] = [
    new CubbyholeAdaptor(),
    new KeyValueVersion1Adaptor(),
    new KeyValueVersion2Adaptor()
];

const QUICK_PICK_MAP = new Map<string, SecretsEngineAdaptor>(QUICK_PICK_LIST.map(element => [element.label, element]));

export function get(mount: string | any): SecretsEngineAdaptor {
    return typeof mount === 'string' ? QUICK_PICK_MAP.get(mount) : QUICK_PICK_LIST.find((element) => element.isAdaptable(mount));
}
