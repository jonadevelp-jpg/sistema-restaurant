# Instrucciones para hacer Push a GitHub

## Problema
Git está usando credenciales de `idocstoreapp` pero necesitas hacer push a `jonadevelp-jpg/sistema-restaurant`.

## Soluciones

### Opción 1: Usar Personal Access Token (Recomendado)

1. **Crear un Personal Access Token en GitHub:**
   - Ve a: https://github.com/settings/tokens
   - Click en "Generate new token" → "Generate new token (classic)"
   - Nombre: "sistema-restaurant-push"
   - Selecciona el scope: `repo` (acceso completo a repositorios)
   - Click en "Generate token"
   - **COPIA EL TOKEN** (solo se muestra una vez)

2. **Configurar Git para usar el token:**
   ```powershell
   cd sistema-restaurant
   git remote set-url origin https://jonadevelp-jpg:[TU_TOKEN]@github.com/jonadevelp-jpg/sistema-restaurant.git
   ```

   Reemplaza `[TU_TOKEN]` con el token que copiaste.

3. **Hacer push:**
   ```powershell
   git push origin master
   ```

### Opción 2: Usar GitHub CLI (gh)

1. **Instalar GitHub CLI** (si no lo tienes):
   - Descarga desde: https://cli.github.com/
   - O con winget: `winget install GitHub.cli`

2. **Autenticarse:**
   ```powershell
   gh auth login
   ```
   - Selecciona "GitHub.com"
   - Selecciona "HTTPS"
   - Selecciona "Login with a web browser"
   - Sigue las instrucciones

3. **Hacer push:**
   ```powershell
   cd sistema-restaurant
   git push origin master
   ```

### Opción 3: Usar SSH (Más seguro a largo plazo)

1. **Generar clave SSH** (si no tienes una):
   ```powershell
   ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
   ```

2. **Agregar la clave a GitHub:**
   - Copia el contenido de `~/.ssh/id_ed25519.pub`
   - Ve a: https://github.com/settings/keys
   - Click en "New SSH key"
   - Pega la clave y guarda

3. **Cambiar el remote a SSH:**
   ```powershell
   cd sistema-restaurant
   git remote set-url origin git@github.com:jonadevelp-jpg/sistema-restaurant.git
   ```

4. **Hacer push:**
   ```powershell
   git push origin master
   ```

## Verificar el Remote

Para verificar que el remote está correcto:
```powershell
cd sistema-restaurant
git remote -v
```

Debería mostrar:
```
origin  https://github.com/jonadevelp-jpg/sistema-restaurant.git (fetch)
origin  https://github.com/jonadevelp-jpg/sistema-restaurant.git (push)
```

## Después del Push

Una vez que hagas push exitosamente, Vercel debería detectar automáticamente los cambios y hacer deploy. Si no es así:

1. Ve a tu dashboard de Vercel
2. Selecciona el proyecto
3. Click en "Redeploy" o espera a que se despliegue automáticamente

## Nota sobre Seguridad

Si usas un Personal Access Token, **nunca lo compartas** ni lo subas a GitHub. Si accidentalmente lo subes, revócalo inmediatamente y crea uno nuevo.

