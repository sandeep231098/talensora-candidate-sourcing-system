FROM node:24.8.0-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM=talensora
ARG VITE_KEYCLOAK_CLIENT_ID=talensora-web
ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL \
    VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID
RUN npm run build

FROM nginx:1.29.1-alpine
COPY nginx/staging.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/dist /usr/share/nginx/html
ENV NGINX_ENVSUBST_FILTER="^(STAGING_APP_HOST|STAGING_KEYCLOAK_HOST)$"
EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
