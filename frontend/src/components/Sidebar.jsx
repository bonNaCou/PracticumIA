import { NavLink } from "react-router-dom";
import "./Sidebar.css";

// Íconos profesionales
import {
  FaHome,
  FaUserGraduate,
  FaBuilding,
  FaBook,
  FaFolderOpen,
  FaRobot,
  FaSignOutAlt,
  FaClipboardList     // ✅ IMPORTACIÓN QUE FALTABA
} from "react-icons/fa";

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="sidebar-logo">PracticumIA</div>

      {/* MENÚ */}
      <nav className="menu">
        <NavLink to="/dashboard" className="link">
          <FaHome className="icon" /> Dashboard
        </NavLink>

        <NavLink to="/estudiantes" className="link">
          <FaUserGraduate className="icon" /> Estudiantes
        </NavLink>

        <NavLink to="/empresas" className="link">
          <FaBuilding className="icon" /> Empresas
        </NavLink>

        <NavLink to="/practicas" className="link">
          <FaBook className="icon" /> Prácticas
        </NavLink>

        <NavLink to="/documentos" className="link">
          <FaFolderOpen className="icon" /> Documentos
        </NavLink>

        <NavLink to="/ficha-semanal" className="link">
          <FaClipboardList className="icon" /> Ficha Semanal
        </NavLink>

        <NavLink to="/ia-logs" className="link">
          <FaRobot className="icon" /> Consultas IA
        </NavLink>
      </nav>

      {/* BOTÓN LOGOUT */}
      <button className="logout-btn" onClick={onLogout}>
        <FaSignOutAlt className="icon" /> Cerrar sesión
      </button>

    </aside>
  );
}
