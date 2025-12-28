# ✅ Verificar que la Impresión Automática Funciona

## 🔍 Checklist de Verificación

### 1. Servicio Local Corriendo

En la PC del local (con la impresora):

```cmd
pm2 status
```

**Debe mostrar:**
```
┌─────┬──────────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                    │ status  │ restart │ uptime   │
├─────┼──────────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ impresion-restaurante   │ online  │ 0       │ 5m       │
└─────┴──────────────────────────┴─────────┴─────────┴──────────┘
```

Si dice "stopped" o "errored":
```cmd
cd C:\servicio-impresion-local
pm2 start server.js --name impresion-restaurante
pm2 save
```

---

### 2. Variables en Vercel

1. Ve a: https://vercel.com → Tu proyecto → Settings → Environment Variables
2. Debe tener estas dos variables:

```
✅ PRINT_SERVICE_URL = http://192.168.1.122:3001
✅ PRINT_SERVICE_TOKEN = (tu token aquí)
```

Si no están:
- Agrégalas siguiendo `PASOS_VERCEL.md`
- Redesplegar después de agregarlas

---

### 3. Probar Impresión Automática

**IMPORTANTE:** NO uses los botones "🖨️ Comanda Cocina" o "🧾 Boleta Cliente"

**En su lugar:**

#### Probar Comanda:

1. Crea una orden y agrega items
2. Haz clic en el botón **"En Preparación"** (no en "Imprimir Comanda")
3. Debe imprimirse automáticamente en la impresora del local ✅

#### Probar Boleta:

1. Crea una orden y agrega items
2. Haz clic en el botón **"Pagar"**
3. Selecciona método de pago y confirma
4. Debe imprimirse la boleta automáticamente en la impresora del local ✅

---

### 4. Ver Logs en Tiempo Real

**En la PC del local:**

```cmd
pm2 logs impresion-restaurante --lines 50
```

Deberías ver cuando cambias el estado:
```
✅ Comanda impresa: Orden ORD-001
```

O si hay error:
```
❌ Error conectando a impresora: ...
```

---

### 5. Verificar desde Vercel

1. Ve a Vercel Dashboard → Deployments → Último deployment
2. Haz clic en "Functions" o busca en los logs
3. Busca mensajes con `[Printer]`

Deberías ver:
```
[Printer] Servidor en la nube - enviando a servicio local de impresión
[Printer] Comanda enviada a servicio local: Comanda impresa correctamente
```

---

## 🆘 Si No Funciona

### Error: "Connection refused"

**Problema:** El servicio local no está corriendo o la IP es incorrecta

**Solución:**
1. Verifica que el servicio esté corriendo: `pm2 status`
2. Verifica la IP: `ipconfig` (puede haber cambiado)
3. Actualiza `PRINT_SERVICE_URL` en Vercel con la nueva IP

### Error: "Token inválido"

**Problema:** El token no coincide

**Solución:**
1. Verifica el token en el archivo `.env` del servicio local
2. Verifica que sea **exactamente igual** en Vercel
3. Sin espacios extra, sin saltos de línea

### No imprime pero no hay error

**Problema:** La impresora no está configurada correctamente

**Solución:**
1. Verifica el puerto en `.env`: `PRINTER_KITCHEN_PATH=USB002`
2. Verifica que la impresora esté conectada y encendida
3. Revisa los logs: `pm2 logs impresion-restaurante`

---

## 📝 Resumen Rápido

1. ✅ Servicio local corriendo (`pm2 status`)
2. ✅ Variables configuradas en Vercel
3. ✅ Cambiar estado (no usar botones de imprimir)
4. ✅ Verificar logs

**¡Con esto debería funcionar!** 🎉







