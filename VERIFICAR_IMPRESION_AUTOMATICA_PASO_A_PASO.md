# 🔍 Verificar Impresión Automática - Paso a Paso

## ⚠️ IMPORTANTE: NO USES LOS BOTONES DE IMPRIMIR

Los botones **"🖨️ Comanda"** y **"🧾 Boleta"** abren la ventana de impresión del navegador (TU dispositivo).

**La impresión automática se activa SOLO cuando cambias el ESTADO de la orden.**

---

## ✅ Cómo Probar la Impresión Automática

### Paso 1: Verificar Servicio Local

En la PC del local, ejecuta:

```cmd
ver-estado.bat
```

**Debe mostrar:**
```
impresion-restaurante | online
```

Si dice "stopped" o "errored":
```cmd
iniciar-servicio.bat
```

---

### Paso 2: Abrir Logs en Tiempo Real

En la PC del local, ejecuta:

```cmd
ver-logs.bat
```

**Deja esta ventana abierta** para ver qué pasa cuando cambias el estado.

---

### Paso 3: Probar la Impresión Automática

**IMPORTANTE:** NO uses los botones "🖨️ Comanda" o "🧾 Boleta"

**En su lugar:**

1. Abre una orden en el navegador
2. Agrega items a la orden
3. Haz clic en el botón **"⏳ Preparación"** (NO en "🖨️ Comanda")
4. Observa los logs en la PC del local

**Deberías ver en los logs:**
```
✅ Comanda impresa: Orden ORD-001
```

**O si hay error:**
```
❌ Error conectando a impresora: ...
```

---

### Paso 4: Verificar Variables en Vercel

1. Ve a: https://vercel.com → Tu proyecto → Settings → Environment Variables
2. Verifica que existan:

```
PRINT_SERVICE_URL=http://192.168.1.122:3001
PRINT_SERVICE_TOKEN=tu-token-aqui
```

**Si no están o la IP es incorrecta:**
1. Obtén la IP de la PC del local: `ipconfig`
2. Obtén el token: `type .env` en la PC del local
3. Agrega/actualiza las variables en Vercel
4. **Redesplegar** después de cambiar

---

### Paso 5: Verificar Conexión

En la PC del local, ejecuta:

```cmd
probar-conexion.bat
```

Este script verifica:
- ✅ Si el servicio está corriendo
- ✅ Si el puerto 3001 está escuchando
- ✅ Si responde a peticiones HTTP

---

## 🆘 Problemas Comunes

### "Sigue abriendo la ventana de impresión del navegador"

**Causa:** Estás usando los botones "🖨️ Comanda" o "🧾 Boleta"

**Solución:**
- ❌ NO uses esos botones
- ✅ Usa el botón **"⏳ Preparación"** para imprimir comanda
- ✅ Usa el botón **"💰 Pagar"** para imprimir boleta

---

### "No veo nada en los logs cuando cambio el estado"

**Causa:** El servidor de Vercel no puede alcanzar el servicio local

**Verifica:**
1. ¿El servicio está corriendo? (`ver-estado.bat`)
2. ¿Las variables están en Vercel? (IP y token correctos)
3. ¿Redesplegaste después de cambiar las variables?
4. ¿El firewall permite el puerto 3001?

**Solución:**
1. Ejecuta `probar-conexion.bat` en la PC del local
2. Verifica que el puerto 3001 esté escuchando
3. Verifica las variables en Vercel
4. Redesplegar en Vercel

---

### "Veo error en los logs: Connection refused"

**Causa:** El servicio local no está corriendo o la IP es incorrecta

**Solución:**
1. Ejecuta `iniciar-servicio.bat`
2. Verifica la IP: `ipconfig`
3. Actualiza `PRINT_SERVICE_URL` en Vercel
4. Redesplegar

---

### "Veo error: Token inválido"

**Causa:** El token no coincide

**Solución:**
1. Obtén el token de la PC del local: `type .env`
2. Verifica que sea **exactamente igual** en Vercel
3. Sin espacios extra, sin saltos de línea
4. Redesplegar

---

## 📋 Checklist Completo

- [ ] Servicio local corriendo (`ver-estado.bat` muestra "online")
- [ ] Logs abiertos (`ver-logs.bat` corriendo)
- [ ] Variables configuradas en Vercel (IP y token)
- [ ] Redesplegado después de cambiar variables
- [ ] Cambias el ESTADO (no usas botones de imprimir)
- [ ] Observas los logs cuando cambias el estado

---

## 🔍 Flujo Correcto

1. **Crear orden** → Agregar items
2. **Cambiar estado a "Preparación"** → Debe imprimir comanda automáticamente ✅
3. **Cambiar estado a "Lista"** → No imprime nada (normal)
4. **Pagar orden** → Debe imprimir boleta automáticamente ✅

---

**Recuerda: La impresión automática se activa al cambiar el ESTADO, no con los botones de imprimir.** ✅







