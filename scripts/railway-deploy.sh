#!/bin/bash

# Script para deployar a Railway desde los directorios correctos
# Esto evita el problema de Railpack analizando el root

set -e

echo "🚀 Railway Deploy Script"
echo "========================"
echo ""

# Verificar que Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no está instalado"
    echo "Instalando Railway CLI..."
    npm i -g @railway/cli
fi

# Verificar que estamos en el directorio raíz
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

echo "📦 Deployando Backend..."
echo ""

cd backend

# Crear servicio backend si no existe
if ! railway service list 2>/dev/null | grep -q "backend"; then
    echo "Creando servicio 'backend'..."
    railway service create backend || true
fi

echo "Deployando backend desde backend/..."
railway up --service backend

echo ""
echo "✅ Backend deployado!"
echo ""

cd ../frontend

# Crear servicio frontend si no existe
if ! railway service list 2>/dev/null | grep -q "frontend"; then
    echo "Creando servicio 'frontend'..."
    railway service create frontend || true
fi

echo "Deployando frontend desde frontend/..."
railway up --service frontend

echo ""
echo "✅ Frontend deployado!"
echo ""
echo "🎉 Deploy completado!"
echo ""
echo "Verifica los servicios en: https://railway.app"

