'use strict';

export interface VaultSessionConfig {
    name: string,
    endpoint: string,
    mountPoints: string[],
    login: string
}
