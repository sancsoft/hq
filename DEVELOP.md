# Quick Start

Install the dev dependencies and follow the instructions below for a quick setup of a fully local development environment.

## Dev Dependencies
- Docker - https://docs.docker.com/engine/install/ubuntu/
- .NET 10 SDK - https://dotnet.microsoft.com/en-us/download/dotnet/10.0
- Node 24

## Setup Instructions
- Run `docker compose up -d` in the repository root
- Run `dotnet run` in src/dotnet/HQ.Server/
- Run `npm install` in src/angular/hq/
- Run `npm start` in src/angular/hq/
- Navigate to http://localhost:4200/

# Reset

To reset your environment, execute `docker compose down -v` to clear all docker volumes. NOTE: This clears the development database and keycloak database used for the models.

# Authentication

The docker compose configuration includes an instance of Keycloak that is running in development mode that imports a development HQ realm at startup (src/auth/import/realm.json). This realm export contains matching configuration settings and credentials for the appsettings example.

For production use, the realm export can be used but ensure all credentials and secrets are rotated.

## Export realm

To update the realm export run the following commands in the repository root.

```
docker compose exec -it keycloak /opt/keycloak/bin/kc.sh export --file /opt/keycloak/data/realm-export.json --realm hq
docker compose cp keycloak:/opt/keycloak/data/realm-export.json realm-export.json
```

# Local Services

- Swagger UI http://localhost:5186/swagger/
- grafana http://localhost:29671
- keycloak http://localhost:33996
  - hq realm admin http://localhost:33996/admin/realms/hq/
  - keycloak admin - admin / admin
  - keycloak hq users
    - admin@localhost / admin
    - executive@localhost / executive
    - manager@localhost / manager
    - partner@localhost / partner
    - staff@localhost / staff
- pgadmin http://localhost:23391
- postgres hq DB - localhost:24393
  - user - postgres
  - password - postgres
  - database - hq
- postgres keycloak DB - localhost:22720
  - user - postgres
  - password - postgres
  - database - keycloak
