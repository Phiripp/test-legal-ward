# Deploy a Railway - Legal Ward

Este documento explica cómo deployar la aplicación Legal Ward (frontend + backend + postgres) en Railway.

## Opción 1: Deploy desde la UI de Railway (Más Simple)

### Paso 1: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Click en "New Project"
3. Conecta tu repositorio de GitHub

### Paso 2: Agregar PostgreSQL

1. En tu proyecto, click en "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway automáticamente creará la base de datos y expondrá `DATABASE_URL`

### Paso 3: Agregar Backend Service

1. Click en "+ New" → "GitHub Repo" → Selecciona tu repositorio
2. Configuración:
   - **Name**: `backend`
   - **Root Directory**: `backend`
   - **Build**: Railway detectará automáticamente el Dockerfile

3. Variables de entorno (Settings → Variables):
   ```bash
   # Railway provee automáticamente DATABASE_URL si está conectado
   DJANGO_SECRET_KEY=<genera-una-key-segura>
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
   DJANGO_FRONTEND_URL=${{FRONTEND_URL}}
   DJANGO_SETTINGS_MODULE=config.settings.production
   ```

4. En "Settings" → "Networking":
   - Activa "Public Networking"
   - Railway te dará una URL como `backend-production.up.railway.app`

5. Start Command (Settings → Deploy):
   ```bash
   python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
   ```

### Paso 4: Agregar Frontend Service

1. Click en "+ New" → "GitHub Repo" → Selecciona tu repositorio
2. Configuración:
   - **Name**: `frontend`
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `docker/Dockerfile`

3. Variables de entorno:
   ```bash
   VITE_API_URL=<URL-del-backend-de-railway>
   ```

4. Build Settings:
   - Custom Build Command:
     ```bash
     docker build --target runtime -t frontend .
     ```

5. Start Command:
   ```bash
   serve -s dist -l $PORT
   ```

### Paso 5: Conectar Servicios

1. En el servicio **backend**, ve a "Settings" → "Service Variables"
2. Click en "+ Reference" para agregar la URL del frontend:
   ```
   DJANGO_FRONTEND_URL = ${{frontend.RAILWAY_PUBLIC_DOMAIN}}
   ```

3. En el servicio **frontend**, referencia el backend:
   ```
   VITE_API_URL = https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
   ```

## Opción 2: Deploy desde Railway CLI

### Instalación
```bash
npm i -g @railway/cli
railway login
```

### Crear proyecto
```bash
railway init
railway link
```

### Deploy cada servicio
```bash
# Backend
cd backend
railway up --service backend

# Frontend
cd ../frontend
railway up --service frontend
```

## Opción 3: GitHub Actions (CI/CD Automático)

Crear archivo `.github/workflows/railway-deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Railway CLI
        run: npm i -g @railway/cli

      - name: Deploy Backend
        run: railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

      - name: Deploy Frontend
        run: railway up --service frontend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Consideraciones Importantes

### 1. Settings de Django para Producción

Necesitas un archivo `config/settings/production.py`:

```python
from .base import *

DEBUG = False
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS')

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
```

### 2. Variables de Entorno Necesarias

**Backend:**
- `DATABASE_URL` - Auto-provisto por Railway Postgres
- `DJANGO_SECRET_KEY` - Genera con `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS` - Tu dominio de Railway
- `DJANGO_FRONTEND_URL` - URL del frontend

**Frontend:**
- `VITE_API_URL` - URL del backend de Railway

### 3. Migraciones y Datos Iniciales

Las migraciones se ejecutan automáticamente en el start command del backend.

Para crear un superuser:
```bash
railway run --service backend python manage.py createsuperuser
```

### 4. Logs y Debugging

Ver logs en tiempo real:
```bash
# Desde Railway CLI
railway logs --service backend
railway logs --service frontend

# Desde la UI
Ir a cada servicio → "Deployments" → Click en el deploy → "View Logs"
```

### 5. Costos

Railway ofrece:
- $5 de crédito gratis mensual
- ~$5/mes por servicio en el plan Hobby
- ~$20/mes total para 3 servicios (backend + frontend + postgres)

## Alternativas a Railway

Si prefieres otras opciones:

1. **Render.com** - Similar a Railway, mismo proceso
2. **Fly.io** - Más complejo, mejor para escalar
3. **DigitalOcean App Platform** - Más caro pero más robusto
4. **AWS ECS/Fargate** - Más complejo, máximo control

## Troubleshooting

### Error: "Module not found"
- Asegúrate que el Dockerfile path sea correcto
- Verifica que el `dockerContext` apunte a la carpeta correcta

### Error: "Database connection failed"
- Verifica que el backend esté conectado al servicio Postgres
- Chequea que `DATABASE_URL` esté configurado

### Frontend no carga
- Verifica que `VITE_API_URL` apunte a la URL correcta del backend
- Asegúrate que el backend permita CORS desde el dominio del frontend

## Monitoreo

Railway provee:
- Métricas de CPU/RAM
- Request logs
- Alertas por email
- Uptime monitoring
