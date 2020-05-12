'use strict';

export interface VaultToken {
    id: string;
    renewable: boolean;
    ttl: number;
}
