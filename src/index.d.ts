import { VaultWindow, VaultToken } from "./model";

import * as vscode from "vscode";

declare module "vscode" {
    export interface CallableQuickPickItem extends QuickPickItem {
        callback(...args: any[]) : Promise<VaultToken>;
    }

    export interface SecretQuickPickItem extends QuickPickItem {
        secretValue: string;
    }

    export namespace window {
        export let vault: VaultWindow;
    }
}
