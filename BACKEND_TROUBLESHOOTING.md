# Troubleshooting Backend 502 Error

## Problema
El backend está devolviendo **502 Bad Gateway**, lo que significa que el servicio no está respondiendo.

## Pasos para Diagnosticar

### 1. Verificar Logs del Backend en Railway

1. Ve a Railway UI → Tu proyecto → Servicio **backend**
2. Click en **"Deployments"** → Selecciona el último deployment
3. Click en **"View Logs"** o ve a la pestaña **"Logs"**

Busca errores como:
- `ModuleNotFoundError`
- `ImportError`
- `Database connection errors`
- `Port binding errors`
- `Migration errors`

### 2. Verificar Variables de Entorno

En Railway UI → Backend Service → Settings → Variables, verifica que tengas:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
DJANGO_SECRET_KEY=<tu-secret-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
DJANGO_FRONTEND_URL=https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
DJANGO_SETTINGS_MODULE=conf.settings
PORT=${{PORT}}
```

**IMPORTANTE:**
- `DJANGO_SECRET_KEY` debe estar configurada (no puede estar vacía)
- `DATABASE_URL` debe estar conectada al servicio PostgreSQL
- `PORT` debe estar configurada (Railway la proporciona automáticamente)

### 3. Verificar Start Command

En Railway UI → Backend Service → Settings → Deploy → Start Command:

Debe ser:
```bash
/entrypoint.sh
```

O verifica que el archivo `entrypoint.sh` esté en el lugar correcto y tenga permisos de ejecución.

### 4. Verificar Healthcheck

El healthcheck path debe ser `/_health/` (no `/api/health/`).

### 5. Verificar que el Backend esté Corriendo

Usa Railway CLI para verificar:

```bash
railway logs --service backend
```

O verifica en Railway UI → Backend Service → Logs

### 6. Errores Comunes

#### Error: "ModuleNotFoundError" o "ImportError"
- Verifica que todas las dependencias estén en `pyproject.toml`
- Verifica que el build se haya completado correctamente

#### Error: "Database connection errors"
- Verifica que `DATABASE_URL` esté configurada correctamente
- Verifica que el servicio PostgreSQL esté corriendo
- Verifica que las migraciones se hayan ejecutado

#### Error: "Port binding errors"
- Verifica que `PORT` esté configurada
- Verifica que el entrypoint.sh use `$PORT`

#### Error: "Migration errors"
- Verifica que la base de datos esté accesible
- Verifica que las migraciones sean compatibles con la versión de Django

### 7. Solución Rápida: Redeploy

A veces un simple redeploy soluciona el problema:

1. Railway UI → Backend Service → Deployments
2. Click en **"Redeploy"**

### 8. Verificar Manualmente

Si tienes acceso al terminal del backend:

```bash
railway shell --service backend
```

Luego dentro del contenedor:

```bash
python manage.py check
python manage.py migrate --plan
python manage.py runserver 0.0.0.0:$PORT
```

## Próximos Pasos

1. **Revisa los logs** del backend en Railway
2. **Verifica las variables de entorno** están todas configuradas
3. **Haz redeploy** del backend
4. **Comparte los logs** si el problema persiste

