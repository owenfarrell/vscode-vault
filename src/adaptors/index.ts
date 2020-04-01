"use strict";

import * as nv from "node-vault";

export interface SecretsEngineAdaptor {
    adapt(mountPoint: string, client: nv.client): void;
    isAdaptable(mount: any): boolean;
}

class DefaultSecretsEngineAdaptor implements SecretsEngineAdaptor {
    private paths: string[] = ["system"];

    adapt(mountPoint: string, client: nv.client): void {
        // Do nothing
    }

    isAdaptable(mount: any): boolean {
        return this.paths.includes(mount.type) === false;
    }
}

class KeyValueVersion2Adaptor implements SecretsEngineAdaptor {
    adapt(mountPoint: string, client: nv.client): void {
        let mountPointName = mountPoint.charAt(mountPoint.length - 1) == '/' ? mountPoint.slice(0, -1) : mountPoint;
        let metadataRegex = RegExp("(\/?" + mountPointName + "(?!\/metadata))\/?");
        let dataRegex = RegExp("(\/?" + mountPointName + "(?!\/data))\/?");

        let originalDeleteFunction = client.delete;
        client.delete = function (path, requestOptions) {
            return originalDeleteFunction(path.replace(dataRegex, "$1/data/"), requestOptions);
        };

        let originalListFunction = client.list;
        client.list = function (path, requestOptions) {
            return originalListFunction(path.replace(metadataRegex, "$1/metadata/"), requestOptions);
        };

        let originalReadFunction = client.read;
        client.read = function (path, requestOptions) {
            return originalReadFunction(path.replace(dataRegex, "$1/data/"), requestOptions);
        };

        let originalWriteFunction = client.write;
        client.write = function (path, requestOptions) {
            return originalWriteFunction(path.replace(dataRegex, "$1/data/"), requestOptions);
        };
    }

    isAdaptable(mount: any): boolean {
        return mount.type == "kv" && mount.options.version === "2";
    }
}

const adaptorList : SecretsEngineAdaptor[] = [
    new KeyValueVersion2Adaptor(),
    new DefaultSecretsEngineAdaptor()
]

export function getAdaptor(mount: any): SecretsEngineAdaptor {
    return adaptorList.find((element) => element.isAdaptable(mount));
}
