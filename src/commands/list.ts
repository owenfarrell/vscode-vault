'use strict';

import * as model from '../model';
import * as nv from 'node-vault';

export default async function(client: nv.client, path: string): Promise<string[]> {
    // List the path
    const listResponse = await client.list(path);
    // Parse the list of child paths
    const children = listResponse.data.keys;
    model.VaultWindow.INSTANCE.log(`Listing ${path}`);
    return children;
}
