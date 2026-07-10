FROM quay.io/keycloak/keycloak:26.7.0 as builder

# Configure a database vendor
ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true

WORKDIR /opt/keycloak
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.7.0
COPY --from=builder /opt/keycloak/ /opt/keycloak/

COPY ./themes/ /opt/keycloak/themes/

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]