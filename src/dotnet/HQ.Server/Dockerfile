FROM mcr.microsoft.com/dotnet/aspnet:8.0

ARG VERSION
LABEL VERSION=$VERSION
ENV VERSION=$VERSION

EXPOSE 80/tcp
ENV ASPNETCORE_URLS=http://+:80

WORKDIR /app
COPY ./ /app

ENTRYPOINT ["dotnet", "HQ.Server.dll"]
