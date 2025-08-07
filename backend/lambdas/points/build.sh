#!/bin/bash

# Build script for points system lambdas
echo "Building points system lambdas..."

# Install dependencies
npm install

# Remove existing zips
rm -f claim-points.zip
rm -f get-points-history.zip
rm -f get-total-points.zip
rm -f generate-code.zip

# Create individual zips for each lambda
echo "Creating claim-points.zip..."
zip -r claim-points.zip claim-points.js package.json node_modules -x "*.git*" "build.sh" "README.md"

echo "Creating get-points-history.zip..."
zip -r get-points-history.zip get-points-history.js package.json node_modules -x "*.git*" "build.sh" "README.md"

echo "Creating get-total-points.zip..."
zip -r get-total-points.zip get-total-points.js package.json node_modules -x "*.git*" "build.sh" "README.md"

echo "Creating generate-code.zip..."
zip -r generate-code.zip generate-code.js package.json node_modules -x "*.git*" "build.sh" "README.md"

echo "Build complete! All zips created."
ls -lh *.zip 