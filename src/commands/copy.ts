'use strict';

import * as model from 'src/model';
import * as nv from 'node-vault';

export default async function(client: nv.client, path: string): Promise<void> {
    // Read the path
    const result = await client.read(path);
    // Get the data from the path
    const stringifiedData: any = JSON.stringify(result.data);
    // If data was retrieved
    if (result) {
        // Clip the value of the selected item
        model.VaultWindow.INSTANCE.clip(path, stringifiedData);
    }
}
