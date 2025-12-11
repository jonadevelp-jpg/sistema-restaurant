# 🚀 Setup Rápido para GitHub y Vercel

## ✅ Paso 1: Verificar que Git está inicializado

```bash
cd app-final
git status
```

Si dice "not a git repository", inicializa:

```bash
git init
```

## ✅ Paso 2: Agregar archivos y hacer commit

```bash
# Agregar todos los archivos (excepto los que están en .gitignore)
git add .

# Hacer el primer commit
git commit -m "Initial commit: Sistema Restaurante Completo"
```

## ✅ Paso 3: Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `sistema-restaurante-completo` (o el que prefieras)
3. **NO marques** "Initialize with README"
4. Haz clic en "Create repository"

## ✅ Paso 4: Conectar y subir

GitHub te mostrará comandos. Ejecuta estos (reemplaza `TU_USUARIO` y `TU_REPOSITORIO`):

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

## ✅ Paso 5: Deploy en Vercel

1. Ve a https://vercel.com
2. "Add New Project" > Importa tu repositorio
3. Configura variables de entorno:
   - `PUBLIC_SUPABASE_URL` = tu URL de Supabase
   - `PUBLIC_SUPABASE_ANON_KEY` = tu anon key
4. Root Directory: `.` (o deja vacío si solo está app-final)
5. Framework: Astro (debería detectarse automáticamente)
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Haz clic en "Deploy"

## ⚠️ Si hay problemas con app-final/

Si ves un error sobre `app-final/` al hacer `git add`:

```bash
# Eliminar el subdirectorio app-final si existe y está vacío
Remove-Item -Recurse -Force app-final

# O si tiene contenido importante, muévelo fuera primero
```

## 📝 Notas

- El archivo `.env` NO se subirá (está en .gitignore)
- Las variables de entorno se configuran en Vercel, no en el código
- Cada push a `main` desplegará automáticamente en Vercel

---

**¡Listo!** 🎉


