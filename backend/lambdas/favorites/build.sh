#!/bin/bash

# Build script for Favorites Lambdas
# Instala dependencias y crea archivos ZIP para deployment

echo "🔨 Building Favorites Lambdas..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create ZIP files for each lambda
echo "📦 Creating ZIP files..."

# Add favorite ZIP
echo "Creating add-favorite.zip..."
zip -r add-favorite.zip add-favorite.js package.json node_modules/

# Remove favorite ZIP
echo "Creating remove-favorite.zip..."
zip -r remove-favorite.zip remove-favorite.js package.json node_modules/

# Get favorites ZIP
echo "Creating get-favorites.zip..."
zip -r get-favorites.zip get-favorites.js package.json node_modules/

echo "✅ Favorites Lambdas built successfully!"
echo "📁 Generated files:"
echo "  - add-favorite.zip"
echo "  - remove-favorite.zip"
echo "  - get-favorites.zip"
