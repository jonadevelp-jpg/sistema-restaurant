# 🔍 Diagnóstico Completo: Error 401

## ⚠️ Problema

Sigue apareciendo error 401 aunque los tokens coinciden. Necesitamos ver exactamente qué está pasando.

---

## ✅ Pasos de Diagnóstico

### Paso 1: Ver Token en el Servicio

Ejecuta en la PC del local:

```cmd
debug-token.bat
```

Este script mostrará:
- El token que está en el `.env`
- Si el servicio está corriendo
- Los logs del servicio relacionados con el token

---

### Paso 2: Ver Logs Detallados

1. **Abre los logs en tiempo real:**
   ```cmd
   ver-logs.bat
   ```

2. **En otra ventana, ejecuta la prueba:**
   ```cmd
   probar-manualmente.bat
   ```

3. **Observa los logs** - Deberías ver algo como:

```
🔐 ========== VERIFICACIÓN DE TOKEN ==========
🔐 Header Authorization completo: Bearer tu-token-aqui...
🔐 Token esperado (completo): tu-token-aqui...
🔐 Token recibido (completo): tu-token-aqui...
🔐 Tokens son iguales? true/false
```

**Si ves `false`, hay una diferencia entre los tokens.**

---

### Paso 3: Verificar Caracteres Especiales

El problema puede ser:
- **Espacios invisibles** al inicio o final
- **Saltos de línea** en el token
- **Caracteres especiales** que se interpretan diferente

**Solución:**

1. Abre el `.env` con Bloc de Notas
2. Busca la línea: `PRINT_SERVICE_TOKEN=`
3. **Selecciona TODO el token** (después del `=`)
4. **Copia** (Ctrl+C)
5. **Pega en un nuevo Bloc de Notas** para ver si hay caracteres invisibles
6. **Elimina espacios** al inicio y final
7. **Guarda** el `.env`
8. **Reinicia el servicio:** `reiniciar-servicio.bat`

---

### Paso 4: Verificar en Vercel

1. Ve a Vercel → Settings → Environment Variables
2. Edita `PRINT_SERVICE_TOKEN`
3. **Selecciona TODO el valor**
4. **Copia**
5. **Pega en Bloc de Notas** para verificar
6. **Elimina espacios** al inicio y final
7. **Pega de nuevo** en Vercel
8. **Guarda**
9. **REDESPLEGAR** (muy importante)

---

### Paso 5: Probar con Token Simple

Para descartar problemas con caracteres especiales:

1. **Genera un token simple:**
   ```
   test-token-12345
   ```

2. **Actualiza en `.env`:**
   ```
   PRINT_SERVICE_TOKEN=test-token-12345
   ```

3. **Actualiza en Vercel** (el mismo token)

4. **Reinicia el servicio local**

5. **Redesplegar en Vercel**

6. **Prueba de nuevo**

Si funciona con el token simple, el problema es con caracteres especiales en el token original.

---

## 🔍 Qué Buscar en los Logs

Cuando ejecutes `probar-manualmente.bat` y veas los logs, busca:

### ✅ Si Funciona:
```
✅ Token válido - Autenticación exitosa
📥 Petición recibida...
✅ Comanda impresa: Orden TEST-001
```

### ❌ Si Falla:
```
❌ Token inválido - Comparación fallida
❌ Diferencia en posición X:
   Recibido: "X" (código: XX)
   Esperado: "Y" (código: YY)
```

**Esto te dirá exactamente dónde está la diferencia.**

---

## 📝 Resumen

1. ✅ Ejecuta `debug-token.bat` para ver el token del `.env`
2. ✅ Abre `ver-logs.bat` en tiempo real
3. ✅ Ejecuta `probar-manualmente.bat` en otra ventana
4. ✅ Observa los logs detallados
5. ✅ Si hay diferencia, verifica caracteres especiales
6. ✅ Prueba con un token simple para descartar problemas

**Los logs ahora muestran TODO el token (completo) para que puedas comparar exactamente qué está pasando.** 🔍







