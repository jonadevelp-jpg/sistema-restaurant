# 🔐 Crear Token de GitHub con Permisos Correctos

## ⚠️ IMPORTANTE: Seguridad

**Tu token anterior fue expuesto. Debes revocarlo inmediatamente:**
1. Ve a: https://github.com/settings/tokens
2. Encuentra el token que empieza con `github_pat_11B4ADHQY0...`
3. Click en "Revoke" (Revocar)

## 📝 Pasos para Crear un Nuevo Token

### Paso 1: Crear el Token

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Completa el formulario:
   - **Note (Nombre):** `sistema-restaurant-push`
   - **Expiration:** Elige una fecha (recomendado: 90 días o "No expiration" si es solo para ti)
   - **Select scopes:** Marca **SOLO** estos:
     - ✅ `repo` (Full control of private repositories)
       - Esto incluye automáticamente: repo:status, repo_deployment, public_repo, repo:invite, security_events

### Paso 2: Generar y Copiar

1. Click en **"Generate token"** (al final de la página)
2. **COPIA EL TOKEN INMEDIATAMENTE** (solo se muestra una vez)
3. Guárdalo en un lugar seguro (pero NO lo subas a GitHub)

### Paso 3: Configurar Git

Ejecuta este comando (reemplaza `[TU_TOKEN]` con el token que copiaste):

```powershell
cd sistema-restaurant
git remote set-url origin https://jonadevelp-jpg:[TU_TOKEN]@github.com/jonadevelp-jpg/sistema-restaurant.git
```

### Paso 4: Verificar y Hacer Push

```powershell
# Verificar que el remote está correcto
git remote -v

# Hacer push
git push origin master
```

## 🔒 Mejores Prácticas de Seguridad

1. **Nunca compartas tu token** en mensajes, chats, o código
2. **Nunca subas el token** a GitHub (incluso en archivos privados)
3. **Usa tokens con expiración** cuando sea posible
4. **Revoca tokens** que ya no uses
5. **Considera usar SSH** para mayor seguridad a largo plazo

## 🚀 Alternativa: Usar SSH (Más Seguro)

Si prefieres no usar tokens, puedes configurar SSH:

1. **Generar clave SSH:**
   ```powershell
   ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
   ```

2. **Agregar clave a GitHub:**
   - Copia el contenido de `~/.ssh/id_ed25519.pub`
   - Ve a: https://github.com/settings/keys
   - Click en "New SSH key"
   - Pega la clave

3. **Cambiar remote a SSH:**
   ```powershell
   cd sistema-restaurant
   git remote set-url origin git@github.com:jonadevelp-jpg/sistema-restaurant.git
   ```

4. **Hacer push:**
   ```powershell
   git push origin master
   ```

