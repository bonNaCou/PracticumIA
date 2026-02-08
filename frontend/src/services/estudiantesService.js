/**
 * studentsService.js
 * ---------------------------------------------------------
 * Servicio centralizado para gestionar estudiantes.
 * Usa la instancia API que ya incluye el token automáticamente.
 * ---------------------------------------------------------
 */

import api from "./api"; // ESTA es tu instancia correcta — NO vuelvas a crear otra

// Listar estudiantes
export async function getEstudiantes() {
  const res = await api.get("/estudiantes");
  return res.data;
}

// Crear estudiante
export async function createEstudiante(data) {
  const res = await api.post("/estudiantes", data);
  return res.data;
}

// Actualizar estudiante
export async function updateEstudiante(id, data) {
  const res = await api.put(`/estudiantes/${id}`, data);
  return res.data;
}

// Eliminar estudiante
export async function deleteEstudiante(id) {
  const res = await api.delete(`/estudiantes/${id}`);
  return res.data;
}
