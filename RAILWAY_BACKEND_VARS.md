# Variables de Entorno del Backend en Railway

## Variables Requeridas

Configura estas variables en Railway UI → Backend Service → Settings → Variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:FtBUlhpnBCelWTLZUvocshWVJZzryIVU@postgres.railway.internal:5432/railway

# Django Core
DJANGO_SECRET_KEY=HfPVA1pRE1QFabAu9FAI00PbGnGAQMvqCj7iLqYEretcgqc2nYkklfZjvU-gR6ifszo
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=*
DJANGO_SETTINGS_MODULE=conf.settings

# Frontend URL (para CORS)
DJANGO_FRONTEND_URL=https://frontend-production-7e55.up.railway.app

# Port (Railway lo proporciona automáticamente, pero puedes agregarlo explícitamente)
PORT=8000
```

## Verificación

1. Todas las variables deben estar configuradas en Railway UI
2. `DJANGO_SECRET_KEY` NO puede estar vacía
3. `DATABASE_URL` debe estar conectada al servicio PostgreSQL
4. `DJANGO_FRONTEND_URL` debe ser la URL completa del frontend (con https://)

## Nota sobre DATABASE_URL

Si Railway está usando `postgres.railway.internal`, esto es correcto para comunicación interna entre servicios. Sin embargo, si el backend está en un servicio separado, puede que necesites usar la URL pública de PostgreSQL.

## Próximos Pasos

1. Verifica que todas estas variables estén configuradas en Railway
2. Haz redeploy del backend
3. Revisa los logs para ver si hay errores

