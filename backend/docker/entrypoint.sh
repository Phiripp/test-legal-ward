#!/bin/bash
# Don't use set -e, we want to catch errors manually

echo "🚀 Starting backend entrypoint..."
echo "📦 Python version: $(python --version)"
echo "🔧 PORT: ${PORT:-8000}"
echo "📂 Working directory: $(pwd)"
echo "📋 Files in current directory:"
ls -la || echo "Could not list files"

# Check if required environment variables are set
if [ -z "$DJANGO_SECRET_KEY" ]; then
    echo "❌ ERROR: DJANGO_SECRET_KEY is not set!"
    exit 1
fi
echo "✅ DJANGO_SECRET_KEY is set"

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set!"
    exit 1
fi
echo "✅ DATABASE_URL is set: ${DATABASE_URL:0:30}..."

# Check if manage.py exists
if [ ! -f "manage.py" ]; then
    echo "❌ ERROR: manage.py not found!"
    echo "📂 Current directory contents:"
    ls -la
    exit 1
fi
echo "✅ manage.py found"

# Test Django setup
echo "🔍 Testing Django setup..."
python manage.py check --deploy || {
    echo "⚠️  WARNING: Django check failed, but continuing..."
}

# Run migrations
echo "🔄 Running migrations..."
python manage.py migrate --noinput
MIGRATION_EXIT_CODE=$?
if [ $MIGRATION_EXIT_CODE -ne 0 ]; then
    echo "❌ ERROR: Migrations failed with exit code $MIGRATION_EXIT_CODE!"
    echo "📋 Last migration output:"
    exit $MIGRATION_EXIT_CODE
fi
echo "✅ Migrations completed successfully"

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear
COLLECTSTATIC_EXIT_CODE=$?
if [ $COLLECTSTATIC_EXIT_CODE -ne 0 ]; then
    echo "⚠️  WARNING: collectstatic failed with exit code $COLLECTSTATIC_EXIT_CODE, but continuing..."
else
    echo "✅ Static files collected successfully"
fi

# Use Railway's PORT or default to 8000 for local development
PORT=${PORT:-8000}
echo "🌐 Starting Gunicorn on 0.0.0.0:$PORT..."

# Test if wsgi module can be imported
echo "🔍 Testing WSGI import..."
python -c "import wsgi; print('✅ WSGI module imported successfully')" || {
    echo "❌ ERROR: Could not import wsgi module!"
    exit 1
}

# Start Gunicorn
echo "🚀 Executing Gunicorn..."
echo "📡 Gunicorn will listen on: 0.0.0.0:$PORT"
echo "⏳ Starting server..."

exec gunicorn wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output \
    --preload
