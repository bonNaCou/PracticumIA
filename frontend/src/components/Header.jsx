import "./Header.css";
import {
  FaMoon,
  FaArrowLeft,
  FaArrowRight,
  FaBars,
  FaEllipsisV,
  FaUniversalAccess
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

/**
 * Header global del área privada.
 * Títulos dinámicos, navegación, modo oscuro y avatar.
 */
export default function Header({ usuario }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Títulos dinámicos
  const titles = {
    "/dashboard": `Bienvenido, ${usuario?.nombre}`,
    "/empresas": "Gestión de Empresas",
  };

  const title = titles[pathname] || "PracticumIA";

  const toggleTheme = () => document.body.classList.toggle("dark-mode");
  const toggleSidebar = () => document.body.classList.toggle("sidebar-open");

  return (
    <header className="header">

      {/* grupo izquierdo */}
      <div className="left-group">
        <button className="menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>

        <div className="nav-buttons">
          <button onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <button onClick={() => navigate(1)}>
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* título */}
      <h1 className="header-title">{title}</h1>

      {/* grupo derecho */}
      <div className="right-group">

        {/* DESKTOP */}
        <div className="desktop-actions">
          <button className="theme-btn" onClick={toggleTheme}>
            <FaMoon />
          </button>

          <div className="avatar">
            {usuario?.nombre?.charAt(0)?.toUpperCase()}
          </div>
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <FaEllipsisV />
        </button>

        {/* MOBILE MINI MENU */}
        {mobileMenuOpen && (
          <div className="mobile-mini-menu">
            <button onClick={toggleTheme}>
              <FaMoon />
              <span>Modo oscuro</span>
            </button>

            <button>
              <FaUniversalAccess />
              <span>Accesibilidad</span>
            </button>

            <div className="mini-avatar">
              {usuario?.nombre}
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
