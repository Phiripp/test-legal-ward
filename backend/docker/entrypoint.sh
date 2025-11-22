#!/bin/bash

python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear

# Use Railway's PORT or default to 8000 for local development
PORT=${PORT:-8000}
exec gunicorn wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
