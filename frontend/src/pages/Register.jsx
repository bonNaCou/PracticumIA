/**
 * Register.jsx
 * ---------------------------------------------------------------
 * Vista de registro de nuevos usuarios en PracticumIA.
 *
 * CARACTERÍSTICAS:
 *  - Formulario controlado en React
 *  - Envío de datos a /auth/register mediante api.js
 *  - Guardado automático del rol asignado
 *  - Mensajes de error y éxito
 * ---------------------------------------------------------------
 */

import { useState } from "react";
import api from "../services/api";
import "./Login.css";

export default function Register() {
  // Datos del usuario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [password, setPassword] = useState("");

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * handleRegister()
   * -----------------------------------------------------------
   * Envía los datos del formulario al backend.
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        nombre,
        email,
        password,
        rol,
      });

      setSuccess("Cuenta creada correctamente. Inicia sesión para continuar.");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "No se pudo crear la cuenta. Intenta nuevamente."
      );
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logo institucional */}
        <img
          src="/src/assets/practicumia_logo.png"
          alt="PracticumIA"
          className="login-logo"
        />

        <h2>Crear Cuenta</h2>
        <p className="subtitle">Regístrate para acceder</p>

        {/* Mensajes */}
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        {/* Formulario */}
        <form onSubmit={handleRegister}>
          <label>Nombre completo</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Rol de usuario</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="estudiante">Estudiante</option>
            <option value="tutor_centro">Tutor del Centro</option>
            <option value="admin">Administrador</option>
          </select>

          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        {/* Enlace volver al login */}
        <p className="login-switch">
          ¿Ya tienes cuenta?
          <span onClick={() => (window.location.href = "/login")}>
            Iniciar sesión
          </span>
        </p>
      </div>
    </div>
  );
}
