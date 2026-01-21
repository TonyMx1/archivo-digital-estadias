# Configuración de Variables de Entorno

Para que la aplicación funcione correctamente, necesitas crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

## Pasos para configurar:

1. Crea un archivo llamado `.env.local` en la raíz del proyecto (mismo nivel que `package.json`)

2. Copia y pega el siguiente contenido, ajustando los valores según tu configuración:

```env
# Configuración de PostgreSQL
DB_HOST=sanjuandelrio.sytes.net
DB_PORT=5432
DB_NAME=archivodigital_practicante
DB_USER=user_flota
DB_PASSWORD=flota_2024!
DB_SSL=false

# Configuración de JWT (cambiar por una clave segura y aleatoria)
JWT_SECRET=tu-secret-key-muy-segura-y-aleatoria-aqui-cambiar-en-produccion

# URL de la API del CUS (Sistema de Trámites de San Juan del Río)
CUS_API_URL=https://sanjuandelrio.gob.mx/tramites-sjr/Api/principal/login
```

## Notas importantes:

- **NO** subas el archivo `.env.local` a Git (ya está en `.gitignore`)
- **JWT_SECRET**: Debe ser una cadena larga y aleatoria. Puedes generar una con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **CUS_API_URL**: Esta es la URL de la API externa para autenticación
- Después de crear el archivo, reinicia el servidor de desarrollo (`npm run dev`)

## Verificación:

Si la URL de la API del CUS no está configurada, verás una advertencia en la consola del servidor:
```
⚠️ CUS_API_URL no está configurada en las variables de entorno
```
