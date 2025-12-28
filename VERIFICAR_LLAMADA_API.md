# 🔍 Verificar si la API Route se Está Llamando

## ⚠️ Problema

Todo está configurado pero no aparece nada en los logs del servicio local cuando cambias el estado.

**Esto significa que la petición NO está llegando al servicio local.**

---

## 🔍 Verificación Paso a Paso

### Paso 1: Abrir Consola del Navegador

1. Abre tu aplicación en el navegador
2. Presiona **F12** (o clic derecho → Inspeccionar)
3. Ve a la pestaña **"Console"**

### Paso 2: Cambiar Estado y Observar

1. Abre una orden y agrega items
2. Haz clic en **"⏳ Preparación"**
3. **Observa la consola del navegador** - ¿qué mensajes aparecen?

**Deberías ver:**
```
[OrdenForm] Llamando a API route para cambiar estado: preparing
[OrdenForm] API route respondió correctamente: {...}
```

**O si hay error:**
```
[OrdenForm] API route falló: 500 {...}
[OrdenForm] Usando método directo (fallback)
```

---

### Paso 3: Verificar Network (Red)

1. En las herramientas de desarrollador (F12)
2. Ve a la pestaña **"Network"** (Red)
3. Filtra por **"Fetch/XHR"**
4. Cambia el estado de una orden
5. **Busca una petición a `/api/ordenes/[id]`**

**Deberías ver:**
- Una petición **PATCH** a `/api/ordenes/[id]`
- Estado: **200 OK** (o algún error)
- Si haces clic, puedes ver la respuesta

---

### Paso 4: Verificar Logs de Vercel

1. Ve a: https://vercel.com → Tu proyecto → Deployments
2. Haz clic en el último deployment
3. Ve a **"Functions"** o **"Logs"**
4. Busca mensajes con `[API]` o `[Printer]`

**Deberías ver:**
```
[API] Estado cambió a "preparing" - activando impresión de comanda
[Printer] printKitchenCommand llamado para orden: ORD-001
[Printer] Servidor en la nube - enviando a servicio local de impresión
[Printer] sendToLocalPrintService - URL: http://192.168.1.122:3001
[Printer] sendToLocalPrintService - Token: ***presente***
[Printer] Enviando petición a: http://192.168.1.122:3001
```

**O si hay error:**
```
[Printer] ❌ Servicio de impresión local NO configurado
[Printer] PRINT_SERVICE_URL: FALTANTE
[Printer] PRINT_SERVICE_TOKEN: FALTANTE
```

---

## 🆘 Problemas Comunes

### Problema 1: "No veo la petición en Network"

**Causa:** El frontend está usando el método directo (fallback) en lugar de la API route

**Solución:**
- Verifica que estés usando el servidor desplegado en Vercel (no localhost)
- La API route solo funciona si estás usando el servidor en Vercel

---

### Problema 2: "Veo error 500 en Network"

**Causa:** Error en la API route

**Solución:**
- Revisa los logs de Vercel para ver el error específico
- Verifica que las variables estén configuradas correctamente

---

### Problema 3: "Veo en logs de Vercel: PRINT_SERVICE_URL: FALTANTE"

**Causa:** Las variables no están disponibles en tiempo de ejecución

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que las variables estén agregadas
3. **IMPORTANTE:** Redesplegar después de agregar/cambiar variables
4. Las variables solo están disponibles después de redesplegar

---

### Problema 4: "Veo que se envía pero no llega al servicio local"

**Causa:** Problema de red o firewall

**Solución:**
1. Verifica que el servicio local esté corriendo: `pm2 status`
2. Verifica que el puerto 3001 esté escuchando: `netstat -an | findstr ":3001"`
3. Verifica el firewall de Windows
4. Prueba desde otro dispositivo en la misma red

---

## 📋 Checklist de Verificación

1. **Consola del navegador (F12 → Console):**
   - [ ] ¿Ves `[OrdenForm] Llamando a API route`?
   - [ ] ¿Ves algún error?

2. **Network (F12 → Network):**
   - [ ] ¿Ves una petición PATCH a `/api/ordenes/[id]`?
   - [ ] ¿Cuál es el estado de la respuesta?

3. **Logs de Vercel:**
   - [ ] ¿Ves `[API] Estado cambió a "preparing"`?
   - [ ] ¿Ves `[Printer] printKitchenCommand llamado`?
   - [ ] ¿Ves algún error?

4. **Logs del servicio local:**
   - [ ] ¿Aparece algo cuando cambias el estado?
   - [ ] ¿O está completamente vacío?

---

## 🔍 Próximos Pasos

1. **Abre la consola del navegador (F12 → Console)**
2. **Cambia el estado** de una orden
3. **Copia todos los mensajes** que aparecen en la consola
4. **Comparte esos mensajes** conmigo

**Con esa información podremos identificar exactamente dónde está fallando.** 🔍







