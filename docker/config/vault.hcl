disable_cache = true
disable_mlock = true

# Implied listener for dev mode
# listener "tcp" {
#     address = "0.0.0.0:8200"
#     tls_disable = true
# }

listener "tcp" {
    address = "0.0.0.0:8443"
    tls_cert_file = "/etc/ssl/certs/vault.crt"
    tls_key_file  = "/etc/ssl/private/vault.key"
}

storage "file" {
    path = "/vault/file"
}
