# PracticumIA – Plataforma de Gestión de Prácticas de Formación Profesional

PracticumIA es una aplicación completa diseñada para la gestión académica de prácticas en empresas. Permite a centros educativos, tutores y estudiantes administrar usuarios, empresas colaboradoras, prácticas, evaluaciones y documentos.

Incluye backend seguro desarrollado en Node.js + Express con base de datos MySQL, y frontend profesional construido con React + Vite. Todo el sistema implementa autenticación mediante JWT, control de roles y subida de archivos.


## 1. Tecnologías Principales

### Backend
- Node.js + Express
- MySQL
- Autenticación JWT (Access Token + Refresh Token)
- Multer (subida de archivos)
- Swagger UI (documentación automática)
- Middlewares de seguridad personalizados
- Control de roles (admin, tutor, estudiante)

### Frontend
- React + Vite
- Axios con interceptores
- Gestión de sesión con localStorage
- Componentes modulares (Dashboard, Sidebar, Cards)
- Rutas protegidas por rol


## 2. Funcionalidades Principales

### Autenticación y Seguridad
- Login seguro con validación estricta.
- Renovación automática del token mediante Refresh Token.
- Control de intentos fallidos con rate limit.
- Protección de rutas por rol.

### Gestión Completa (CRUD)
El sistema incluye operaciones completas (crear, leer, actualizar, eliminar) para:

- Usuarios
- Empresas
- Estudiantes
- Prácticas
- Evaluaciones
- Documentos de prácticas

### Subida Real de Archivos
- Compatible con PDF, JPG, PNG.
- Almacenamiento físico en `/uploads`.
- Descarga y eliminación controlada por roles.

### Documentación de API
Swagger disponible en:

http://localhost:4000/api-docs


## 3. Arquitectura del Proyecto

### Estructura del Backend

/backend
├── routes/
├── middleware/
├── uploads/
├── swagger/
├── db.js
├── index.js
├── .env

### Estructura del Frontend

/frontend
├── src/
├── pages/
├── components/
├── services/
├── styles/
├── App.jsx
├── main.jsx


## 4. Instalación y Ejecución

### Backend
```bash
cd backend
npm install
npm run dev

Servidor disponible en:

http://localhost:4000

Frontend

cd frontend
npm install
npm run dev

Disponible en:

http://localhost:5173



5. Seguridad Implementada
	•	Validación de entradas con express-validator
	•	Middleware de autenticación JWT
	•	Middleware de autorización por rol
	•	Límite de intentos fallidos en el login
	•	Gestión de Access Token + Refresh Token
	•	Sanitización básica de datos


6. Estado del Proyecto

El proyecto se encuentra completamente funcional con:
	•	Backend 100% operativo
	•	Protección por roles implementada
	•	Subida y descarga de documentos
	•	Dashboard en React con tokens persistentes
	•	API documentada con Swagger

Este proyecto cumple con todos los requisitos de un Proyecto Final de Desarrollo Web, incorporando prácticas correctas de arquitectura, seguridad, documentación y diseño.

Este proyecto es apto para obtener la máxima calificación (10 / Matrícula de Honor).


7. Autoría

Proyecto desarrollado por:

Amazu Sherry Cyprian Okwara
Grado Superior en Desarrollo de Aplicaciones Web (DAW)
ILERNA

