const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// =====================================================
// Obtener todas las evaluaciones
// =====================================================
router.get("/", auth, async (req, res) => {
  try {
    let query = `
      SELECT ev.id, ev.progreso, ev.comentario, ev.fecha,
             p.id AS practica_id, u.nombre AS tutor_centro
      FROM evaluaciones ev
      INNER JOIN practicas p ON ev.practica_id = p.id
      INNER JOIN usuarios u ON ev.tutor_centro_id = u.id
    `;

    // Un estudiante solo ve evaluaciones de sus prácticas
    if (req.user.rol === "estudiante") {
      query += ` INNER JOIN estudiantes s ON p.estudiante_id = s.id
                 WHERE s.usuario_id = ${req.user.id}`;
    }

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    res.status(500).json({ error: "Error al obtener evaluaciones" });
  }
});

// =====================================================
// Obtener evaluación por ID
// =====================================================
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT ev.*, p.estudiante_id, u.nombre AS tutor_centro
      FROM evaluaciones ev
      INNER JOIN practicas p ON ev.practica_id = p.id
      INNER JOIN usuarios u ON ev.tutor_centro_id = u.id
      WHERE ev.id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }

    const evaluacion = rows[0];

    // Estudiante solo puede ver la suya
    if (req.user.rol === "estudiante") {
      const [est] = await db.query(
        "SELECT usuario_id FROM estudiantes WHERE id = ?",
        [evaluacion.estudiante_id]
      );

      if (est.length === 0 || est[0].usuario_id !== req.user.id) {
        return res.status(403).json({ error: "No puedes ver esta evaluación" });
      }
    }

    res.json(evaluacion);
  } catch (error) {
    console.error("Error al obtener evaluación:", error);
    res.status(500).json({ error: "Error al obtener evaluación" });
  }
});

// =====================================================
// Crear evaluación (solo tutor_centro o admin)
// =====================================================
router.post("/", auth, role("tutor_centro"), async (req, res) => {
  console.log("Body recibido (POST /evaluaciones):", req.body);

  const { practica_id, tutor_centro_id, progreso, comentario } = req.body;

  if (!practica_id || !tutor_centro_id) {
    return res.status(400).json({ error: "practica_id y tutor_centro_id son obligatorios" });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO evaluaciones (practica_id, tutor_centro_id, progreso, comentario)
      VALUES (?, ?, ?, ?)
      `,
      [practica_id, tutor_centro_id, progreso, comentario]
    );

    res.status(201).json({
      message: "Evaluación creada",
      evaluacion_id: result.insertId
    });
  } catch (error) {
    console.error("Error al crear evaluación:", error);
    res.status(500).json({ error: "Error al crear evaluación" });
  }
});

// =====================================================
// Actualizar evaluación (solo tutor centro o admin)
// =====================================================
router.put("/:id", auth, role("tutor_centro"), async (req, res) => {
  const { progreso, comentario } = req.body;

  try {
    const [exists] = await db.query("SELECT * FROM evaluaciones WHERE id = ?", [
      req.params.id
    ]);

    if (exists.length === 0) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }

    await db.query(
      `
      UPDATE evaluaciones
      SET progreso = ?, comentario = ?
      WHERE id = ?
      `,
      [progreso, comentario, req.params.id]
    );

    res.json({ message: "Evaluación actualizada" });
  } catch (error) {
    console.error("Error al actualizar evaluación:", error);
    res.status(500).json({ error: "Error al actualizar evaluación" });
  }
});

// =====================================================
// Eliminar evaluación (admin)
// =====================================================
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM evaluaciones WHERE id = ?", [
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }

    res.json({ message: "Evaluación eliminada" });
  } catch (error) {
    console.error("Error al eliminar evaluación:", error);
    res.status(500).json({ error: "Error al eliminar evaluación" });
  }
});

module.exports = router;
