'use strict';

import { SecretsEngineAdaptor } from './base';
import { CubbyholeAdaptor } from './cubbyhole';
import { KeyValueVersion1Adaptor, KeyValueVersion2Adaptor } from './kv';

export const adaptorList: SecretsEngineAdaptor[] = [
    new CubbyholeAdaptor(),
    new KeyValueVersion1Adaptor(),
    new KeyValueVersion2Adaptor()
];

export function getAdaptor(mount: any): SecretsEngineAdaptor {
    return adaptorList.find((element) => element.isAdaptable(mount));
}
