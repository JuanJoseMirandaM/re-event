#!/bin/bash

# Script para construir todos los archivos ZIP de Lambda
# Uso: ./build-all.sh [clean]

set -e

echo "🚀 Construyendo archivos ZIP para todos los Lambdas..."

# Función para construir un Lambda
build_lambda() {
    local lambda_dir=$1
    local lambda_name=$2
    
    echo "📦 Construyendo $lambda_name..."
    
    cd "$lambda_dir"
    
    # Si tiene package.json, instalar dependencias
    if [ -f "package.json" ]; then
        echo "  📥 Instalando dependencias para $lambda_name..."
        
        # Si tiene package-lock.json, usar npm ci, sino npm install
        if [ -f "package-lock.json" ]; then
            npm ci --production
        else
            npm install --production
        fi
        
        # Crear ZIP incluyendo node_modules
        echo "  🗜️  Creando ZIP con dependencias..."
        zip -r "${lambda_name}.zip" . -x "*.git*" "*.md" "build.sh" "*.zip"
    else
        # Solo el archivo JS
        echo "  🗜️  Creando ZIP simple..."
        zip "${lambda_name}.zip" *.js
    fi
    
    echo "  ✅ $lambda_name.zip creado"
    cd ..
}

# Limpiar archivos ZIP existentes si se especifica 'clean'
if [ "$1" = "clean" ]; then
    echo "🧹 Limpiando archivos ZIP existentes..."
    find . -name "*.zip" -delete
fi

# Construir todos los Lambdas
echo "🔨 Iniciando construcción de Lambdas..."

# User Lambdas (sin dependencias)
build_lambda "user" "create-user"
build_lambda "user" "get-user" 
build_lambda "user" "update-user"
build_lambda "user" "verify-code"

# Event Lambdas (sin dependencias)
build_lambda "event" "create-event"
build_lambda "event" "get-events"
build_lambda "event" "get-event"
build_lambda "event" "update-event"
build_lambda "event" "delete-event"

# Evaluation Lambdas (sin dependencias)
build_lambda "evaluation" "create-evaluation"
build_lambda "evaluation" "get-evaluation"
build_lambda "evaluation" "get-evaluations-by-session"
build_lambda "evaluation" "get-evaluations-by-user"

# Points Lambdas (con dependencias)
build_lambda "points" "claim-points"
build_lambda "points" "deduct-points"
build_lambda "points" "get-points-history"
build_lambda "points" "get-total-points"
build_lambda "points" "generate-code"

# Notifications Lambdas (con dependencias)
build_lambda "notifications" "create-notification"
build_lambda "notifications" "get-notifications"

# FCM Lambdas (con dependencias)
build_lambda "fcm" "register-fcm-token"

# Verification Lambdas (con dependencias)
build_lambda "verification" "generate-codes"

echo ""
echo "🎉 ¡Todos los archivos ZIP han sido construidos!"
echo ""
echo "📊 Resumen de archivos creados:"
find . -name "*.zip" -type f | sort | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "  📦 $file ($size)"
done

echo ""
echo "✅ Listo para desplegar en producción!"
