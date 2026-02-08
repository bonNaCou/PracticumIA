/**
 * api.js
 * ---------------------------------------------------------------
 * Este archivo crea una instancia global de Axios configurada
 * para TODAS las llamadas al backend.
 *
 * OBJETIVOS:
 *  - Definir baseURL del backend (localhost:4000 o despliegue futuro)
 *  - Inyectar automáticamente el Access Token en cada petición
 *  - Centralizar configuración y evitar axios suelto en el código
 *
 * Esta instancia se usa en:
 *  - Login.jsx
 *  - Register.jsx
 *  - iaLogsService.js
 *  - Cualquier otro módulo que consuma API
 * ---------------------------------------------------------------
 */

import axios from "axios";

// Instancia personalizada para toda la app
const api = axios.create({
  baseURL: "http://localhost:4000",
});

/**
 * Interceptor de petición
 * ---------------------------------------------------------------
 * Antes de enviar cualquier solicitud al backend,
 * añadimos automáticamente el token guardado en localStorage
 * en la cabecera Authorization siguiendo el estándar:
 *
 *      Authorization: Bearer <token>
 *
 * Esto garantiza que TODAS las rutas protegidas funcionen sin repetir código.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
},
  (error) => Promise.reject(error)
);

export default api;
