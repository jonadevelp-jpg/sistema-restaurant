# 🖨️ Diferencia: Impresión Manual vs Automática

## ⚠️ Problema Actual

Cuando haces clic en "🖨️ Comanda Cocina" o "🧾 Boleta Cliente", se abre la **ventana de impresión del navegador** que muestra las impresoras de TU dispositivo, no la impresora del local.

---

## 🔄 Dos Tipos de Impresión

### 1. Impresión Manual (Botones del Frontend) ❌

**Qué es:**
- Los botones "🖨️ Comanda Cocina" y "🧾 Boleta Cliente" en la interfaz
- Abren `window.print()` del navegador
- Muestran las impresoras de TU dispositivo
- **NO** usa la impresora del local

**Cuándo se usa:**
- Para previsualizar cómo se verá
- Para imprimir desde tu dispositivo personal
- **NO** para impresión automática en el local

---

### 2. Impresión Automática (Backend) ✅

**Qué es:**
- Se activa **automáticamente** cuando cambias el estado de la orden
- Se ejecuta en el **servidor** (Vercel)
- El servidor envía el comando a la **PC del local** (servicio local)
- La PC del local imprime en la **impresora física del restaurante**

**Cuándo se activa:**
- ✅ Cuando cambias el estado a **"En Preparación"** → Imprime comanda automáticamente
- ✅ Cuando **pagas** la orden → Imprime boleta automáticamente

**NO se activa cuando:**
- ❌ Haces clic en "🖨️ Comanda Cocina" (ese es manual)
- ❌ Haces clic en "🧾 Boleta Cliente" (ese es manual)

---

## ✅ Cómo Probar la Impresión Automática

### Paso 1: Verificar que el Servicio Local Está Corriendo

En la PC del local (con la impresora):

1. Abre `cmd` o PowerShell
2. Ejecuta:
   ```
   pm2 status
   ```
3. Debe mostrar `impresion-restaurante` en **verde** con "online"

Si no está corriendo:
```
cd C:\servicio-impresion-local
pm2 start server.js --name impresion-restaurante
pm2 save
```

### Paso 2: Verificar Variables en Vercel

1. Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables
2. Debe tener:
   ```
   PRINT_SERVICE_URL=http://192.168.1.122:3001
   PRINT_SERVICE_TOKEN=tu-token-aqui
   ```

### Paso 3: Probar la Impresión Automática

**NO uses los botones de "Imprimir"**

En su lugar:

1. **Crea una orden** y agrega items
2. **Cambia el estado a "En Preparación"** (botón "En Preparación")
3. **Debería imprimirse automáticamente** en la impresora del local ✅

O:

1. **Paga la orden** (botón "Pagar")
2. **Debería imprimirse la boleta automáticamente** en la impresora del local ✅

---

## 🔍 Verificar que Funciona

### Revisar Logs del Servicio Local

En la PC del local:

```cmd
pm2 logs impresion-restaurante
```

Deberías ver:
```
✅ Comanda impresa: Orden ORD-001
```

### Revisar Logs de Vercel

1. Ve a Vercel Dashboard → Deployments → Último deployment
2. Haz clic en "Functions" o "Logs"
3. Busca mensajes con `[Printer]`

Deberías ver:
```
[Printer] Servidor en la nube - enviando a servicio local de impresión
[Printer] Comanda enviada a servicio local: Comanda impresa correctamente
```

---

## 🆘 Si No Funciona

### "No imprime automáticamente"

1. **Verifica que el servicio local esté corriendo:**
   ```cmd
   pm2 status
   ```

2. **Verifica las variables en Vercel:**
   - `PRINT_SERVICE_URL=http://192.168.1.122:3001`
   - `PRINT_SERVICE_TOKEN=tu-token-aqui`

3. **Verifica que cambiaste el estado:**
   - NO uses los botones de "Imprimir"
   - Usa el botón "En Preparación" o "Pagar"

4. **Revisa los logs:**
   ```cmd
   pm2 logs impresion-restaurante
   ```

### "Sigue abriendo la ventana de impresión del navegador"

- Eso es normal si haces clic en los botones "🖨️ Comanda Cocina" o "🧾 Boleta Cliente"
- Esos botones son para impresión manual
- **La impresión automática se activa al cambiar el estado**, no con esos botones

---

## 📝 Resumen

| Acción | Tipo de Impresión | Dónde Imprime |
|--------|-------------------|---------------|
| Clic en "🖨️ Comanda Cocina" | Manual (navegador) | Tu dispositivo |
| Cambiar a "En Preparación" | Automática (backend) | Impresora del local ✅ |
| Clic en "🧾 Boleta Cliente" | Manual (navegador) | Tu dispositivo |
| Pagar orden | Automática (backend) | Impresora del local ✅ |

---

**¡La impresión automática se activa al cambiar el estado, no con los botones de imprimir!** ✅







