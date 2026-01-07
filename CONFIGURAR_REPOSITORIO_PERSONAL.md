# 🔧 Configurar Repositorio Personal

## Situación Actual

- **Usuario Git configurado**: `jotherd2-creator`
- **Email configurado**: `idocstoreapp@gmail.com`
- **Remoto origin actual**: `idocstoreapp/sistema-restaurant` (no es tu repositorio)
- **Remoto upstream**: `jonadevelp-jpg/sistema-restaurant` (repositorio original)

## Pasos para Configurar tu Repositorio

### Opción 1: Si ya tienes un repositorio en GitHub

1. **Cambiar el remoto origin a tu repositorio:**
   ```bash
   cd sistema-restaurant
   git remote set-url origin https://github.com/TU_USUARIO/sistema-restaurant.git
   ```

2. **Verificar:**
   ```bash
   git remote -v
   ```

3. **Hacer push:**
   ```bash
   git push origin master
   ```

### Opción 2: Si necesitas crear un nuevo repositorio

1. **Crear repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre: `sistema-restaurant` (o el que prefieras)
   - **NO** inicialices con README, .gitignore o licencia
   - Crea el repositorio

2. **Cambiar el remoto:**
   ```bash
   cd sistema-restaurant
   git remote set-url origin https://github.com/TU_USUARIO/sistema-restaurant.git
   ```

3. **Hacer push:**
   ```bash
   git push -u origin master
   ```

### Opción 3: Si quieres mantener ambos remotos

1. **Agregar tu repositorio como nuevo remoto:**
   ```bash
   cd sistema-restaurant
   git remote add personal https://github.com/TU_USUARIO/sistema-restaurant.git
   ```

2. **Hacer push a tu repositorio:**
   ```bash
   git push personal master
   ```

## Configurar Vercel

Una vez que tengas tu repositorio configurado:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a Settings → Git
4. Conecta tu repositorio personal: `TU_USUARIO/sistema-restaurant`

## Importante: Seguridad

⚠️ **NO subas el archivo `.env` a GitHub**. Asegúrate de que esté en `.gitignore`.


