#!/usr/bin/dumb-init /bin/sh

rm -f /opt/healthcheck

original-entrypoint.sh "$@" &

sleep 1 # wait for Vault to come up

su-exec vault vault-dev-init.sh

# docker healthcheck
touch /opt/healthcheck

# block forever
tail -f /dev/null
