FROM mcr.microsoft.com/dotnet/runtime:6.0

ARG VERSION
LABEL VERSION=$VERSION
ENV VERSION=$VERSION

WORKDIR /app
COPY ./ /app

ENTRYPOINT ["dotnet", "HQ.ConsoleTool.dll"]
