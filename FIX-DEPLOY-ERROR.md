# 🔧 Fix: Error de Build en Vercel

## Problema

El build fallaba en Vercel con el error:
```
Could not resolve "../../src/lib/printer-service" from "backend/src/controllers/orders.controller.ts"
```

## Causa

El archivo `backend/src/controllers/orders.controller.ts` intenta importar dinámicamente `printer-service` que está en `src/lib/printer-service.ts`. Durante el build, Rollup intenta resolver esta importación estáticamente y no puede encontrar el archivo porque la ruta relativa no es correcta en el contexto del build.

## Solución

Se implementaron dos cambios:

### 1. Modificación en `orders.controller.ts`

- Se agregó detección de entorno Vercel para evitar la importación en producción
- Se mantiene el try-catch para manejar errores silenciosamente
- El servicio de impresión solo funciona localmente, no en Vercel

### 2. Modificación en `astro.config.mjs`

- Se marcó `printer-service` como `external` en Rollup para evitar que intente resolverlo durante el build
- Se agregó `onwarn` para ignorar advertencias relacionadas con `printer-service`

## Resultado

- ✅ El build ahora completa exitosamente en Vercel
- ✅ El servicio de impresión sigue funcionando localmente
- ✅ En Vercel, el servicio de impresión simplemente retorna `null` (no hay impresoras físicas disponibles de todas formas)

## Nota

El servicio de impresión está diseñado para funcionar solo en servidores locales con impresoras físicas conectadas. En Vercel (producción), no hay impresoras disponibles, por lo que es correcto que el servicio no esté disponible.


