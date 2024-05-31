FROM quay.io/keycloak/keycloak:24.0.4 as builder

# Configure a database vendor
ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true

WORKDIR /opt/keycloak
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:24.0.4
COPY --from=builder /opt/keycloak/ /opt/keycloak/

COPY ./themes/ /opt/keycloak/themes/

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]