FROM nginx:alpine

ARG VERSION
LABEL VERSION=$VERSION
ENV VERSION=$VERSION

EXPOSE 80/tcp

COPY --from=src nginx.conf /etc/nginx/nginx.conf
COPY ./ /usr/share/nginx/html

# CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/config/settings.template.json > /usr/share/nginx/html/config/settings.json && exec nginx -g 'daemon off;'"]
