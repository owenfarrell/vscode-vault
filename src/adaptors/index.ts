'use strict';

import { CubbyholeAdaptor } from './cubbyhole';
import { KeyValueVersion1Adaptor } from './kv';
import { KeyValueVersion2Adaptor } from './kv2';
import { SecretsEngineAdaptor } from './base';

export { SecretsEngineAdaptor };

export const LIST: SecretsEngineAdaptor[] = [
    new CubbyholeAdaptor(),
    new KeyValueVersion1Adaptor(),
    new KeyValueVersion2Adaptor()
];

export const MAP = new Map<string, SecretsEngineAdaptor>(LIST.map(element => [element.label, element]));

export function getAdaptor(mount: any): SecretsEngineAdaptor {
    return LIST.find((element) => element.isAdaptable(mount));
}
