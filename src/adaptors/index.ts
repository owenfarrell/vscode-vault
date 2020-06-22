'use strict';

import { CubbyholeAdaptor } from './cubbyhole';
import { KeyValueVersion1Adaptor } from './kv';
import { KeyValueVersion2Adaptor } from './kv2';
import { SecretsEngineAdaptor } from './base';

export const adaptorList: SecretsEngineAdaptor[] = [
    new CubbyholeAdaptor(),
    new KeyValueVersion1Adaptor(),
    new KeyValueVersion2Adaptor()
];

export function getAdaptor(mount: any): SecretsEngineAdaptor {
    return adaptorList.find((element) => element.isAdaptable(mount));
}
