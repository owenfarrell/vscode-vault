'use strict';

import { DefaultSecretsEngineAdaptor } from './base';

export class KeyValueVersion1Adaptor extends DefaultSecretsEngineAdaptor {
    label = 'K/V Version 1';

    isAdaptable(mount: any): boolean {
        return mount.type === 'kv' && mount.options.version === '1';
    }
}
