/**
 * Login.jsx — Plataforma PracticumIA
 * --------------------------------------------------------------
 * Este componente implementa el sistema de autenticación
 * del lado del cliente utilizando Axios + JWT + Refresh Token.
 *
 * El login:
 *  ✔ Envía credenciales al backend (/api/auth/login)
 *  ✔ Recibe Access Token + Refresh Token
 *  ✔ Guarda ambos tokens en localStorage
 *  ✔ Configura interceptores globales para añadir el token a 
 *    todas las peticiones protegidas del backend
 *  ✔ Renueva el token automáticamente cuando expira (HTTP 401)
 *
 * Esto permite acceder correctamente a todas las rutas protegidas
 * como /ia_logs, /usuarios, /practicas, /documentos, etc.
 * --------------------------------------------------------------
 */

import { useState } from "react";
import axios from "axios";
import "./Login.css";

// Importamos el logo desde assets
import logo from "../assets/practicumia_logo.png";

/* ============================================================
   CONFIGURACIÓN GLOBAL DE AXIOS
   - Base URL del backend
   - Interceptor para AUTENTICACIÓN
   - Interceptor para REFRESH TOKEN
=============================================================== */
axios.defaults.baseURL = "http://localhost:4000";

/**
 * Interceptor de petición:
 * Añade automáticamente la cabecera:
 *
 *    Authorization: Bearer <token>
 *
 * a TODAS las solicitudes. Esto permite que rutas protegidas,
 * como /ia_logs, funcionen correctamente sin 401.
 */
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor de respuesta:
 * Si el backend envía un 401 (token expirado),
 * este bloque solicita un nuevo Access Token usando Refresh Token
 * y reintenta la petición original automáticamente.
 */
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return Promise.reject(error);

      try {
        const res = await axios.post("/api/auth/refresh", { refreshToken });

        const newToken = res.data.token;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);

      } catch (err) {
        console.error("Error al renovar token:", err);
      }
    }

    return Promise.reject(error);
  }
);

/* ============================================================
   COMPONENTE PRINCIPAL DE LOGIN
=============================================================== */
export default function Login({ onLogin }) {
  // Formulario controlado
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
console.log("Login.jsx cargado - versión nueva");


  /**
   * handleSubmit()
   * ----------------------------------------------------------
   * Envía los datos al backend y guarda los tokens necesarios
   * para el acceso a rutas protegidas.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Petición al login del backend
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Extraemos datos de login
      const { token, refreshToken, usuario } = response.data;

      // Guardamos credenciales en el navegador
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      localStorage.setItem("rol", usuario.rol);

      // Avisamos al componente padre para cambiar la vista
      if (onLogin) onLogin(usuario);

    } catch (err) {
      console.error("Error al iniciar sesión:", err);

      setError(
        err.response?.data?.error ||
        "Error al iniciar sesión. Inténtalo nuevamente."
      );
    }

    setLoading(false);
  };

  /* ============================================================
     INTERFAZ VISUAL DEL LOGIN
=============================================================== */
  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logotipo oficial de PracticumIA */}
        <img
          src={logo}
          alt="PracticumIA Logo"
          className="login-logo"
        />

        <h2>PracticumIA</h2>
        <p className="subtitle">Acceso a la plataforma</p>

        {/* Mensaje de error */}
        {error && <div className="error-box">{error}</div>}

        {/* Formulario de inicio de sesión */}
        <form onSubmit={handleSubmit}>

          <label>Email</label>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>

        </form>

        {/* Enlace para crear cuenta */}
        <p className="login-switch">
          ¿No tienes cuenta?
          <span onClick={() => (window.location.href = "/register")}>
            Crear cuenta
          </span>
        </p>

      </div>
    </div>
  );
}
