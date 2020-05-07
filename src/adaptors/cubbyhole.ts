'use strict';

import { DefaultSecretsEngineAdaptor } from './base';

export class CubbyholeAdaptor extends DefaultSecretsEngineAdaptor {
    label = 'Cubbyhole';

    isAdaptable(mount: any): boolean {
        return mount.type === 'cubbyhole';
    }
}
