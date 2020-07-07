#!/bin/sh

VAULT_CONFIG_SCRIPT=${VAULT_CONFIG_SCRIPT:-"/usr/local/bin/vault-dev-config.sh"}

if [[ -f "$VAULT_CONFIG_SCRIPT" ]]; then
  "$VAULT_CONFIG_SCRIPT"
else
  echo "$VAULT_CONFIG_SCRIPT not found, skipping"
fi

VAULT_DEV_POLICIES=${VAULT_DEV_POLICIES:-"/tmp/policies"}
if [[ -d "$VAULT_DEV_POLICIES" ]]; then
  cd $VAULT_DEV_POLICIES
  find * -type f | xargs -I '{}' vault policy write '{}' '{}'
  cd $OLDPWD
else
  echo "$VAULT_DEV_POLICIES not found, skipping"
fi

VAULT_DEV_DATA=${VAULT_DEV_DATA:-"/tmp/data"}
if [[ -d "$VAULT_DEV_DATA" ]]; then
  cd $VAULT_DEV_DATA
  find * -type f | xargs -I '{}' vault write '{}' @'{}'
  cd $OLDPWD
else
  echo "$VAULT_DEV_DATA not found, skipping"
fi
