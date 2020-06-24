'use strict';

export interface VaultClientConfig {
    name: string,
    endpoint: string,
    login: string
}

export interface VaultConnectionConfig extends VaultClientConfig {
    mountPoints?: {
        path: string,
        adaptor: string
    }[],
}
