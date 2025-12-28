# 🖨️ Cómo Funciona la Impresión Automática

## ⚠️ Confusión Común

Los botones **"🖨️ Comanda Cocina"** y **"🧾 Boleta Cliente"** que ves en la interfaz son para **impresión manual desde el navegador**. Esos NO imprimen en la impresora del local.

---

## ✅ Impresión Automática (La Correcta)

La impresión automática se activa **SOLO cuando cambias el estado de la orden**, NO cuando haces clic en los botones de imprimir.

### Cuándo se Imprime Automáticamente:

1. **Comanda de Cocina:**
   - Cuando cambias el estado a **"En Preparación"** (botón "En Preparación")
   - Se imprime automáticamente en la impresora del local ✅

2. **Boleta de Cliente:**
   - Cuando **pagas** la orden (botón "Pagar" → Confirmar pago)
   - Se imprime automáticamente en la impresora del local ✅

---

## 🔍 Cómo Verificar que Está Configurado

### Paso 1: Verificar Servicio Local

En la PC del local (con la impresora), ejecuta:

```cmd
pm2 status
```

**Debe mostrar:**
```
impresion-restaurante | online
```

Si dice "stopped":
```cmd
cd C:\servicio-impresion-local
pm2 start server.js --name impresion-restaurante
```

### Paso 2: Verificar Variables en Vercel

1. Ve a: https://vercel.com → Tu proyecto → Settings → Environment Variables
2. Debe tener:
   ```
   PRINT_SERVICE_URL=http://192.168.1.122:3001
   PRINT_SERVICE_TOKEN=tu-token-aqui
   ```

Si no están, agrégalas siguiendo `PASOS_VERCEL.md`

### Paso 3: Probar Correctamente

**NO uses los botones "🖨️ Comanda" o "🧾 Boleta"**

**En su lugar:**

1. Crea una orden y agrega items
2. Haz clic en el botón **"En Preparación"** (el botón de estado, no el de imprimir)
3. Debe imprimirse automáticamente en la impresora del local ✅

---

## 🔍 Ver Logs en Tiempo Real

Para ver si está funcionando, en la PC del local:

```cmd
pm2 logs impresion-restaurante
```

Cuando cambies el estado a "En Preparación", deberías ver:
```
✅ Comanda impresa: Orden ORD-001
```

Si ves errores, los logs te dirán qué está mal.

---

## 📝 Resumen

| Acción | Qué Pasa |
|--------|----------|
| Clic en "🖨️ Comanda" | ❌ Abre ventana de impresión del navegador (TU dispositivo) |
| Cambiar a "En Preparación" | ✅ Imprime automáticamente en impresora del local |
| Clic en "🧾 Boleta" | ❌ Abre ventana de impresión del navegador (TU dispositivo) |
| Pagar orden | ✅ Imprime automáticamente en impresora del local |

---

**¡La impresión automática se activa al cambiar el estado, no con los botones de imprimir!** ✅







