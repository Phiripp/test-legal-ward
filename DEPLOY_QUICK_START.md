# Deploy Rápido a Railway - Legal Ward

## TL;DR - Lo Más Simple

Railway puede deployar tus 3 contenedores Docker fácilmente. **No es complicado**.

### 5 Pasos:

1. **Crear cuenta en Railway** → [railway.app](https://railway.app)

2. **Crear nuevo proyecto** → Conectar tu repo de GitHub

3. **Agregar PostgreSQL**:
   - Click "+ New" → Database → PostgreSQL
   - Listo, Railway lo configura automáticamente

4. **Agregar Backend**:
   - Click "+ New" → Selecciona tu repo
   - Settings:
     - Root Directory: `backend`
     - Variables de entorno:
       ```
       DJANGO_SECRET_KEY=<genera-una-key-random>
       DJANGO_DEBUG=False
       DJANGO_ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
       DJANGO_FRONTEND_URL=https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
       ```
     - Start Command:
       ```
       python manage.py migrate && python manage.py collectstatic --noinput && gunicorn conf.wsgi:application --bind 0.0.0.0:$PORT
       ```

5. **Agregar Frontend**:
   - Click "+ New" → Selecciona tu repo
   - Settings:
     - Root Directory: `frontend`
     - Variables de entorno:
       ```
       VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
       ```

**Eso es todo!** Railway automáticamente:
- Detecta tus Dockerfiles
- Builds las imágenes
- Conecta los servicios
- Te da URLs públicas

## Comandos Útiles

Ver logs:
```bash
railway logs --service backend
railway logs --service frontend
```

Ejecutar migraciones manualmente:
```bash
railway run --service backend python manage.py migrate
```

Crear superuser:
```bash
railway run --service backend python manage.py createsuperuser
```

## Costos

- **Gratis**: $5 crédito/mes (suficiente para testear)
- **Hobby**: ~$5/servicio/mes = ~$15-20/mes total
- **Pro**: Desde $20/mes con más recursos

## ¿Cómo se Buildean las Imágenes?

Railway usa tus Dockerfiles existentes:
- **Backend**: `backend/docker/Dockerfile` → Ya está configurado para producción
- **Frontend**: `frontend/docker/Dockerfile` → Usa el stage "runtime" que ya tienes
- **Postgres**: Railway usa su propia imagen oficial

**No necesitas cambiar nada en tus Dockerfiles actuales.**

## Build vs Deploy Local

### Local (`just build && just up`):
- Usa `docker-compose.yml`
- Stage "development" del frontend
- Monta volumes para hot-reload
- Base de datos local

### Railway (automático):
- Usa los Dockerfiles directamente
- Stage "runtime" del frontend (producción)
- Sin volumes, todo en la imagen
- Postgres en Railway

## Alternativas si Railway No te Gusta

1. **Render.com** - Mismo proceso, misma facilidad
2. **Fly.io** - Más técnico pero potente
3. **Google Cloud Run** - Pay-per-use, muy escalable
4. **DigitalOcean App Platform** - Más caro, más estable

## Ventajas de Railway

✅ Detecta Dockerfiles automáticamente
✅ Networking entre servicios automático
✅ SSL/HTTPS gratis
✅ CI/CD automático desde GitHub
✅ Logs en tiempo real
✅ Métricas de performance
✅ $5 gratis/mes para probar

## ¿Es Complicado?

**No.** Railway está diseñado específicamente para apps con múltiples contenedores como la tuya.

El proceso es:
1. Conectar repo → 2 clicks
2. Agregar Postgres → 1 click
3. Configurar variables → 5 minutos
4. Deploy → Automático

Total: ~15 minutos para el primer deploy.

## Siguiente Paso

Lee el archivo completo: [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) para instrucciones detalladas.

O simplemente ve a [railway.app](https://railway.app) y sigue los pasos de arriba.
