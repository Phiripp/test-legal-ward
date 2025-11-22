# Configuración de Railway - Solución al Error de Railpack

## Problema

Railway está intentando usar Railpack para detectar automáticamente tu aplicación, pero como el root tiene múltiples servicios (backend, frontend), no puede determinar qué construir.

**Error:** `Railpack could not determine how to build the app`

## Solución: Crear Servicios Separados desde la UI

Railway requiere que crees cada servicio manualmente desde la UI, especificando el Root Directory de cada uno. El archivo `railway.toml` solo funciona **después** de que los servicios estén creados.

### Paso 1: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Conecta tu repositorio

### Paso 2: Agregar PostgreSQL

1. En tu proyecto, click en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway automáticamente creará la base de datos y expondrá `DATABASE_URL`

### Paso 3: Crear Servicio Backend

1. Click en **"+ New"** → **"GitHub Repo"** → Selecciona tu repositorio (el mismo)
2. En la configuración del servicio:
   - **Name**: `backend`
   - **Root Directory**: `backend` ⚠️ **MUY IMPORTANTE**
   - **Dockerfile Path**: `docker/Dockerfile` (relativo al Root Directory)
   
3. Variables de entorno (Settings → Variables):
   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DJANGO_SECRET_KEY=<genera-una-key-segura>
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
   DJANGO_FRONTEND_URL=https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
   DJANGO_SETTINGS_MODULE=conf.settings
   PORT=${{PORT}}
   ```
   
   **IMPORTANTE:** Railway proporciona `PORT` automáticamente, pero si ves el error 
   `OverflowError: bind(): port must be 0-65535`, verifica que `PORT` esté en las variables.

4. Start Command (Settings → Deploy → Start Command):
   ```bash
   /entrypoint.sh
   ```
   
   O si prefieres el comando completo:
   ```bash
   python manage.py migrate --noinput && python manage.py collectstatic --noinput --clear && PORT=${PORT:-8000} gunicorn wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
   ```

5. En **Settings** → **Networking**:
   - Activa **"Generate Domain"** o **"Public Networking"**
   - Railway te dará una URL como `backend-production.up.railway.app`

### Paso 4: Crear Servicio Frontend

1. Click en **"+ New"** → **"GitHub Repo"** → Selecciona tu repositorio (el mismo)
2. En la configuración del servicio:
   - **Name**: `frontend`
   - **Root Directory**: `frontend` ⚠️ **MUY IMPORTANTE**
   - **Dockerfile Path**: `docker/Dockerfile` (relativo al Root Directory)
   - **Docker Build Target**: `runtime` ⚠️ **IMPORTANTE**

3. Variables de entorno:
   ```bash
   VITE_PROXY_BACKEND_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
   PORT=${{PORT}}
   ```
   
   **Nota:** `VITE_PROXY_BACKEND_URL` se usa para el proxy de Vite en desarrollo. 
   En producción, si el frontend hace requests directos al backend, también necesitarás esta variable.

4. Start Command:
   ```bash
   serve -s dist -l $PORT
   ```

5. En **Settings** → **Networking**:
   - Activa **"Generate Domain"** o **"Public Networking"**

### Paso 5: Verificar Configuración

Después de crear ambos servicios, el archivo `railway.toml` se aplicará automáticamente a cada servicio según su nombre (`backend` y `frontend`).

## ¿Por qué este enfoque?

- Railway analiza el **root** del repositorio cuando lo conectas
- Si el root tiene múltiples directorios, Railpack no puede determinar qué construir
- La solución es crear servicios separados, cada uno con su **Root Directory** configurado
- Una vez creados, Railway construirá cada servicio desde su directorio específico usando Docker

## Verificación

Después del deploy, verifica:

1. **Backend**: Debe estar corriendo y responder en su URL pública
2. **Frontend**: Debe estar sirviendo los archivos estáticos
3. **Postgres**: Debe estar conectado al backend (verifica los logs)

## Comandos Útiles (Railway CLI)

Si instalas el Railway CLI:

```bash
npm i -g @railway/cli
railway login
railway link
```

Ver logs:
```bash
railway logs --service backend
railway logs --service frontend
```

Ejecutar comandos:
```bash
railway run --service backend python manage.py migrate
railway run --service backend python manage.py createsuperuser
```

## Troubleshooting

### Error: "Dockerfile `Dockerfile` does not exist"

Este error significa que Railway está buscando el Dockerfile en el **root** del repositorio en lugar del directorio del servicio.

**Solución paso a paso:**

1. **Ve a Railway UI** → Tu proyecto → El servicio que está fallando
2. **Settings** → **Source** (o **Deploy**)
3. **Verifica/Configura:**
   - **Root Directory**: Debe ser `backend` (para backend) o `frontend` (para frontend)
   - **Dockerfile Path**: Debe ser `docker/Dockerfile` (relativo al Root Directory)
4. **Guarda los cambios**
5. **Trigger un nuevo deploy** (Settings → Deploy → Redeploy)

**Si el servicio no tiene la opción "Root Directory":**
- Elimina el servicio actual
- Crea un nuevo servicio desde cero
- Al crear el servicio, busca la opción **"Configure"** o **"Advanced"** antes de hacer deploy
- Ahí podrás configurar el Root Directory

**Verificación rápida:**
- Si ves el error `Dockerfile 'Dockerfile' does not exist`, significa que Railway está buscando en el root
- El Root Directory NO está configurado o está vacío
- Configúralo y vuelve a intentar

### Error: "Railpack could not determine"
- Este error aparece cuando intentas deployar desde el root sin Root Directory
- **Solución**: Crea servicios separados con Root Directory configurado

### Error: "Dockerfile not found" (otra variante)
- Verifica que el **Root Directory** esté configurado correctamente
- Verifica que el **Dockerfile Path** sea relativo al Root Directory
- Para backend: Root Directory = `backend`, Dockerfile Path = `docker/Dockerfile`
- Para frontend: Root Directory = `frontend`, Dockerfile Path = `docker/Dockerfile`

### Error: "OverflowError: bind(): port must be 0-65535"
Este error significa que la variable `PORT` no está definida o tiene un valor inválido.

**Solución:**
1. Ve a Railway UI → Tu servicio backend → Settings → Variables
2. Verifica que `PORT=${{PORT}}` esté configurada
3. Railway debería proporcionar `PORT` automáticamente, pero si no está:
   - Agrega `PORT=${{PORT}}` manualmente
   - O usa el start command: `/entrypoint.sh` (que maneja PORT con valor por defecto)

### Frontend no se conecta al backend
- Verifica que `VITE_PROXY_BACKEND_URL` tenga la URL correcta del backend
- Verifica que el backend tenga CORS configurado para permitir el dominio del frontend
- Verifica que ambos servicios tengan "Public Networking" activado

