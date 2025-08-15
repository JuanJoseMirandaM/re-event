#!/bin/bash

echo "🔍 Verificando assets de la aplicación..."

# Verificar que el servidor esté corriendo
if ! curl -s http://localhost:4200 > /dev/null; then
    echo "❌ Servidor no está corriendo. Ejecuta 'npm start' primero"
    exit 1
fi

echo "✅ Servidor corriendo en localhost:4200"

# Verificar assets principales
echo ""
echo "📁 Verificando assets principales..."

# Verificar manifest
if curl -s -f http://localhost:4200/manifest.json > /dev/null; then
    echo "✅ manifest.json accesible"
else
    echo "❌ manifest.json NO accesible"
fi

# Verificar iconos principales
echo ""
echo "🖼️  Verificando iconos principales..."
icon_sizes=("72x72" "96x96" "128x128" "144x144" "152x152" "192x192" "384x384" "512x512")

for size in "${icon_sizes[@]}"; do
    if curl -s -f "http://localhost:4200/assets/icons/icon-${size}.png" > /dev/null; then
        echo "✅ icon-${size}.png accesible"
    else
        echo "❌ icon-${size}.png NO accesible"
    fi
done

# Verificar imágenes
echo ""
echo "🖼️  Verificando imágenes..."
if curl -s -f http://localhost:4200/assets/images/pic-default.webp > /dev/null; then
    echo "✅ pic-default.webp accesible"
else
    echo "❌ pic-default.webp NO accesible"
fi

# Verificar favicon
echo ""
echo "🔗 Verificando favicon..."
if curl -s -f http://localhost:4200/assets/icons/icon-192x192.png > /dev/null; then
    echo "✅ favicon accesible"
else
    echo "❌ favicon NO accesible"
fi

echo ""
echo "🎯 Verificación completada!"
echo ""
echo "💡 Si hay errores 404, verifica:"
echo "   1. Que el servidor esté corriendo: npm start"
echo "   2. Que los archivos estén en src/assets/"
echo "   3. Que angular.json incluya 'src/assets'"
