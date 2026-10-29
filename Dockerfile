# Umami Analytics - Privacy-focused web analytics
# Uses official Umami image as build source, runs behind Quant proxy.
#
# Architecture:
#   Internet → Quant Edge → :3000 (proxy) → :3001 (Umami/Next.js)

ARG UMAMI_VERSION=postgresql-latest
ARG NODE_VERSION=22

# Source stage: extract built app from official Umami image
FROM ghcr.io/umami-software/umami:${UMAMI_VERSION} AS source

# Production stage: run behind Quant proxy
FROM ghcr.io/quantcdn-templates/app-node:${NODE_VERSION}

# Trust the managed RDS server certificate without disabling TLS verification.
RUN curl -fsS --retry 3 https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
    -o /usr/local/share/ca-certificates/amazon-rds-global-bundle.pem

COPY quant/start.cjs /usr/local/bin/quant-umami-start.cjs

WORKDIR /app

# Copy entrypoint scripts
COPY quant/entrypoints/ /quant-entrypoint.d/
RUN find /quant-entrypoint.d -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true

# Copy entire Umami application from official image
COPY --from=source --chown=node:node /app ./

# Prisma CLI must be in PATH for DB migrations
ENV PATH="/app/node_modules/.bin:${PATH}"

# CRITICAL: App port must be 3001 (proxy runs on 3000)
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Expose proxy port
EXPOSE 3000

# Assemble managed PostgreSQL configuration, migrate, then start Next.js.
CMD ["node", "/usr/local/bin/quant-umami-start.cjs"]
