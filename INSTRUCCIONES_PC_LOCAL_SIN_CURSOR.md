# 🖥️ Instrucciones para PC del Local (Sin Cursor)

## 🚀 Solución Automática (TODO EN UNO)

En la PC del local, simplemente ejecuta:

```cmd
solucionar-todo.bat
```

**Este script hace TODO automáticamente:**
1. ✅ Habilita la ejecución de scripts en PowerShell
2. ✅ Verifica e instala Node.js (si falta)
3. ✅ Verifica e instala PM2 (si falta)
4. ✅ Crea el archivo `.env` con configuración
5. ✅ Instala dependencias
6. ✅ Inicia el servicio
7. ✅ Configura auto-inicio
8. ✅ Muestra tu IP y token

**¡Solo haz doble clic y espera!** ⏳

---

## 📋 Scripts Disponibles

### `solucionar-todo.bat` ⭐ (RECOMENDADO)
- **Hace TODO automáticamente**
- Ejecuta este primero

### `ver-estado.bat`
- Muestra si el servicio está corriendo
- Úsalo para verificar que todo funciona

### `ver-logs.bat`
- Muestra los logs en tiempo real
- Úsalo para ver qué está pasando cuando cambias el estado de una orden

### `iniciar-servicio.bat`
- Inicia el servicio si se detuvo
- Úsalo si el servicio no está corriendo

---

## 🔍 Verificar que Funciona

### Paso 1: Ejecutar el Script Principal

1. Ve a la carpeta `servicio-impresion-local`
2. Haz doble clic en `solucionar-todo.bat`
3. Espera a que termine (puede tardar 2-3 minutos)
4. Al final te mostrará:
   - Tu IP local
   - El token generado
   - El estado del servicio

### Paso 2: Verificar el Estado

Ejecuta `ver-estado.bat` y debe mostrar:

```
┌─────┬──────────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                    │ status  │ restart │ uptime   │
├─────┼──────────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ impresion-restaurante   │ online  │ 0       │ 5m       │
└─────┴──────────────────────────┴─────────┴─────────┴──────────┘
```

Si dice **"online"** en verde, ¡está funcionando! ✅

### Paso 3: Obtener el Token

Ejecuta en `cmd`:

```cmd
type .env
```

Copia el valor de `PRINT_SERVICE_TOKEN=...`

### Paso 4: Configurar en Vercel

1. Ve a: https://vercel.com → Tu proyecto → Settings → Environment Variables
2. Agrega:
   ```
   PRINT_SERVICE_URL=http://TU-IP-AQUI:3001
   PRINT_SERVICE_TOKEN=tu-token-aqui
   ```
3. Redesplegar

---

## 🆘 Si Algo Sale Mal

### "No se puede ejecutar el script"

**Solución:**
1. Clic derecho en `solucionar-todo.bat`
2. Selecciona "Ejecutar como administrador"
3. Vuelve a ejecutar

### "Node.js no está instalado"

**Solución:**
1. Ve a: https://nodejs.org/
2. Descarga la versión LTS
3. Instala normalmente
4. Reinicia la PC
5. Ejecuta `solucionar-todo.bat` de nuevo

### "El servicio no inicia"

**Solución:**
1. Ejecuta `ver-estado.bat` para ver el error
2. Ejecuta `ver-logs.bat` para ver los logs
3. Verifica que la impresora esté conectada
4. Verifica el puerto en `.env`: `PRINTER_KITCHEN_PATH=USB002`

---

## 📝 Resumen Rápido

1. ✅ Ejecuta `solucionar-todo.bat`
2. ✅ Espera a que termine
3. ✅ Copia el token del archivo `.env`
4. ✅ Configura en Vercel con tu IP y token
5. ✅ Prueba cambiando el estado de una orden

**¡Con esto debería funcionar!** 🎉

---

## 🔄 Si Cambias la Impresora

1. Ejecuta `configurar-impresora.bat`
2. Ingresa el nuevo puerto (ej: `USB003`)
3. Reinicia el servicio: `iniciar-servicio.bat`

---

**¡Todo está automatizado! Solo ejecuta `solucionar-todo.bat` y listo.** ✅







