'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

export interface SecretsEngineAdaptor extends vscode.QuickPickItem {
    adapt(mountPoint: string, client: nv.client): void;
    isAdaptable(mount: any): boolean;
}

export abstract class DefaultSecretsEngineAdaptor implements SecretsEngineAdaptor {
    label = 'Other';

    adapt(): void {
        // Do nothing
    }

    abstract isAdaptable(mount: any): boolean;
}
