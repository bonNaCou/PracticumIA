/**
 * Estudiantes.jsx
 * ---------------------------------------------------------
 * Página principal de gestión de estudiantes.
 *
 * Funcionalidades:
 *  - Carga la lista desde el backend (GET /estudiantes)
 *  - Permite crear nuevos estudiantes
 *  - Permite editar estudiantes existentes
 *  - Permite eliminar estudiantes
 *  - Incluye buscador por nombre, email, ciclo y estado
 *  - Muestra mensajes de error básicos
 *
 * Integra:
 *  - StudentForm.jsx
 *  - StudentsTable.jsx
 *  - studentsService.js
 * ---------------------------------------------------------
 */

import { useEffect, useState } from "react";
import "./Estudiantes.css";

import StudentForm from "../components/StudentForm";
import StudentsTable from "../components/StudentsTable";

import {
  getEstudiantes,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
} from "../services/estudiantesService";

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Cargar lista de estudiantes al montar el componente
  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const cargarEstudiantes = async () => {
    try {
      setCargando(true);
      setError(null);

      const data = await getEstudiantes();
      setEstudiantes(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los estudiantes.");
    } finally {
      setCargando(false);
    }
  };

  // Crear o editar (según editandoId)
  const handleSubmit = async (formData) => {
    try {
      setError(null);

      if (editandoId) {
        await updateEstudiante(editandoId, formData);
      } else {
        await createEstudianteCompleto(formData);
      }

      await cargarEstudiantes();
      setEditandoId(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el estudiante.");
    }
  };

  const handleEditar = (est) => {
    setEditandoId(est.id);
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este estudiante?")) {
      return;
    }

    try {
      await deleteEstudiante(id);
      setEstudiantes((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el estudiante.");
    }
  };

  // Filtro de búsqueda por texto
  const estudiantesFiltrados = estudiantes.filter((e) => {
    const texto = busqueda.toLowerCase();
    return (
      e.nombre?.toLowerCase().includes(texto) ||
      e.email?.toLowerCase().includes(texto) ||
      e.ciclo?.toLowerCase().includes(texto) ||
      e.estado?.toLowerCase().includes(texto)
    );
  });

  const estudianteEditando = editandoId
    ? estudiantes.find((e) => e.id === editandoId)
    : null;

  return (
    <div className="estudiantes-page">
      <h2>Gestión de Estudiantes</h2>

      {error && <p className="error-msg">{error}</p>}

      {/* Formulario de creación / edición */}
      <section className="estudiantes-form-section">

        <StudentForm
          onSubmit={handleSubmit}
          onCancel={handleCancelarEdicion}
          initialData={estudianteEditando}
        />
      </section>

      {/* Listado con buscador */}
      <section className="estudiantes-list-section">
        <div className="estudiantes-list-header">
          <h3>Listado de estudiantes</h3>

          <input
            type="text"
            placeholder="Buscar por nombre, email, ciclo o estado..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {cargando ? (
          <p>Cargando estudiantes...</p>
        ) : (
          <StudentsTable
            data={estudiantesFiltrados}
            onEdit={handleEditar}
            onDelete={handleEliminar}
          />
        )}
      </section>
    </div>
  );
}
