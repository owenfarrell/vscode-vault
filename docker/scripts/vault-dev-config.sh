#!/bin/sh

# enable userpass authentication
vault auth enable userpass

# use secrets engine v1
vault secrets enable -version=1 kv
