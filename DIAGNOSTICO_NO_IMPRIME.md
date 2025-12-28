# 🔍 Diagnóstico: No Imprime en el Local

## ✅ Progreso

- ✅ Ya no se abre la ventana de impresión del navegador
- ❌ Pero tampoco imprime en el local

---

## 🔍 Verificación Paso a Paso

### Paso 1: Verificar Servicio Local

En la PC del local, ejecuta:

```cmd
diagnostico-completo.bat
```

Este script verifica:
- ✅ Estado del servicio (debe estar ONLINE)
- ✅ IP local
- ✅ Archivo .env con token
- ✅ Puerto 3001 escuchando
- ✅ Últimos logs

---

### Paso 2: Ver Logs en Tiempo Real

En la PC del local, ejecuta:

```cmd
ver-logs.bat
```

**Deja esta ventana abierta** y luego:

1. Abre una orden en el navegador
2. Agrega items
3. Haz clic en "⏳ Preparación"
4. **Observa los logs** - ¿qué aparece?

**Deberías ver:**
```
✅ Comanda impresa: Orden ORD-001
```

**O si hay error:**
```
❌ Error conectando a impresora: ...
❌ Error: Connection refused
❌ Error: Token inválido
```

---

### Paso 3: Verificar Variables en Vercel

1. Ve a: https://vercel.com → Tu proyecto → Settings → Environment Variables
2. Verifica que existan:

```
PRINT_SERVICE_URL=http://192.168.1.122:3001
PRINT_SERVICE_TOKEN=tu-token-aqui
```

**IMPORTANTE:**
- La IP debe ser la de la PC del local (ej: `192.168.1.122`)
- El token debe ser **exactamente igual** al del archivo `.env`
- Sin espacios extra, sin saltos de línea

3. **Redesplegar** después de verificar/cambiar

---

### Paso 4: Verificar Logs de Vercel

1. Ve a: https://vercel.com → Tu proyecto → Deployments
2. Haz clic en el último deployment
3. Ve a "Functions" o "Logs"
4. Busca mensajes con `[Printer]` o `[API]`

**Deberías ver:**
```
[API] Estado cambió a "preparing" - activando impresión de comanda
[Printer] printKitchenCommand llamado para orden: ORD-001
[Printer] Servidor en la nube - enviando a servicio local de impresión
[Printer] sendToLocalPrintService - URL: http://192.168.1.122:3001
[Printer] ✅ Comanda enviada a servicio local: Comanda impresa correctamente
```

**O si hay error:**
```
[Printer] ❌ Error enviando a servicio local: Connection refused
[Printer] ❌ Error enviando a servicio local: Token inválido
```

---

## 🆘 Problemas Comunes

### Problema 1: "No veo nada en los logs del servicio local"

**Causa:** El servidor de Vercel no puede alcanzar el servicio local

**Verifica:**
1. ¿El servicio está corriendo? (`pm2 status`)
2. ¿Las variables están en Vercel? (IP y token)
3. ¿Redesplegaste después de cambiar variables?
4. ¿El firewall permite el puerto 3001?

**Solución:**
1. Ejecuta `diagnostico-completo.bat` en la PC del local
2. Verifica que todo esté correcto
3. Verifica las variables en Vercel
4. Redesplegar en Vercel

---

### Problema 2: "Veo error: Connection refused"

**Causa:** El servicio local no está corriendo o la IP es incorrecta

**Solución:**
1. Verifica que el servicio esté corriendo: `pm2 status`
2. Si no está, ejecuta: `iniciar-servicio.bat`
3. Verifica la IP: `ipconfig`
4. Actualiza `PRINT_SERVICE_URL` en Vercel
5. Redesplegar

---

### Problema 3: "Veo error: Token inválido"

**Causa:** El token no coincide

**Solución:**
1. Obtén el token de la PC del local: `type .env`
2. Verifica que sea **exactamente igual** en Vercel
3. Sin espacios extra, sin saltos de línea
4. Redesplegar

---

### Problema 4: "Veo que se envía pero no imprime"

**Causa:** Problema con la impresora

**Solución:**
1. Verifica que la impresora esté conectada y encendida
2. Verifica el puerto en `.env`: `PRINTER_KITCHEN_PATH=USB002`
3. Prueba imprimir desde Windows primero (Panel de Control → Impresoras → Imprimir página de prueba)
4. Revisa los logs del servicio: `ver-logs.bat`

---

## 📋 Checklist Completo

- [ ] Servicio local corriendo (`pm2 status` muestra "online")
- [ ] Archivo `.env` existe con token configurado
- [ ] IP local obtenida correctamente
- [ ] Puerto 3001 escuchando
- [ ] Variables configuradas en Vercel (IP y token)
- [ ] Token igual en ambos lugares (Vercel y `.env`)
- [ ] Redesplegado después de cambiar variables
- [ ] Logs abiertos (`ver-logs.bat`)
- [ ] Cambias el estado (no usas botones de imprimir)
- [ ] Observas los logs cuando cambias el estado

---

## 🔍 Próximos Pasos

1. **Ejecuta `diagnostico-completo.bat`** en la PC del local
2. **Abre `ver-logs.bat`** y déjalo corriendo
3. **Cambia el estado** de una orden a "Preparación"
4. **Observa los logs** - ¿qué mensaje aparece?
5. **Comparte el mensaje** que ves en los logs

**Con esa información podremos identificar exactamente dónde está fallando.** 🔍







