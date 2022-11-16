'use strict';

import * as nv from 'node-vault';
import * as vscode from 'vscode';

import { CallableQuickPickItem } from './base';
import validator from 'validator';
import { VaultToken } from 'src/model/token';
import { VaultWindow } from 'src/model/window';

function validateRoleID(userInput: string): string | undefined {
    return validator.isUUID(userInput) ? undefined : 'Not a valid role ID';
}

async function login(client: nv.client): Promise<VaultToken> {
    const approleLoginRequest = { mount_point: 'approle', role_id: undefined, secret_id: undefined };

    // Prompt for the mount point
    approleLoginRequest.mount_point = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter authentication mount point', value: approleLoginRequest.mount_point });
    // If the mount point was not collected
    if (!approleLoginRequest.mount_point) {
        return undefined;
    }

    // Prompt for the role ID
    approleLoginRequest.role_id = await vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Enter role ID', validateInput: validateRoleID });
    // If the role ID was not collected
    if (!approleLoginRequest.role_id) {
        return undefined;
    }

    // Prompt for the secret ID
    approleLoginRequest.secret_id = await vscode.window.showInputBox({ ignoreFocusOut: true, placeHolder: 'leave blank if optional', prompt: 'Enter secret ID' });
    // If the secret ID was not collected
    if (approleLoginRequest.secret_id === undefined) {
        return undefined;
    }

    // Submit a login request
    const approleLoginResult = await client.approleLogin(approleLoginRequest);
    // Parse the login response
    const token : VaultToken = { id: approleLoginResult.auth.client_token, renewable: approleLoginResult.auth.renewable, ttl: approleLoginResult.auth.lease_duration };
    VaultWindow.INSTANCE.log('Logging in with approle', 'server-process');

    // Return the token (if defined)
    return token;
}

const approle: CallableQuickPickItem = {
    label: 'AppRole',
    description: 'Authenticate via a role ID and secret ID',
    callback: login
};

export default approle;
