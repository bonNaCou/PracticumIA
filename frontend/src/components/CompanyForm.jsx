import { useState, useEffect } from "react";
import { empresasDAW } from "../data/empresas";
import "./CompanyForm.css";

export default function CompanyForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState({
    nombre: "",
    cif: "",
    sector: "",
    telefono: "",
    email: "",
    direccion: "",
    web: "",
  });

  const [mostrarInputNueva, setMostrarInputNueva] = useState(false);
  const [nuevaEmpresa, setNuevaEmpresa] = useState("");

  // Cargar datos para edición
  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  // =======================================
  // AUTORRELLENAR DATOS COMPLETOS
  // =======================================
  const handleSelectEmpresa = (nombreEmpresa) => {
    const empresa = empresasDAW.find((e) => e.nombre === nombreEmpresa);

    if (empresa) {
      setForm({
        nombre: empresa.nombre,
        sector: empresa.sector,
        cif: empresa.cif || "",
        telefono: empresa.telefono || "",
        email: empresa.email || "",
        direccion: empresa.direccion || "",
        web: empresa.web || "",
      });
    } else {
      setForm({ ...form, nombre: nombreEmpresa });
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="company-form">
      <h3>{initialData ? "Editar Empresa" : "Nueva Empresa"}</h3>

      <form onSubmit={handleSubmit}>

        {/* ================================
            SELECTOR PREMIUM CON LOGO
        ================================ */}
        <div className="empresa-box">
          <label>Seleccionar empresa (catálogo oficial)</label>

          <div className="empresa-select-wrapper">
            <select
              className="empresa-select"
              value={form.nombre}
              onChange={(e) => handleSelectEmpresa(e.target.value)}
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

            {form.nombre && (
              <img
                className="empresa-logo-preview"
                src={
                  empresasDAW.find((e) => e.nombre === form.nombre)?.logo ||
                  "/logos/default.png"
                }
                alt="logo"
              />
            )}
          </div>

          {/* NUEVA EMPRESA */}
          <button
            type="button"
            className="add-empresa-btn"
            onClick={() => setMostrarInputNueva(!mostrarInputNueva)}
          >
            ➕ Añadir nueva empresa
          </button>

          {mostrarInputNueva && (
            <input
              className="empresa-input-new"
              placeholder="Nueva empresa..."
              value={nuevaEmpresa}
              onChange={(e) => setNuevaEmpresa(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setForm({ ...form, nombre: nuevaEmpresa });
                  setMostrarInputNueva(false);
                }
              }}
            />
          )}
        </div>

        {/* ================================
            CAMPOS AUTORRELLENADOS
        ================================ */}

        <input
          name="cif"
          placeholder="CIF"
          value={form.cif}
          onChange={handleChange}
          required
        />

        <input
          name="sector"
          placeholder="Sector"
          value={form.sector}
          onChange={handleChange}
        />

        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email corporativo"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="direccion"
          placeholder="Dirección"
          value={form.direccion}
          onChange={handleChange}
        />

        <input
          name="web"
          placeholder="Sitio web"
          value={form.web}
          onChange={handleChange}
        />

        <div className="actions">
          <button type="submit" className="btn-save">Guardar</button>
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
