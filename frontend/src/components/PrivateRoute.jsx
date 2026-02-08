/**
 * PrivateRoute.jsx
 * -------------------------------------------------
 * Componente de ruta protegida.
 * - Comprueba si existe sesión (token + usuario)
 * - Si no hay sesión → redirige al Login
 * - Si hay sesión → renderiza el contenido protegido
 * -------------------------------------------------
 */

import { Navigate } from "react-router-dom";

export default function PrivateRoute({ usuario, children }) {
  const token = localStorage.getItem("token");

  const isAuthenticated = Boolean(token && usuario);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
