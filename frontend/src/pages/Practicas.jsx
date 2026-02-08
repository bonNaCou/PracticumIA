/**
 * PRÁCTICAS — Módulo PRO
 * --------------------------------------------------------
 * - Lista de prácticas
 * - Formulario profesional
 * - Select dinámico Estudiantes + Empresas
 * - CRUD completo usando practicasService.js
 * - Interfaz estilo empresarial
 * --------------------------------------------------------
 */

import { useEffect, useState } from "react";
import "./Practicas.css";

import {
  getPracticas,
  createPractica,
  updatePractica,
  deletePractica,
} from "../services/practicasService";

import { getEstudiantes } from "../services/estudiantesService";
import { getEmpresas } from "../services/empresasService";

export default function Practicas() {
  const [practicas, setPracticas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  const [form, setForm] = useState({
    id: null,
    estudiante_id: "",
    empresa_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "activa",
  });

  const [loading, setLoading] = useState(false);

  // ============================
  // CARGAR DATOS INICIALES
  // ============================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, e, em] = await Promise.all([
        getPracticas(),
        getEstudiantes(),
        getEmpresas(),
      ]);
      setPracticas(p);
      setEstudiantes(e);
      setEmpresas(em);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
    setLoading(false);
  };

  // ============================
  // CAMBIAR CAMPOS DEL FORM
  // ============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ============================
  // ENVIAR FORM (CREAR / EDITAR)
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.estudiante_id || !form.empresa_id) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      if (form.id === null) {
        await createPractica(form);
      } else {
        await updatePractica(form.id, form);
      }

      resetForm();
      loadData();

    } catch (err) {
      console.error("Error guardando práctica:", err);
    }
  };

  // ============================
  // EDITAR PRACTICA
  // ============================
  const handleEdit = (p) => {
    setForm({
      id: p.id,
      estudiante_id: p.estudiante_id,
      empresa_id: p.empresa_id,
      fecha_inicio: p.fecha_inicio?.slice(0, 10),
      fecha_fin: p.fecha_fin?.slice(0, 10),
      estado: p.estado,
    });
  };

  // ============================
  // BORRAR PRACTICA
  // ============================
  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta práctica?")) {
      await deletePractica(id);
      loadData();
    }
  };

  // ============================
  // LIMPIAR FORM
  // ============================
  const resetForm = () => {
    setForm({
      id: null,
      estudiante_id: "",
      empresa_id: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "activa",
    });
  };

  return (
    <div className="practicas-page">

      <h1>Gestión de Prácticas</h1>
      <p className="subtitle">Administración completa de las prácticas formativas.</p>

      {/* FORMULARIO */}
      <div className="form-card">
        <h2>{form.id ? "Editar práctica" : "Nueva práctica"}</h2>

        <form onSubmit={handleSubmit}>

          <label>Estudiante</label>
          <select
            name="estudiante_id"
            value={form.estudiante_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un estudiante</option>
            {estudiantes.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>

          <label>Empresa</label>
          <select
            name="empresa_id"
            value={form.empresa_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una empresa</option>
            {empresas.map((em) => (
              <option key={em.id} value={em.id}>{em.nombre}</option>
            ))}
          </select>

          <label>Fecha de inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            required
          />

          <label>Fecha de fin</label>
          <input
            type="date"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handleChange}
            required
          />

          <label>Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="activa">Activa</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              {form.id ? "Actualizar" : "Crear práctica"}
            </button>

            {form.id && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLA */}
      <div className="table-card">
        <h2>Listado de prácticas</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Empresa</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {practicas.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.estudiante_nombre}</td>
                  <td>{p.empresa_nombre}</td>
                  <td>{p.fecha_inicio?.slice(0, 10)}</td>
                  <td>{p.fecha_fin?.slice(0, 10)}</td>
                  <td className={`estado ${p.estado}`}>{p.estado}</td>

                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(p)}>
                      Editar
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(p.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
