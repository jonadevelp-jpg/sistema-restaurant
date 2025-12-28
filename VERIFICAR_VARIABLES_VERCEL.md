# 🔍 Verificar Variables en Vercel

## ⚠️ Problema

El servicio local está corriendo pero no recibe peticiones. Esto significa que las variables de entorno **NO están disponibles** en Vercel o **NO se redesplegó** después de agregarlas.

---

## ✅ Verificación en Vercel

### Paso 1: Verificar Variables

1. Ve a: https://vercel.com → Tu proyecto → **Settings** → **Environment Variables**
2. Verifica que existan estas dos variables:

```
PRINT_SERVICE_URL=http://192.168.1.122:3001
PRINT_SERVICE_TOKEN=tu-token-aqui
```

**IMPORTANTE:**
- **NO** deben tener el prefijo `PUBLIC_`
- La IP debe ser la de la PC del local
- El token debe ser **exactamente igual** al del archivo `.env`

---

### Paso 2: Verificar Ambiente

En Vercel, las variables pueden estar configuradas para:
- **Production** (producción)
- **Preview** (preview)
- **Development** (desarrollo)

**Asegúrate de que estén configuradas para "Production"** (o todas).

---

### Paso 3: REDESPLEGAR (MUY IMPORTANTE)

**Después de agregar o cambiar variables, DEBES redesplegar:**

1. Ve a: **Deployments**
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine el despliegue

**Las variables solo están disponibles después de redesplegar.**

---

## 🔍 Verificar en los Logs de Vercel

1. Ve a: **Deployments** → Último deployment → **Functions** o **Logs**
2. Busca mensajes con `[Printer]`
3. **Deberías ver:**

```
[Printer] sendToLocalPrintService - URL: http://192.168.1.122:3001
[Printer] sendToLocalPrintService - Token: ***presente***
[Printer] Enviando petición a: http://192.168.1.122:3001
```

**O si hay problema:**

```
[Printer] ❌ Servicio de impresión local NO configurado
[Printer] PRINT_SERVICE_URL: FALTANTE
[Printer] PRINT_SERVICE_TOKEN: FALTANTE
```

---

## 🆘 Si las Variables Están FALTANTE

**Causa:** Las variables no están configuradas o no se redesplegó

**Solución:**
1. Agrega las variables en Vercel (ver arriba)
2. **REDESPLEGAR** (muy importante)
3. Espera a que termine el despliegue
4. Prueba de nuevo

---

## 🆘 Si las Variables Están pero No Llega al Servicio Local

**Causa:** Problema de red o firewall

**Verifica:**
1. ¿El servicio local está corriendo? (`pm2 status`)
2. ¿El puerto 3001 está escuchando? (`netstat -an | findstr ":3001"`)
3. ¿El firewall permite el puerto 3001?
4. ¿La IP es correcta? (`ipconfig`)

**Solución:**
1. Ejecuta `probar-manualmente.bat` en la PC del local
2. Si funciona, el problema es de red/firewall
3. Si no funciona, el problema es del servicio local

---

## 📋 Checklist Completo

- [ ] Variables agregadas en Vercel (`PRINT_SERVICE_URL` y `PRINT_SERVICE_TOKEN`)
- [ ] Variables configuradas para "Production"
- [ ] **REDESPLEGADO después de agregar variables** ⚠️ MUY IMPORTANTE
- [ ] IP correcta en `PRINT_SERVICE_URL`
- [ ] Token igual en Vercel y `.env`
- [ ] Servicio local corriendo (`pm2 status`)
- [ ] Logs abiertos (`ver-logs.bat`)

---

## 🔍 Próximos Pasos

1. **Verifica las variables en Vercel** (Settings → Environment Variables)
2. **REDESPLEGAR** (Deployments → 3 puntos → Redeploy)
3. **Verifica los logs de Vercel** (Functions/Logs) cuando cambias el estado
4. **Comparte qué ves** en los logs de Vercel

**Si ves "PRINT_SERVICE_URL: FALTANTE" en los logs de Vercel, las variables no están configuradas o no se redesplegó.** 🔍







