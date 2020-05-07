import { VaultWindow, VaultToken } from './model';

declare module 'vscode' {
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
