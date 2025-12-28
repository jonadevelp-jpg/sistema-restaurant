# 🔧 Solución: No Imprime en el Local

## ✅ Progreso

- ✅ Ya no hay error 403 (la API route funciona)
- ✅ Los logs de Vercel muestran que se está llamando
- ❌ Pero no imprime en la impresora del local

---

## 🔍 Diagnóstico

### Paso 1: Ver Logs del Servicio Local

En la PC del local, ejecuta:

```cmd
ver-logs.bat
```

**Deja esta ventana abierta** y luego cambia el estado de una orden.

**Deberías ver:**
```
🔐 Verificando autenticación...
✅ Token válido
📥 Petición recibida, parseando body...
📥 Tipo: kitchen
📥 Orden: ORD-001
📥 Items: 3
📋 Imprimiendo comanda de cocina...
🔌 Conectando a impresora: tipo=usb, path=USB002
✅ Impresora conectada correctamente
✅ Comanda impresa: Orden ORD-001
```

**O si hay error:**
```
❌ Error conectando a impresora: Device not found
❌ Error imprimiendo comanda: ...
```

---

### Paso 2: Verificar Configuración de Impresora

Ejecuta:

```cmd
verificar-impresion.bat
```

Este script verifica:
- ✅ Archivo `.env` existe
- ✅ Configuración de impresora
- ✅ Últimos logs con errores

---

### Paso 3: Verificar Puerto de Impresora

1. Ve a: **Panel de Control** → **Dispositivos e impresoras**
2. Clic derecho en tu impresora → **Propiedades de impresora**
3. Ve a la pestaña **"Puertos"**
4. Busca el puerto USB (ej: `USB002`, `USB003`, etc.)
5. Verifica que sea **exactamente igual** al del archivo `.env`

**Si es diferente:**
1. Actualiza el archivo `.env`:
   ```
   PRINTER_KITCHEN_PATH=USB003
   ```
2. Reinicia el servicio:
   ```cmd
   pm2 restart impresion-restaurante
   ```

---

## 🆘 Problemas Comunes

### Problema 1: "No veo nada en los logs del servicio local"

**Causa:** La petición no está llegando al servicio local

**Verifica:**
1. ¿El servicio está corriendo? (`pm2 status`)
2. ¿Las variables están en Vercel? (IP y token)
3. ¿Redesplegaste después de cambiar variables?

**Solución:**
1. Ejecuta `diagnostico-completo.bat`
2. Verifica que todo esté correcto
3. Verifica las variables en Vercel
4. Redesplegar en Vercel

---

### Problema 2: "Veo error: Device not found"

**Causa:** El puerto USB es incorrecto o la impresora no está conectada

**Solución:**
1. Verifica el puerto en Panel de Control (ver arriba)
2. Actualiza el archivo `.env` con el puerto correcto
3. Reinicia el servicio: `pm2 restart impresion-restaurante`
4. Verifica que la impresora esté encendida y conectada

---

### Problema 3: "Veo error: Permission denied"

**Causa:** Permisos de Windows

**Solución:**
1. Ejecuta el servicio como Administrador
2. O configura permisos para el puerto USB

---

### Problema 4: "Veo que se conecta pero no imprime"

**Causa:** Problema con la impresora o el driver

**Solución:**
1. Prueba imprimir desde Windows primero (Panel de Control → Impresoras → Imprimir página de prueba)
2. Verifica que la impresora esté encendida
3. Verifica que tenga papel
4. Revisa los logs para ver si hay errores específicos

---

## 📋 Checklist Completo

- [ ] Servicio local corriendo (`pm2 status` muestra "online")
- [ ] Logs abiertos (`ver-logs.bat` corriendo)
- [ ] Variables configuradas en Vercel (IP y token)
- [ ] Redesplegado después de cambiar variables
- [ ] Puerto de impresora correcto en `.env`
- [ ] Impresora encendida y conectada
- [ ] Impresora tiene papel
- [ ] Cambias el estado (no usas botones de imprimir)
- [ ] Observas los logs cuando cambias el estado

---

## 🔍 Próximos Pasos

1. **Abre `ver-logs.bat`** en la PC del local
2. **Cambia el estado** de una orden a "Preparación"
3. **Observa los logs** - ¿qué mensajes aparecen?
4. **Comparte los mensajes** que ves en los logs

**Con esa información podremos identificar exactamente dónde está fallando.** 🔍

---

**He mejorado el logging del servicio local para que muestre más detalles. Reinicia el servicio y prueba de nuevo.** 🔄







