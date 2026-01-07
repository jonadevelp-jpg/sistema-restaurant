# ✅ Checklist Pre-Deploy

Usa este checklist antes de hacer deploy a producción.

## 🔒 Seguridad

- [ ] Verificar que `.env` NO está en el repositorio
- [ ] Verificar que `.env.local` NO está en el repositorio
- [ ] Verificar que `.env.production` NO está en el repositorio
- [ ] Verificar que `.gitignore` incluye todos los archivos `.env*`
- [ ] Verificar que no hay claves o tokens hardcodeados en el código

## 📦 Configuración

- [ ] `package.json` tiene script `build`
- [ ] `package.json` especifica versión de Node.js (`engines.node`)
- [ ] `astro.config.mjs` incluye adapter de Vercel
- [ ] `vercel.json` está configurado correctamente
- [ ] `.env.example` existe y documenta todas las variables necesarias

## 🗄️ Base de Datos

- [ ] Base de datos migrada (ejecutar `database/000_INSTALACION_COMPLETA.sql`)
- [ ] Políticas RLS configuradas (ejecutar `database/FIX_TODO_DE_UNA_VEZ.sql` si es necesario)
- [ ] Bucket de imágenes creado (`menu-images`)
- [ ] Usuario admin creado en Supabase

## 🧪 Testing Local

- [ ] `npm run build` ejecuta sin errores
- [ ] `npm run preview` muestra la aplicación correctamente
- [ ] Menú digital carga correctamente
- [ ] Admin panel es accesible
- [ ] Variables de entorno funcionan localmente

## 📝 Documentación

- [ ] `README.md` actualizado
- [ ] `DEPLOY.md` creado con instrucciones
- [ ] Variables de entorno documentadas en `.env.example`

## 🚀 Deploy

- [ ] Código subido a GitHub
- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas en Vercel:
  - [ ] `PUBLIC_SUPABASE_URL`
  - [ ] `PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Build exitoso en Vercel
- [ ] Aplicación accesible en producción
- [ ] Verificar que no hay errores en consola del navegador

## 🔍 Verificación Post-Deploy

- [ ] Menú digital carga correctamente
- [ ] Imágenes se muestran correctamente
- [ ] Admin panel es accesible
- [ ] Login funciona correctamente
- [ ] Crear orden funciona
- [ ] Gestión de menú funciona

## 🛠️ Comandos Útiles

```bash
# Verificar proyecto antes de deploy
npm run check-deploy

# Build local para verificar
npm run build
npm run preview

# Verificar que .env no está en git
git status | grep .env
```

---

**✅ Si todos los items están marcados, estás listo para deploy!**




