FROM vault

ARG ENTRYPOINT_DIR=/usr/local/bin

RUN apk update --no-cache \
    && apk add --no-cache jq \
    && mv ${ENTRYPOINT_DIR}/docker-entrypoint.sh ${ENTRYPOINT_DIR}/original-entrypoint.sh

ADD data/ /tmp/data
ADD policies/ /tmp/policies
ADD scripts/ ${ENTRYPOINT_DIR}
RUN chmod a+x ${ENTRYPOINT_DIR}/*
ENV SKIP_SETCAP=1
ENV VAULT_ADDR=http://0.0.0.0:8200

HEALTHCHECK --interval=5s --timeout=2s CMD [[ -f /opt/healthcheck ]]

# Generate a predictable vault token
ARG VAULT_DEV_ROOT_TOKEN_ID=50m35up3r53cr3770k3n
ENV VAULT_DEV_ROOT_TOKEN_ID=${VAULT_DEV_ROOT_TOKEN_ID}

# Set up a TLS listener
ENV VAULT_TLS_CERT_FILE=/etc/ssl/certs/vault.crt
ENV VAULT_TLS_KEY_FILE=/etc/ssl/private/vault.key
RUN apk add --no-cache openssl \
    && openssl req -newkey rsa:4096 -nodes -sha512 -x509 -days 3650 -out ${VAULT_TLS_CERT_FILE} -keyout ${VAULT_TLS_KEY_FILE} -subj "/C=US/ST=PA/L=Philadelphia/O=VisualStudio Code/OU=vscode-vault/CN=vault.example.com" \
    && chown vault:vault ${VAULT_TLS_CERT_FILE} ${VAULT_TLS_KEY_FILE}
ADD config/ /vault/config

# Configure vault client
ENV VAULT_TOKEN=${VAULT_DEV_ROOT_TOKEN_ID}
