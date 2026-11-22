# Local Caddy with the CrowdSec HTTP bouncer.
# There is no official CrowdSec image for this module.
# The server uses the same module on the host Caddy binary (see deploy/README.md).
ARG CADDY_VERSION=2

FROM caddy:${CADDY_VERSION}-builder AS builder

RUN xcaddy build \
    --with github.com/hslatman/caddy-crowdsec-bouncer/http@v0.15.0

FROM caddy:${CADDY_VERSION}

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
