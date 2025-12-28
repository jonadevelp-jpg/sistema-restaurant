# 🔧 Solución: Puerto 4321 en Uso

## ⚠️ Problema

El puerto 4321 (puerto por defecto de Astro) está en uso aunque no tienes la terminal abierta. Esto significa que hay un proceso de Node.js/Astro corriendo en segundo plano.

---

## ✅ Solución Rápida

### Opción 1: Matar Solo el Proceso del Puerto 4321

Ejecuta:

```cmd
matar-proceso-puerto-4321.bat
```

Este script:
1. Busca qué proceso está usando el puerto 4321
2. Lo mata automáticamente
3. Verifica que el puerto esté libre

---

### Opción 2: Ver Qué Proceso Está Usando el Puerto

Primero verifica qué proceso es:

```cmd
verificar-puerto-4321.bat
```

Esto mostrará el **PID** (Process ID) del proceso que está usando el puerto.

Luego puedes matarlo manualmente:
```cmd
taskkill /PID [numero-del-pid] /F
```

---

### Opción 3: Matar Todos los Procesos Node.js (Cuidado)

**⚠️ ADVERTENCIA:** Esto matará TODOS los procesos de Node.js, incluyendo:
- El servicio de impresión (si está corriendo)
- Cualquier otro servidor Node.js

Ejecuta solo si estás seguro:

```cmd
matar-todos-node.bat
```

**Después de esto, necesitarás reiniciar el servicio de impresión:**
```cmd
reiniciar-servicio.bat
```

---

## 🔍 Por Qué Sucede Esto

El puerto 4321 puede estar en uso porque:

1. **Terminaste Astro incorrectamente** (Ctrl+C no siempre funciona)
2. **Cerraste la terminal sin detener el servidor**
3. **El proceso quedó como "zombie"** en segundo plano
4. **Hay otro proceso usando ese puerto**

---

## ✅ Verificar que Está Libre

Después de matar el proceso, verifica:

```cmd
netstat -ano | findstr ":4321"
```

Si no muestra nada, el puerto está libre. ✅

---

## 📝 Prevenir en el Futuro

Para evitar que esto suceda:

1. **Siempre detén el servidor correctamente** con `Ctrl+C`
2. **Espera a que termine** antes de cerrar la terminal
3. **Usa `npm run dev`** desde una terminal dedicada
4. **Cierra la terminal después de detener el servidor**

---

## 🆘 Si Sigue Sin Funcionar

Si después de matar el proceso el puerto sigue en uso:

1. **Reinicia la PC** (solución definitiva)
2. **O cambia el puerto de Astro** en `astro.config.mjs`:
   ```javascript
   export default defineConfig({
     server: {
       port: 4322  // Cambia a otro puerto
     }
   });
   ```

---

**El puerto 4321 es el puerto por defecto de Astro. Si está en uso, simplemente hay un proceso de Node.js corriendo que necesita ser detenido.** ✅







