# Configuración de Frontend en Railway - VITE_BACKEND_URL

## Problema

Las requests a `/.auth/headless/...` están devolviendo HTML en lugar de JSON porque van al frontend en lugar del backend.

## Solución: Configurar VITE_BACKEND_URL

Las variables `VITE_*` se reemplazan en **tiempo de BUILD**, no en runtime. Por lo tanto, debes configurarla **ANTES** de que Railway haga el build.

### Paso 1: Obtener la URL del Backend

1. Ve a Railway UI → Tu proyecto
2. Click en el servicio **backend**
3. Ve a **Settings** → **Networking**
4. Copia la URL pública (algo como `backend-production-xxxx.up.railway.app`)

### Paso 2: Configurar VITE_BACKEND_URL en el Frontend

1. Ve a Railway UI → Tu proyecto
2. Click en el servicio **frontend**
3. Ve a **Settings** → **Variables**
4. Agrega una nueva variable:
   ```
   Name: VITE_BACKEND_URL
   Value: https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
   ```
   
   **O si prefieres usar la URL completa:**
   ```
   Name: VITE_BACKEND_URL
   Value: https://backend-production-xxxx.up.railway.app
   ```
   (Reemplaza `backend-production-xxxx.up.railway.app` con tu URL real)

### Paso 3: Redeploy del Frontend

**IMPORTANTE:** Después de agregar la variable, debes hacer **redeploy** del frontend para que el build use la nueva variable.

1. Ve a Railway UI → Frontend Service → **Deployments**
2. Click en **"Redeploy"** o haz un nuevo commit/push

### Paso 4: Verificar

Después del redeploy, abre la consola del navegador y deberías ver:
```
🔧 AUTH_URL configured: https://backend-production-xxxx.up.railway.app/.auth/headless
🔧 BACKEND_BASE_URL: https://backend-production-xxxx.up.railway.app
```

En lugar de:
```
🔧 AUTH_URL configured: /.auth/headless
🔧 BACKEND_BASE_URL: (undefined - requests fallarán en producción)
```

## Nota Importante

- Las variables `VITE_*` se reemplazan en **tiempo de BUILD**
- Si agregas la variable después del build, necesitas hacer **redeploy**
- Usa `${{backend.RAILWAY_PUBLIC_DOMAIN}}` para referencia automática entre servicios

