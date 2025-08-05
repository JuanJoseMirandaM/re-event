#!/bin/bash

# Build script for verification lambdas
echo "Building verification lambda..."

# Remove existing zip if it exists
rm -f generate-codes.zip

# Create zip with all files including node_modules
zip -r generate-codes.zip . -x "*.git*" "build.sh" "README.md"

echo "Build complete! generate-codes.zip created." 