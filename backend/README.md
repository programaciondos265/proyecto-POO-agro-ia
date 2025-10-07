# AgroIA Backend - Sistema de Autenticación

Backend para el sistema de autenticación de AgroIA con Node.js, Express, PostgreSQL y OAuth con Google.

## 🚀 Características

- ✅ Registro de usuarios con verificación de email
- ✅ Inicio de sesión con email y contraseña
- ✅ Recuperación de contraseña por email
- ✅ Autenticación OAuth con Google
- ✅ JWT para autenticación de sesiones
- ✅ Hashing seguro de contraseñas con bcrypt
- ✅ Base de datos PostgreSQL
- ✅ Envío de emails con Nodemailer
- ✅ Middleware de seguridad (Helmet, CORS)
- ✅ Validación de datos
- ✅ Manejo de errores robusto

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp env.example .env
```

3. **Editar el archivo `.env` con tus configuraciones:**
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agro_ia_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# JWT Configuration
JWT_SECRET=tu_clave_secreta_jwt_muy_segura
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion

# Google OAuth Configuration
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

4. **Configurar PostgreSQL:**
```sql
-- Crear base de datos
CREATE DATABASE agro_ia_db;

-- Crear usuario (opcional)
CREATE USER agro_user WITH PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE agro_ia_db TO agro_user;
```

5. **Configurar Google OAuth:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la API de Google+ y OAuth2
   - Crea credenciales OAuth 2.0
   - Añade `http://localhost:5173` como URI de redirección autorizada

6. **Configurar Gmail para envío de emails:**
   - Habilita la verificación en 2 pasos en tu cuenta de Google
   - Genera una "Contraseña de aplicación" específica para esta app
   - Usa esta contraseña en la variable `EMAIL_PASS`

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Autenticación
- `POST /api/registro` - Registrar nuevo usuario
- `POST /api/login` - Iniciar sesión
- `GET /api/perfil` - Obtener perfil del usuario (requiere autenticación)

### Recuperación de Contraseña
- `POST /api/recuperar-contraseña` - Solicitar recuperación
- `POST /api/restablecer-contraseña/:token` - Restablecer contraseña

### Verificación de Email
- `GET /api/verificar-email/:token` - Verificar email

### Google OAuth
- `POST /api/auth/google` - Autenticación con Google
- `GET /api/auth/google/url` - Obtener URL de autenticación

### Utilidades
- `GET /health` - Estado del servidor

## 🔧 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Configuración de PostgreSQL
│   │   └── initDatabase.ts      # Script de inicialización de BD
│   ├── controllers/
│   │   ├── authController.ts    # Controladores de autenticación
│   │   └── googleAuthController.ts # Controladores de Google OAuth
│   ├── middleware/
│   │   └── auth.ts              # Middleware de autenticación JWT
│   ├── models/
│   │   ├── User.ts              # Modelo de usuario
│   │   └── PasswordRecovery.ts  # Modelo de recuperación
│   ├── routes/
│   │   ├── authRoutes.ts        # Rutas de autenticación
│   │   └── googleAuthRoutes.ts  # Rutas de Google OAuth
│   ├── utils/
│   │   └── emailService.ts      # Servicio de envío de emails
│   └── index.ts                 # Punto de entrada del servidor
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- JWT con expiración configurable
- Validación de entrada de datos
- CORS configurado para el frontend
- Helmet para headers de seguridad
- Tokens de recuperación con expiración
- Verificación de email obligatoria

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Error de envío de emails
- Verifica las credenciales de Gmail
- Asegúrate de usar una "Contraseña de aplicación"
- Revisa que la verificación en 2 pasos esté habilitada

### Error de Google OAuth
- Verifica las credenciales en Google Cloud Console
- Confirma que la URI de redirección esté configurada
- Revisa que las APIs necesarias estén habilitadas

## 📝 Notas de Desarrollo

- El servidor se reinicia automáticamente en modo desarrollo
- Los logs incluyen información detallada de errores
- La base de datos se inicializa automáticamente al iniciar el servidor
- Los tokens de recuperación expiran en 24 horas por defecto
