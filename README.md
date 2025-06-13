# BackEnd Nest.js Desarrollo con Tecnologias Web 202501
Este proyecto fue realizado por 

Maria Alejandra Angulo: [Github](https://github.com/marialeang2)

Juan Diego Lozano: [Github](https://github.com/juanlozano3)

Francois Morales: [Github](https://github.com/francoismorales)

Laura Murcia: [Github](https://github.com/lauram354)

Marco Ramirez: [Github](https://github.com/LilMark0o)

## Instalación y configuración

### Instalación en macOS

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/isis3710-uniandes/ISIS3710_202510_S1_E2_Back
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Instalar PostgreSQL** (si no lo tienes instalado):

   ```bash
   brew install postgresql@15
   ```

   (personalmente uso la 17, pero desde la 13 para arriba sirve 👍 )

4. **Iniciar el servicio de PostgreSQL**:

   ```bash
   brew services start postgresql@15
   ```

5. **Crear la base de datos y el usuario**:

   ```bash
   # Conéctate a PostgreSQL como superusuario
   psql postgres

   # Crear el usuario
   CREATE USER nuevo_usuario WITH PASSWORD 'nueva_contraseña';

   # Crear la base de datos
   CREATE DATABASE social_donations;

   # Otorgar todos los privilegios al usuario en la base de datos
   GRANT ALL PRIVILEGES ON DATABASE social_donations TO nuevo_usuario;

   # Salir de psql
   \q
   ```

6. **Configurar el archivo .env**:

   Edita el archivo `.env` y configura las siguientes variables:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=nuevo_usuario
   DB_PASSWORD=nueva_contraseña
   DB_DATABASE=social_donations
   ```

7. **Iniciar la aplicación en modo desarrollo**:
   ```bash
   npm run start:dev
   ```

### Instalación en Windows

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/isis3710-uniandes/ISIS3710_202510_S1_E2_Back
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Instalar PostgreSQL**:

   - Descarga el instalador desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - Ejecuta el instalador y sigue las instrucciones
   - Durante la instalación, anota la contraseña que configures para el usuario `postgres`

4. **Crear la base de datos y el usuario**:

   - Abre el programa pgAdmin que se instaló con PostgreSQL
   - Conéctate al servidor con el usuario `postgres` y la contraseña que configuraste
   - Crea un nuevo rol de inicio de sesión (Login Role) con nombre `nuevo_usuario` y contraseña `nueva_contraseña`
   - Crea una nueva base de datos llamada `social_donations` con propietario `nuevo_usuario`

5. **Configurar el archivo .env**:

   Edita el archivo `.env` y configura las siguientes variables:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=nuevo_usuario
   DB_PASSWORD=nueva_contraseña
   DB_DATABASE=social_donations
   ```

6. **Iniciar la aplicación en modo desarrollo**:
   ```bash
   npm run start:dev
   ```

## Entidades de la base de datos

- **User**: Usuarios del sistema (normales y fundaciones)
- **Foundation**: Información detallada de fundaciones
- **Donation**: Donaciones de usuarios a fundaciones
- **SocialAction**: Acciones sociales organizadas por fundaciones
- **Comment**: Comentarios sobre donaciones y acciones sociales
- **Rating**: Calificaciones para donaciones y acciones sociales
- **ParticipationRequest**: Solicitudes para participar en acciones sociales
- **Certificate**: Certificados emitidos a usuarios
- **Notification**: Notificaciones del sistema
- **Suggestion**: Sugerencias enviadas por usuarios

## Documentación de API

La API está disponible en `http://localhost:3001/api` (Personalmente me sirve más en el 3001 porque uso el 3000 para otro proyecto).
