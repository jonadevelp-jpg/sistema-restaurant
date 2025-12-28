# 🔧 Solución: Error 401 - Token Inválido

## ⚠️ Problema

El error 401 "No autorizado" significa que el **token no coincide** entre:
- El archivo `.env` del servicio local
- Las variables de Vercel

---

## ✅ Solución Paso a Paso

### Paso 1: Ver Token en el Servicio Local

En la PC del local, ejecuta:

```cmd
ver-token.bat
```

Esto mostrará el contenido del archivo `.env` y podrás ver el token configurado.

**Copia el valor de `PRINT_SERVICE_TOKEN=...`**

---

### Paso 2: Verificar Token en Vercel

1. Ve a: https://vercel.com → Tu proyecto → **Settings** → **Environment Variables**
2. Busca la variable `PRINT_SERVICE_TOKEN`
3. **Verifica que el valor sea EXACTAMENTE igual** al del archivo `.env`
4. **Sin espacios extra**, **sin saltos de línea**, **sin caracteres especiales ocultos**

---

### Paso 3: Si el Token es Diferente

**Opción A: Actualizar Vercel con el token del .env**

1. Copia el token del archivo `.env` (del paso 1)
2. Ve a Vercel → Settings → Environment Variables
3. Edita `PRINT_SERVICE_TOKEN`
4. Pega el token exacto del `.env`
5. Guarda
6. **REDESPLEGAR** (muy importante)

**Opción B: Actualizar .env con el token de Vercel**

1. Copia el token de Vercel
2. Edita el archivo `.env` en la PC del local
3. Reemplaza el valor de `PRINT_SERVICE_TOKEN=...`
4. Guarda
5. Reinicia el servicio: `reiniciar-servicio.bat`

---

### Paso 4: Probar de Nuevo

Ejecuta:

```cmd
probar-manualmente.bat
```

**Deberías ver:**
```
✅ Token válido
📥 Petición recibida...
✅ Comanda impresa: Orden TEST-001
```

---

## 🔍 Verificar que Funciona

Después de corregir el token:

1. **Reinicia el servicio local:**
   ```cmd
   reiniciar-servicio.bat
   ```

2. **Abre logs:**
   ```cmd
   ver-logs.bat
   ```

3. **Prueba manualmente:**
   ```cmd
   probar-manualmente.bat
   ```

4. **Si funciona, prueba desde la web:**
   - Cambia el estado de una orden
   - Deberías ver logs en el servicio local

---

## 📝 Resumen

1. ✅ Ver token en `.env`: `ver-token.bat`
2. ✅ Verificar token en Vercel (debe ser igual)
3. ✅ Si son diferentes, actualizar uno de los dos
4. ✅ Redesplegar en Vercel (si cambiaste Vercel)
5. ✅ Reiniciar servicio local (si cambiaste .env)
6. ✅ Probar de nuevo

---

**El token debe ser EXACTAMENTE igual en ambos lugares.** ✅







