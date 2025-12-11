# 📤 Comandos para Subir a GitHub

## 🚀 Inicialización y Primer Push

### 1. Inicializar Git (si no está inicializado)

```bash
cd app-final
git init
```

### 2. Agregar todos los archivos

```bash
git add .
```

### 3. Hacer el primer commit

```bash
git commit -m "Initial commit: Sistema Restaurante Completo con Menú QR, POS y Administración"
```

### 4. Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un nuevo repositorio (sin inicializar con README)
3. Copia la URL del repositorio (ejemplo: `https://github.com/TU_USUARIO/TU_REPOSITORIO.git`)

### 5. Conectar y subir

```bash
# Reemplaza con tu URL de GitHub
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

## 🔄 Comandos para Actualizaciones Futuras

```bash
# Ver estado de los archivos
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios realizados"

# Subir a GitHub
git push
```

## 📋 Ejemplo Completo

```bash
# Navegar al directorio
cd app-final

# Inicializar git (solo la primera vez)
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Initial commit: Sistema Restaurante Completo"

# Conectar con GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Cambiar a rama main
git branch -M main

# Subir a GitHub
git push -u origin main
```

## ⚠️ Notas Importantes

- **Nunca subas el archivo `.env`** - Contiene información sensible
- **Verifica que `.gitignore` incluya** `node_modules`, `.env`, `dist`, etc.
- **El archivo `.gitignore` ya está configurado** correctamente

## 🔍 Verificar Estado

```bash
# Ver qué archivos están siendo rastreados
git status

# Ver qué archivos NO están siendo rastreados (deberían estar en .gitignore)
git status --ignored
```

---

**¡Listo para subir!** 🚀


