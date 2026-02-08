import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allowed }) {
  const rol = localStorage.getItem("rol");
  return allowed.includes(rol) ? children : <Navigate to="/" replace />;
}
