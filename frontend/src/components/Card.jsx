/**
 * Card.jsx — Tarjeta profesional para indicadores del dashboard
 * --------------------------------------------------------------
 * Soporta:
 *  - title
 *  - value
 *  - icon (componente React: FaUsers, FaBook, etc.)
 *  - onClick (navegación directa desde dashboard)
 * --------------------------------------------------------------
 */

import "./Card.css";

export default function Card({ title, value, icon: Icon, onClick }) {
  return (
    <div
      className="dashboard-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {/* Icono grande */}
      {Icon && <Icon className="card-icon" />}

      <div className="card-content">
        <h3>{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
}
