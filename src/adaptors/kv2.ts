'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { SecretsEngineAdaptor } from './base';

export class KeyValueVersion2Adaptor implements SecretsEngineAdaptor {
    private static SHOWED_WARNING = false;

    label = 'K/V Version 2';

    adapt(mountPoint: string, client: nv.client): void {
        if (KeyValueVersion2Adaptor.SHOWED_WARNING === false) {
            vscode.window.showInformationMessage('KV Secrets Engine - Version 2 Limitations: This extension is currently unable to read, delete, undelete, or destory specific versions of secrets.');
            KeyValueVersion2Adaptor.SHOWED_WARNING = true;
        }

        const mountPointName = mountPoint.charAt(mountPoint.length - 1) === '/' ? mountPoint.slice(0, -1) : mountPoint;
        const metadataRegex = RegExp('(\\/?' + mountPointName + '(?!\\/metadata))\\/?');
        const dataRegex = RegExp('(\\/?' + mountPointName + '(?!\\/data))\\/?');

        const originalDeleteFunction = client.delete;
        client.delete = function(path, requestOptions): Promise<any> {
            return originalDeleteFunction(path.replace(dataRegex, '$1/metadata/'), requestOptions);
        };

        const originalListFunction = client.list;
        client.list = function(path, requestOptions): Promise<any> {
            return originalListFunction(path.replace(metadataRegex, '$1/metadata/'), requestOptions);
        };

        const originalReadFunction = client.read;
        client.read = async function(path, requestOptions): Promise<any> {
            const readResponse = await originalReadFunction(path.replace(dataRegex, '$1/data/'), requestOptions);
            return readResponse.data;
        };

        const originalWriteFunction = client.write;
        client.write = function(path, data, requestOptions): Promise<any> {
            return originalWriteFunction(path.replace(dataRegex, '$1/data/'), { data: data }, requestOptions);
        };
    }

    isAdaptable(mount: any): boolean {
        return mount.type === 'kv' && mount.options.version === '2';
    }
}
