/**
 * StudentsTable.jsx
 * ---------------------------------------------------------
 * Tabla de listado de estudiantes.
 *
 * Props:
 *  - data        → array de estudiantes
 *  - onEdit(row) → callback al pulsar "Editar"
 *  - onDelete(id)→ callback al pulsar "Eliminar"
 *
 * Cada fila muestra:
 *  - nombre
 *  - email
 *  - ciclo
 *  - estado
 * ---------------------------------------------------------
 */

import "./StudentsTable.css";

export default function StudentsTable({ data, onEdit, onDelete }) {
  if (!data || data.length === 0) {
    return <p>No hay estudiantes registrados todavía.</p>;
  }

  return (
    <table className="estudiantes-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Ciclo</th>
          <th>Estado</th>
          <th style={{ width: "160px" }}>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {data.map((est) => (
          <tr key={est.id}>
            <td>{est.nombre}</td>
            <td>{est.email}</td>
            <td>{est.ciclo}</td>
            <td>{est.estado}</td>
            <td>
              <button type="button" onClick={() => onEdit(est)}>
                Editar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => onDelete(est.id)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
