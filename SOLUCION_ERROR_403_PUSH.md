# 🔧 Solución al Error 403 al Hacer Push

## 🔍 Diagnóstico

El error `Permission denied to jonadevelp-jpg` indica que:
- ✅ El token **SÍ tiene permisos de lectura** (puedes hacer `git fetch`, `git ls-remote`)
- ❌ El token **NO tiene permisos de escritura** (no puedes hacer `git push`)

## ✅ Solución: Crear Token con Permisos Completos

### Paso 1: Revocar el Token Actual

1. Ve a: https://github.com/settings/tokens
2. Encuentra el token que empieza con `github_pat_11B4ADHQY0...`
3. Click en **"Revoke"** (Revocar)

### Paso 2: Crear Nuevo Token con Permisos Completos

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Completa el formulario:
   - **Note:** `sistema-restaurant-full-access`
   - **Expiration:** Elige una fecha (o "No expiration")
   - **Select scopes:** Marca **SOLO** esto:
     - ✅ **`repo`** (Full control of private repositories)
       - ⚠️ **IMPORTANTE:** Debe estar marcado el checkbox completo `repo`, no solo sub-ítems
       - Esto incluye automáticamente: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`, `workflow`

4. Click en **"Generate token"**
5. **COPIA EL TOKEN INMEDIATAMENTE** (solo se muestra una vez)

### Paso 3: Actualizar el Remote

Ejecuta este comando (reemplaza `[TU_NUEVO_TOKEN]` con el token que copiaste):

```powershell
cd sistema-restaurant
git remote set-url origin https://jonadevelp-jpg:[TU_NUEVO_TOKEN]@github.com/jonadevelp-jpg/sistema-restaurant.git
```

### Paso 4: Verificar y Hacer Push

```powershell
# Verificar el remote
git remote -v

# Hacer push
git push origin master
```

## 🔄 Alternativa: Limpiar Credenciales Guardadas

Si el problema persiste, puede ser que Windows esté usando credenciales guardadas. Limpia las credenciales:

### Opción A: Usando Git Credential Manager

```powershell
# Ver credenciales guardadas
git credential-manager list

# Eliminar credenciales de GitHub
git credential-manager erase https://github.com
```

### Opción B: Usando Windows Credential Manager

1. Presiona `Win + R`
2. Escribe: `control /name Microsoft.CredentialManager`
3. Ve a "Credenciales de Windows"
4. Busca entradas relacionadas con `github.com`
5. Elimínalas

Luego intenta hacer push de nuevo.

## 🚀 Alternativa Definitiva: Usar SSH

Si los tokens siguen dando problemas, usa SSH (más seguro y permanente):

### 1. Generar Clave SSH

```powershell
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
```

Presiona Enter para aceptar la ubicación por defecto y opcionalmente agrega una contraseña.

### 2. Copiar la Clave Pública

```powershell
cat ~/.ssh/id_ed25519.pub
```

O en Windows:
```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

### 3. Agregar Clave a GitHub

1. Ve a: https://github.com/settings/keys
2. Click en **"New SSH key"**
3. **Title:** `Mi PC - Sistema Restaurant`
4. **Key:** Pega el contenido de la clave pública
5. Click en **"Add SSH key"**

### 4. Cambiar Remote a SSH

```powershell
cd sistema-restaurant
git remote set-url origin git@github.com:jonadevelp-jpg/sistema-restaurant.git
```

### 5. Verificar Conexión SSH

```powershell
ssh -T git@github.com
```

Deberías ver: `Hi jonadevelp-jpg! You've successfully authenticated...`

### 6. Hacer Push

```powershell
git push origin master
```

## 🔍 Verificar Permisos del Repositorio

Asegúrate de que tienes permisos de escritura en el repositorio:

1. Ve a: https://github.com/jonadevelp-jpg/sistema-restaurant
2. Click en **"Settings"** (si no ves Settings, no eres el dueño)
3. Ve a **"Collaborators"** o **"Manage access"**
4. Verifica que tu usuario `jonadevelp-jpg` tenga permisos de **"Write"** o **"Admin"**

## 📝 Notas Importantes

- **Nunca compartas tu token** en mensajes o código
- **Nunca subas el token** a GitHub
- **Usa SSH** para mayor seguridad a largo plazo
- **Revoca tokens** que ya no uses

