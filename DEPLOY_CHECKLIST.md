# Checklist de Deploy a Railway

Usa este checklist para asegurarte de que todo esté configurado correctamente antes de deployar.

## Pre-Deploy

- [ ] Cuenta en Railway creada ([railway.app](https://railway.app))
- [ ] Repositorio GitHub conectado a Railway
- [ ] Código pusheado a GitHub (rama main o la que uses)

## 1. Generar SECRET_KEY

```bash
cd backend
python scripts/generate-secret-key.py
```

- [ ] SECRET_KEY generado y guardado (NO lo subas a git)

## 2. Configurar PostgreSQL en Railway

- [ ] Servicio PostgreSQL agregado al proyecto
- [ ] Variable `DATABASE_URL` disponible (Railway la crea automáticamente)

## 3. Configurar Backend Service

### Root Directory & Build
- [ ] Root Directory: `backend`
- [ ] Dockerfile Path: `docker/Dockerfile` (Railway lo detecta automáticamente)

### Variables de Entorno (copiar de `.env.railway.example`)
- [ ] `DJANGO_SECRET_KEY` = [el que generaste arriba]
- [ ] `DJANGO_DEBUG` = `False`
- [ ] `DJANGO_ALLOWED_HOSTS` = `${{RAILWAY_PUBLIC_DOMAIN}}`
- [ ] `DJANGO_FRONTEND_URL` = `https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}`
- [ ] `DJANGO_SETTINGS_MODULE` = `conf.settings`
- [ ] `DJANGO_SECURE_SSL_REDIRECT` = `True`

### Service Settings
- [ ] Public Networking habilitado
- [ ] Start Command configurado (o usa entrypoint.sh por defecto)
- [ ] Postgres service conectado (para DATABASE_URL automático)

## 4. Configurar Frontend Service

### Root Directory & Build
- [ ] Root Directory: `frontend`
- [ ] Dockerfile Path: `docker/Dockerfile`

### Variables de Entorno
- [ ] `VITE_API_URL` = `https://${{backend.RAILWAY_PUBLIC_DOMAIN}}`

### Service Settings
- [ ] Public Networking habilitado
- [ ] Build target: `runtime` (se especifica en Dockerfile)

## 5. Primer Deploy

- [ ] Backend deployado exitosamente
- [ ] Frontend deployado exitosamente
- [ ] Migraciones ejecutadas automáticamente
- [ ] Static files colectados

### Verificar URLs
- [ ] Backend URL funciona: `https://backend-production.up.railway.app/admin/`
- [ ] Frontend URL funciona: `https://frontend-production.up.railway.app/`
- [ ] Frontend puede conectarse al backend (verificar CORS)

## 6. Configuración Post-Deploy

### Crear Superuser
```bash
railway login
railway link  # Selecciona tu proyecto
railway run --service backend python manage.py createsuperuser
```

- [ ] Superuser creado
- [ ] Puedes acceder al admin: `https://backend-xxx.railway.app/admin/`

### Verificar Logs
```bash
railway logs --service backend
railway logs --service frontend
```

- [ ] Backend logs sin errores críticos
- [ ] Frontend logs sin errores

## 7. Testing en Producción

- [ ] Login funciona
- [ ] Todas las páginas cargan correctamente
- [ ] API endpoints responden
- [ ] Static files (CSS, JS, imágenes) cargan correctamente
- [ ] CORS funciona entre frontend y backend

## 8. Monitoreo

- [ ] Railway metrics configurado
- [ ] Alerts habilitados (opcional)
- [ ] Uptime monitoring activo

## Troubleshooting Common Issues

### Backend no inicia
```bash
# Ver logs detallados
railway logs --service backend --follow

# Revisar que DATABASE_URL esté configurado
railway variables --service backend
```

### Frontend no conecta al backend
- Verifica `VITE_API_URL` en variables del frontend
- Verifica CORS en backend settings
- Verifica que `DJANGO_FRONTEND_URL` apunte al dominio correcto del frontend

### Database connection failed
- Verifica que el servicio Postgres esté conectado al backend
- Verifica que `DATABASE_URL` esté en las variables del backend
- Usa Railway UI: Backend Service → Settings → Connect to Postgres

### Migrations no se ejecutan
```bash
# Ejecutar manualmente
railway run --service backend python manage.py migrate

# Ver estado de migraciones
railway run --service backend python manage.py showmigrations
```

## Comandos Útiles

```bash
# Ver todos los servicios
railway status

# Ver variables de un servicio
railway variables --service backend

# Ejecutar comando en un servicio
railway run --service backend python manage.py <command>

# Redeploy un servicio
railway up --service backend

# Ver logs en tiempo real
railway logs --service backend --follow
```

## Costos Estimados

- PostgreSQL: ~$5/mes
- Backend: ~$5/mes
- Frontend: ~$5/mes
- **Total: ~$15/mes** (con plan Hobby)

Railway ofrece $5 de crédito gratis mensual, así que los primeros meses podrías pagar solo ~$10/mes.

## Próximos Pasos

Una vez que todo funcione:

- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar email SMTP para notificaciones
- [ ] Configurar backups automáticos de la DB
- [ ] Configurar CI/CD con GitHub Actions (opcional)
- [ ] Agregar monitoring/APM (Sentry, etc.)

## Recursos

- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Guía completa](./RAILWAY_DEPLOY.md)
- [Quick Start](./DEPLOY_QUICK_START.md)
