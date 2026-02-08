// ===============================================
// SELECTOR PREMIUM CON LOGOS
// ===============================================

import { useState } from "react";
import { empresasDAW } from "../data/empresas";

export function SelectorEmpresas({ empresaSeleccionada, setEmpresaSeleccionada }) {
  const [mostrarInputNueva, setMostrarInputNueva] = useState(false);
  const [nuevaEmpresa, setNuevaEmpresa] = useState("");

  return (
    <div className="empresa-box">

      <label className="empresa-label">Empresa para prácticas</label>

      <div className="empresa-select-wrapper">

        <select
          className="empresa-select"
          value={empresaSeleccionada}
          onChange={(e) => setEmpresaSeleccionada(e.target.value)}
        >
          <option value="">Seleccionar empresa</option>

          {["Informática", "Banca", "Administración", "Startup", "Otros"].map(
            (sector) => (
              <optgroup key={sector} label={sector}>
                {empresasDAW
                  .filter((e) => e.sector === sector)
                  .map((empresa) => (
                    <option key={empresa.nombre} value={empresa.nombre}>
                      {empresa.nombre}
                    </option>
                  ))}
              </optgroup>
            )
          )}
        </select>

        {/* LOGO AL LADO DEL SELECT */}
        {empresaSeleccionada && (
          <img
            className="empresa-logo-preview"
            src={
              empresasDAW.find((e) => e.nombre === empresaSeleccionada)?.logo ||
              "/logos/default.png"
            }
            alt="logo empresa"
          />
        )}
      </div>

      {/* BOTÓN AÑADIR NUEVA */}
      <button
        className="add-empresa-btn"
        onClick={() => setMostrarInputNueva(!mostrarInputNueva)}
      >
        ➕ Añadir nueva
      </button>

      {/* INPUT NUEVA */}
      {mostrarInputNueva && (
        <input
          className="empresa-input-new"
          placeholder="Nueva empresa..."
          value={nuevaEmpresa}
          onChange={(e) => setNuevaEmpresa(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEmpresaSeleccionada(nuevaEmpresa);
              setMostrarInputNueva(false);
            }
          }}
        />
      )}
    </div>
  );
}
