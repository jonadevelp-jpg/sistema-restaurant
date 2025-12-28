# 🔧 Solución: Token No Se Carga del .env

## ⚠️ Problema Detectado

Los logs muestran:
- **Token del .env:** `tu-token-seguro-aqui...` ✅
- **Token en el servicio:** `cambiar-es...` (valor por defecto) ❌

**Esto significa que el servicio NO está cargando el `.env` correctamente.**

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar e Instalar dotenv

Ejecuta en la PC del local:

```cmd
verificar-dotenv.bat
```

Este script:
- Verifica si `dotenv` está instalado
- Si no está, lo instala automáticamente
- Muestra el contenido del `.env`

---

### Paso 2: Reiniciar el Servicio

**MUY IMPORTANTE:** Después de instalar `dotenv` o modificar el código, debes reiniciar:

```cmd
reiniciar-servicio.bat
```

---

### Paso 3: Verificar que Cargó el Token

Abre los logs:

```cmd
ver-logs.bat
```

**Deberías ver:**

```
✅ Archivo .env cargado con dotenv
🖨️  Servicio de Impresión Local iniciado
📡 Escuchando en puerto 3001
🔐 .env cargado: SÍ
🔐 Token configurado: SÍ
🔐 Token (completo): tu-token-seguro-aqui...
🔐 Token (longitud): XX caracteres
```

**Si ves:**

```
⚠️  ADVERTENCIA: El servicio está usando el token por defecto "cambiar-este-token"
```

**El `.env` NO se está cargando.** Sigue al Paso 4.

---

### Paso 4: Verificar Ubicación del .env

El archivo `.env` **DEBE estar en la misma carpeta** que `server.js`:

```
servicio-impresion-local/
  ├── server.js
  ├── package.json
  ├── .env          ← DEBE estar aquí
  └── node_modules/
```

**Verifica:**

1. Ve a la carpeta `servicio-impresion-local`
2. Verifica que existe el archivo `.env`
3. Abre el `.env` con Bloc de Notas
4. Verifica que tiene: `PRINT_SERVICE_TOKEN=tu-token-aqui`

---

### Paso 5: Verificar que PM2 Está en el Directorio Correcto

1. Ejecuta: `pm2 show impresion-restaurante`
2. Busca la línea `cwd` (directorio de trabajo)
3. **Debe ser:** `C:\ruta\completa\a\servicio-impresion-local`

**Si el `cwd` es diferente:**

1. Detén el servicio: `pm2 stop impresion-restaurante`
2. Elimina el proceso: `pm2 delete impresion-restaurante`
3. Ve a la carpeta correcta: `cd C:\ruta\completa\a\servicio-impresion-local`
4. Inicia de nuevo: `pm2 start server.js --name impresion-restaurante`
5. Guarda: `pm2 save`

---

### Paso 6: Cargar .env en PM2 Explícitamente

Si sigue sin funcionar, carga el `.env` explícitamente en PM2:

1. Crea o edita `ecosystem.config.js` en la carpeta `servicio-impresion-local`:

```javascript
module.exports = {
  apps: [{
    name: 'impresion-restaurante',
    script: 'server.js',
    cwd: __dirname,
    env_file: '.env',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

2. Reinicia con:
   ```cmd
   pm2 delete impresion-restaurante
   pm2 start ecosystem.config.js
   pm2 save
   ```

---

## 🔍 Verificación Final

Después de todos los pasos:

1. **Ejecuta:** `ver-logs.bat`
2. **Busca:** `🔐 Token (completo): tu-token-seguro-aqui...`
3. **NO debe aparecer:** `cambiar-este-token`

Si ves tu token real en los logs, el problema está resuelto. ✅

---

## 📝 Resumen

1. ✅ Ejecuta `verificar-dotenv.bat` para instalar dotenv
2. ✅ Verifica que el `.env` está en la misma carpeta que `server.js`
3. ✅ Reinicia el servicio: `reiniciar-servicio.bat`
4. ✅ Verifica los logs: `ver-logs.bat` (debe mostrar tu token real)
5. ✅ Prueba: `probar-manualmente.bat` (debe funcionar)

**El problema es que el servicio no estaba cargando el `.env`. Con estos cambios se soluciona.** ✅







