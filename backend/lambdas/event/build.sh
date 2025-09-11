#!/bin/bash

# Build script for Event Lambdas
# Instala dependencias y crea archivos ZIP para deployment

echo "🔨 Building Event Lambdas..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create ZIP files for each lambda
echo "📦 Creating ZIP files..."

# Create event ZIP
echo "Creating create-event.zip..."
zip -r create-event.zip create-event.js package.json node_modules/

# Get event ZIP
echo "Creating get-event.zip..."
zip -r get-event.zip get-event.js package.json node_modules/

# Get events ZIP
echo "Creating get-events.zip..."
zip -r get-events.zip get-events.js package.json node_modules/

# Update event ZIP
echo "Creating update-event.zip..."
zip -r update-event.zip update-event.js package.json node_modules/

# Delete event ZIP
echo "Creating delete-event.zip..."
zip -r delete-event.zip delete-event.js package.json node_modules/

echo "✅ Event Lambdas built successfully!"
echo "📁 Generated files:"
echo "  - create-event.zip"
echo "  - get-event.zip"
echo "  - get-events.zip"
echo "  - update-event.zip"
echo "  - delete-event.zip"
