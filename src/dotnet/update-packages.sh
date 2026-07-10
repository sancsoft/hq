#!/bin/bash

# Find all .csproj files in the current directory and run dotnet package update on each
find . -name "*.csproj" -type f | while read -r proj_file; do
    echo "Updating packages in: $proj_file"
    dotnet package update --project "$proj_file"
    if [ $? -ne 0 ]; then
        echo "Warning: dotnet package update failed for $proj_file"
    fi
done
