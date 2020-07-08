'use strict';

export const HTTP_VAULT_ADDRESS = 'http://localhost:8200';
export const HTTP_VAULT_NAME = 'localhost:8200';

export const CONNECT_NATIVE_VAULT_NAME = 'Localhost - Native';
export const CONNECT_NATIVE_VAULT_ADDRESS = HTTP_VAULT_ADDRESS;

export const CONNECT_USERPASS_VAULT_NAME = 'Localhost - Username & Password';
export const CONNECT_USERPASS_VAULT_ADDRESS = HTTP_VAULT_ADDRESS;

export const CONNECT_GITHUB_VAULT_NAME = 'Localhost - GitHub';
export const CONNECT_GITHUB_VAULT_ADDRESS = HTTP_VAULT_ADDRESS;

export const BROWSE_VAULT_NAME = CONNECT_USERPASS_VAULT_NAME;

export const BROWSE_CUBBYHOLE_MOUNT_POINT = 'cubbyhole/';
export const BROWSE_CUBBYHOLE_TYPE = 'Cubbyhole';
export const BROWSE_CUBBYHOLE_FULL_PATH = BROWSE_CUBBYHOLE_MOUNT_POINT;

export const BROWSE_KV1_MOUNT_POINT = 'kv/';
export const BROWSE_KV1_RELATIVE_PATH = 'app1/';
export const BROWSE_KV1_FULL_PATH = BROWSE_KV1_MOUNT_POINT + BROWSE_KV1_RELATIVE_PATH;
export const BROWSE_KV1_RELATIVE_SIBLING = 'app2/';
export const BROWSE_KV1_FULL_SIBLING = BROWSE_KV1_MOUNT_POINT + BROWSE_KV1_RELATIVE_SIBLING;
export const BROWSE_KV1_TYPE = 'K/V Version 1';

export const BROWSE_KV2_MOUNT_POINT = 'secret/';
export const BROWSE_KV2_RELATIVE_PATH = 'app1/';
export const BROWSE_KV2_FULL_PATH = BROWSE_KV2_MOUNT_POINT + BROWSE_KV2_RELATIVE_PATH;
export const BROWSE_KV2_RELATIVE_SIBLING = 'app2/';
export const BROWSE_KV2_FULL_SIBLING = BROWSE_KV2_MOUNT_POINT + BROWSE_KV2_RELATIVE_SIBLING;
export const BROWSE_KV2_TYPE = 'K/V Version 1';

export const READ_VAULT_NAME = CONNECT_NATIVE_VAULT_NAME;

export const READ_KV1_SINGLE_FIELD_PATH = BROWSE_KV1_RELATIVE_PATH;
export const READ_KV1_SINGLE_FIELD_SECRET = 'private_key';

export const READ_KV1_MULTI_FIELD_PATH = BROWSE_KV1_RELATIVE_PATH;
export const READ_KV1_MULTI_FIELD_SECRET = 'database';

export const READ_KV2_SINGLE_FIELD_PATH = BROWSE_KV2_RELATIVE_PATH;
export const READ_KV2_SINGLE_FIELD_SECRET = 'private_key';

export const READ_KV2_MULTI_FIELD_PATH = BROWSE_KV2_RELATIVE_PATH;
export const READ_KV2_MULTI_FIELD_SECRET = 'database';

export const WRITE_VAULT_NAME = CONNECT_NATIVE_VAULT_NAME;

export const WRITE_KV1_RELATIVE_PATH = BROWSE_KV1_RELATIVE_PATH;
export const WRITE_KV1_FULL_PATH = BROWSE_KV1_FULL_PATH;

export const WRITE_KV2_RELATIVE_PATH = BROWSE_KV2_RELATIVE_PATH;
export const WRITE_KV2_FULL_PATH = BROWSE_KV2_FULL_PATH;
