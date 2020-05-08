'use strict';

import { KeyValueVersion1Adaptor, KeyValueVersion2Adaptor } from './kv';

import { CubbyholeAdaptor } from './cubbyhole';
import { SecretsEngineAdaptor } from './base';

export const adaptorList: SecretsEngineAdaptor[] = [
    new CubbyholeAdaptor(),
    new KeyValueVersion1Adaptor(),
    new KeyValueVersion2Adaptor()
];

export function getAdaptor(mount: any): SecretsEngineAdaptor {
    return adaptorList.find((element) => element.isAdaptable(mount));
}
