#!/bin/bash

# Build script for Evaluation Lambdas
# Instala dependencias y crea archivos ZIP para deployment

echo "🔨 Building Evaluation Lambdas..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create ZIP files for each lambda
echo "📦 Creating ZIP files..."

# Create evaluation ZIP
echo "Creating create-evaluation.zip..."
zip -r create-evaluation.zip create-evaluation.js package.json node_modules/

# Get evaluation ZIP  
echo "Creating get-evaluation.zip..."
zip -r get-evaluation.zip get-evaluation.js package.json node_modules/

# Get evaluations by session ZIP
echo "Creating get-evaluations-by-session.zip..."
zip -r get-evaluations-by-session.zip get-evaluations-by-session.js package.json node_modules/

# Get evaluations by user ZIP
echo "Creating get-evaluations-by-user.zip..."
zip -r get-evaluations-by-user.zip get-evaluations-by-user.js package.json node_modules/

echo "✅ Evaluation Lambdas built successfully!"
echo "📁 Generated files:"
echo "  - create-evaluation.zip"
echo "  - get-evaluation.zip" 
echo "  - get-evaluations-by-session.zip"
echo "  - get-evaluations-by-user.zip"
