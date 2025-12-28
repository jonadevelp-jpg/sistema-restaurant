# 🔧 Solución: No Imprime Automáticamente

## 🔍 Diagnóstico Paso a Paso

### Paso 1: Verificar Servicio Local

En la PC del local (con la impresora), ejecuta:

```cmd
cd C:\servicio-impresion-local
pm2 status
```

**Si dice "stopped" o no aparece:**
```cmd
pm2 start server.js --name impresion-restaurante
pm2 save
```

**Si PM2 no está instalado:**
```cmd
npm install -g pm2
pm2 start server.js --name impresion-restaurante
pm2 save
pm2 startup
```

---

### Paso 2: Ver Logs en Tiempo Real

Abre DOS ventanas de CMD en la PC del local:

**Ventana 1 - Ver logs del servicio:**
```cmd
cd C:\servicio-impresion-local
pm2 logs impresion-restaurante
```

**Ventana 2 - Verificar estado:**
```cmd
pm2 status
```

Luego, desde otro dispositivo, cambia el estado de una orden a "En Preparación".

**Deberías ver en los logs:**
```
✅ Comanda impresa: Orden ORD-001
```

**O si hay error:**
```
❌ Error conectando a impresora: ...
❌ Error: Connection refused
```

---

### Paso 3: Verificar Variables en Vercel

1. Ve a: https://vercel.com → Tu proyecto → Settings → Environment Variables
2. Verifica que existan:

```
PRINT_SERVICE_URL=http://192.168.1.122:3001
PRINT_SERVICE_TOKEN=tu-token-aqui
```

**Si no están:**
- Agrégalas siguiendo `PASOS_VERCEL.md`
- Redesplegar después

**Si están pero con IP incorrecta:**
- Verifica la IP actual: `ipconfig` en la PC del local
- Actualiza `PRINT_SERVICE_URL` en Vercel
- Redesplegar

---

### Paso 4: Verificar que la API Route Funciona

Abre la consola del navegador (F12 → Console) y cambia el estado de una orden.

**Deberías ver:**
- Una llamada a `/api/ordenes/[id]` con método PATCH
- Si hay error, aparecerá en la consola

---

### Paso 5: Probar Conexión Directa

En la PC del local, prueba si el servicio responde:

```cmd
curl http://localhost:3001
```

O desde PowerShell:
```powershell
Invoke-WebRequest -Uri http://localhost:3001 -Method POST -Headers @{"Authorization"="Bearer tu-token"} -ContentType "application/json" -Body '{"type":"kitchen","orden":{"numero_orden":"TEST"},"items":[]}'
```

**Si da error de conexión:**
- El servicio no está corriendo
- Inícialo: `pm2 start server.js --name impresion-restaurante`

---

## 🆘 Problemas Comunes y Soluciones

### Problema 1: "El servicio no está corriendo"

**Síntomas:**
- `pm2 status` muestra "stopped" o no aparece nada

**Solución:**
```cmd
cd C:\servicio-impresion-local
pm2 start server.js --name impresion-restaurante
pm2 save
```

---

### Problema 2: "Connection refused" en los logs

**Síntomas:**
- Los logs muestran: `Error: Connection refused` o `ECONNREFUSED`

**Causas:**
1. El servicio local no está corriendo
2. La IP en Vercel es incorrecta
3. El firewall está bloqueando el puerto 3001

**Solución:**
1. Verifica que el servicio esté corriendo: `pm2 status`
2. Verifica la IP: `ipconfig` (puede haber cambiado)
3. Actualiza `PRINT_SERVICE_URL` en Vercel
4. Verifica el firewall:
   ```powershell
   Get-NetFirewallRule -DisplayName "Servicio Impresión"
   ```

---

### Problema 3: "Token inválido"

**Síntomas:**
- Los logs muestran: `Token inválido` o `401 Unauthorized`

**Solución:**
1. Verifica el token en el archivo `.env` del servicio local
2. Verifica que sea **exactamente igual** en Vercel
3. Sin espacios extra, sin saltos de línea
4. Redesplegar después de cambiar

---

### Problema 4: "No se imprime pero no hay error"

**Síntomas:**
- Los logs muestran que se envió correctamente
- Pero la impresora no imprime

**Solución:**
1. Verifica que la impresora esté conectada y encendida
2. Verifica el puerto en `.env`: `PRINTER_KITCHEN_PATH=USB002`
3. Prueba imprimir desde Windows primero (Panel de Control → Impresoras → Imprimir página de prueba)
4. Revisa los logs del servicio: `pm2 logs impresion-restaurante`

---

### Problema 5: "La API route no se llama"

**Síntomas:**
- No ves llamadas a `/api/ordenes/[id]` en la consola del navegador

**Causa:**
- El frontend está usando el método directo (fallback) en lugar de la API route

**Solución:**
1. Verifica que el servidor esté desplegado en Vercel (no local)
2. Verifica la consola del navegador para ver si hay errores
3. La API route solo funciona si estás usando el servidor en Vercel

---

## 🔍 Script de Diagnóstico Automático

Ejecuta en la PC del local:

```cmd
cd C:\servicio-impresion-local
diagnostico.bat
```

Este script verificará:
- ✅ Node.js instalado
- ✅ PM2 instalado
- ✅ Servicio corriendo
- ✅ Archivo .env existe
- ✅ Puerto 3001 escuchando
- ✅ IP local

---

## 📝 Checklist Completo

- [ ] Servicio local corriendo (`pm2 status` muestra "online")
- [ ] Variables configuradas en Vercel (`PRINT_SERVICE_URL` y `PRINT_SERVICE_TOKEN`)
- [ ] IP correcta en Vercel (verificar con `ipconfig`)
- [ ] Token igual en ambos lugares (Vercel y `.env`)
- [ ] Firewall permite puerto 3001
- [ ] Impresora conectada y encendida
- [ ] Puerto correcto en `.env` (`PRINTER_KITCHEN_PATH=USB002`)
- [ ] Cambias el estado (no usas botones de imprimir)

---

**Ejecuta el diagnóstico y dime qué muestra.** 🔍







