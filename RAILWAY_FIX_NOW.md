# 🚨 SOLUCIÓN INMEDIATA - Railway Deploy

## El Problema
Railway está usando Railpack y analizando el root, por eso no encuentra los Dockerfiles que están en `backend/docker/` y `frontend/docker/`.

## La Solución (5 minutos)

### Paso 1: Ve a Railway UI
1. Abre [railway.app](https://railway.app)
2. Ve a tu proyecto
3. **ELIMINA** el servicio que está fallando (si existe)

### Paso 2: Crear Servicio Backend CORRECTAMENTE

1. Click en **"+ New"** → **"GitHub Repo"**
2. Selecciona tu repositorio
3. **ANTES DE HACER DEPLOY**, click en **"Settings"** o **"Configure"**
4. Busca la sección **"Source"** o **"Build"**
5. Configura:
   ```
   Root Directory: backend
   Dockerfile Path: docker/Dockerfile
   ```
6. **GUARDA**
7. Ahora configura las Variables de Entorno (Settings → Variables):
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DJANGO_SECRET_KEY=<tu-secret-key>
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
   PORT=${{PORT}}
   ```
8. Start Command (Settings → Deploy → Start Command):
   ```
   python manage.py migrate && python manage.py collectstatic --noinput && gunicorn conf.wsgi:application --bind 0.0.0.0:$PORT
   ```
9. Activa **"Generate Domain"** en Settings → Networking

### Paso 3: Crear Servicio Frontend CORRECTAMENTE

1. Click en **"+ New"** → **"GitHub Repo"**
2. Selecciona tu repositorio (el mismo)
3. **ANTES DE HACER DEPLOY**, click en **"Settings"** o **"Configure"**
4. Busca la sección **"Source"** o **"Build"**
5. Configura:
   ```
   Root Directory: frontend
   Dockerfile Path: docker/Dockerfile
   Docker Build Target: runtime
   ```
6. **GUARDA**
7. Variables de Entorno:
   ```
   VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
   PORT=${{PORT}}
   ```
8. Start Command:
   ```
   serve -s dist -l $PORT
   ```
9. Activa **"Generate Domain"** en Settings → Networking

## ⚠️ PUNTO CRÍTICO

**NO hagas deploy hasta que hayas configurado el Root Directory.**

Si Railway empieza a hacer deploy antes de configurar el Root Directory, fallará porque buscará el Dockerfile en el root.

## Verificación

Después de configurar ambos servicios:
- Backend debería construir desde `backend/docker/Dockerfile`
- Frontend debería construir desde `frontend/docker/Dockerfile`
- Ambos deberían tener sus propios dominios públicos

## Si Sigue Fallando

1. Ve a Settings → Source del servicio
2. Verifica que **Root Directory** NO esté vacío
3. Verifica que **Dockerfile Path** sea `docker/Dockerfile` (relativo al Root Directory)
4. Si Root Directory está vacío o es `.`, ese es el problema
5. Configúralo y haz **Redeploy**

## Comando Alternativo (Railway CLI)

Si prefieres usar CLI:

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Crear servicio backend (desde directorio backend)
cd backend
railway service create backend
railway up --service backend

# Crear servicio frontend (desde directorio frontend)
cd ../frontend
railway service create frontend
railway up --service frontend
```

