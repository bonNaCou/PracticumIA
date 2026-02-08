/**
 * Rutas para la gestión de prácticas
 * Endpoint base: /practicas
 *
 * Define operaciones:
 *  - GET    /          → Lista todas las prácticas
 *  - GET    /:id       → Obtiene una práctica por ID
 *  - POST   /          → Crea una nueva práctica
 *  - PUT    /:id       → Actualiza una práctica existente
 *  - DELETE /:id       → Elimina una práctica
 *
 * Campos:
 *  - estudiante_id : INT (obligatorio) → Id del estudiante asignado
 *  - empresa_id    : INT (obligatorio) → Id de la empresa asignada
 *  - fecha_inicio  : DATE (obligatorio) → Fecha de inicio de la práctica
 *  - fecha_fin     : DATE (obligatorio) → Fecha de fin de la práctica
 *  - horas_totales : INT (opcional)   → Total de horas realizadas
 *  - estado        : ENUM('pendiente','en_curso','finalizada') → Estado actual
 */

const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// ==================================================
// Obtener todas las prácticas
// ==================================================
router.get("/", auth, async (req, res) => {
  try {
    let query = `
      SELECT p.*, 
             u.nombre AS estudiante_nombre,
             e.nombre AS empresa_nombre
      FROM practicas p
      INNER JOIN estudiantes s ON p.estudiante_id = s.id
      INNER JOIN usuarios u    ON s.usuario_id = u.id
      INNER JOIN empresas e    ON p.empresa_id = e.id
    `;

    let params = [];

    // FILTRO POR ROL
    if (req.user.rol === "estudiante") {
      query += " WHERE s.usuario_id = ?";
      params.push(req.user.id);
    }

    if (req.user.rol === "tutor_centro") {
      query += " WHERE p.empresa_id IN (SELECT id FROM empresas)";
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener prácticas:", error);
    res.status(500).json({ error: "Error al obtener prácticas" });
  }
});

// ==================================================
// Obtener práctica por ID
// ==================================================
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT p.*,
             u.nombre AS estudiante_nombre,
             e.nombre AS empresa_nombre,
             s.usuario_id AS user_id_estudiante
      FROM practicas p
      INNER JOIN estudiantes s ON p.estudiante_id = s.id
      INNER JOIN usuarios u    ON s.usuario_id = u.id
      INNER JOIN empresas e    ON p.empresa_id = e.id
      WHERE p.id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Práctica no encontrada" });
    }

    const practica = rows[0];

    if (req.user.rol === "estudiante" && practica.user_id_estudiante !== req.user.id) {
      return res.status(403).json({ error: "No tienes permiso para ver esta práctica" });
    }

    res.json(practica);
  } catch (error) {
    console.error("Error al obtener práctica:", error);
    res.status(500).json({ error: "Error al obtener práctica" });
  }
});

// ==================================================
// Crear práctica (SOLO ADMIN)
// ==================================================
router.post("/", auth, role("admin"), async (req, res) => {
  const { estudiante_id, empresa_id, fecha_inicio, fecha_fin, estado } = req.body;

  if (!estudiante_id || !empresa_id) {
    return res.status(400).json({ error: "estudiante_id y empresa_id son obligatorios" });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO practicas (estudiante_id, empresa_id, fecha_inicio, fecha_fin, estado)
      VALUES (?, ?, ?, ?, ?)
      `,
      [estudiante_id, empresa_id, fecha_inicio, fecha_fin, estado || "pendiente"]
    );

    res.status(201).json({
      message: "Práctica creada",
      practica_id: result.insertId
    });
  } catch (error) {
    console.error("Error al crear práctica:", error);
    res.status(500).json({ error: "Error al crear práctica" });
  }
});

// ==================================================
// Actualizar práctica (ADMIN + TUTOR CENTRO)
// ==================================================
router.put("/:id", auth, async (req, res) => {
  const { fecha_inicio, fecha_fin, estado } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM practicas WHERE id = ?", [
      req.params.id
    ]);

    if (existing.length === 0) {
      return res.status(404).json({ error: "Práctica no encontrada" });
    }

    if (req.user.rol === "estudiante") {
      return res.status(403).json({ error: "No puedes modificar prácticas" });
    }

    await db.query(
      `
      UPDATE practicas
      SET fecha_inicio = ?, fecha_fin = ?, estado = ?
      WHERE id = ?
      `,
      [
        fecha_inicio || existing[0].fecha_inicio,
        fecha_fin || existing[0].fecha_fin,
        estado || existing[0].estado,
        req.params.id
      ]
    );

    res.json({ message: "Práctica actualizada" });
  } catch (error) {
    console.error("Error al actualizar práctica:", error);
    res.status(500).json({ error: "Error al actualizar práctica" });
  }
});

// ==================================================
// Eliminar práctica (SOLO ADMIN)
// ==================================================
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM practicas WHERE id = ?", [
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Práctica no encontrada" });
    }

    res.json({ message: "Práctica eliminada" });
  } catch (error) {
    console.error("Error al eliminar práctica:", error);
    res.status(500).json({ error: "Error al eliminar práctica" });
  }
});

module.exports = router;
