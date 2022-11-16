'use strict';

export interface VaultMountPointConfig {
    path: string,
    adaptor: string
}

export interface VaultConnectionConfig {
    name: string,
    namespace?: string,
    endpoint: string,
    login: string,
    mountPoints?: VaultMountPointConfig[]
}
