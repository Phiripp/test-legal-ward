#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting backend entrypoint..."
echo "📦 Python version: $(python --version)"
echo "🔧 PORT: ${PORT:-8000}"

# Check if required environment variables are set
if [ -z "$DJANGO_SECRET_KEY" ]; then
    echo "❌ ERROR: DJANGO_SECRET_KEY is not set!"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    exit 1
fi

echo "✅ Environment variables check passed"

# Run migrations
echo "🔄 Running migrations..."
python manage.py migrate --noinput || {
    echo "❌ ERROR: Migrations failed!"
    exit 1
}

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear || {
    echo "⚠️  WARNING: collectstatic failed, but continuing..."
}

# Use Railway's PORT or default to 8000 for local development
PORT=${PORT:-8000}
echo "🌐 Starting Gunicorn on 0.0.0.0:$PORT..."

# Start Gunicorn
exec gunicorn wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
