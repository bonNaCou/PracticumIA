const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// =====================================================
// Obtener todos los estudiantes
// =====================================================
router.get("/", auth, async (req, res) => {
  try {
    let query = `
      SELECT e.id, e.dni, e.ciclo, e.curso,
             u.nombre, u.email, u.rol
      FROM estudiantes e
      INNER JOIN usuarios u ON e.usuario_id = u.id
    `;

    // un estudiante solo ve su ficha
    if (req.user.rol === "estudiante") {
      query += " WHERE u.id = " + req.user.id;
    }

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    res.status(500).json({ error: "Error al obtener estudiantes" });
  }
});

// =====================================================
// Obtener estudiante por ID
// =====================================================
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT e.id, e.dni, e.ciclo, e.curso,
             u.nombre, u.email, u.rol, e.usuario_id
      FROM estudiantes e
      INNER JOIN usuarios u ON e.usuario_id = u.id
      WHERE e.id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    const estudiante = rows[0];

    if (req.user.rol === "estudiante" && estudiante.usuario_id !== req.user.id) {
      return res.status(403).json({ error: "No puedes ver otro estudiante" });
    }

    res.json(estudiante);
  } catch (error) {
    console.error("Error al obtener estudiante:", error);
    res.status(500).json({ error: "Error al obtener estudiante" });
  }
});

// =====================================================
// Crear estudiante (ADMIN)
// =====================================================
router.post("/", auth, role("admin"), async (req, res) => {
  const { usuario_id, dni, ciclo, curso } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ error: "usuario_id es obligatorio" });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO estudiantes (usuario_id, dni, ciclo, curso)
      VALUES (?, ?, ?, ?)
      `,
      [usuario_id, dni, ciclo, curso]
    );

    res.status(201).json({
      message: "Estudiante creado",
      estudiante_id: result.insertId
    });
  } catch (error) {
    console.error("Error al crear estudiante:", error);
    res.status(500).json({ error: "Error al crear estudiante" });
  }
});

// =====================================================
// Actualizar estudiante (ADMIN)
// =====================================================
router.put("/:id", auth, role("admin"), async (req, res) => {
  const { dni, ciclo, curso } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT * FROM estudiantes WHERE id = ?",
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    await db.query(
      `
      UPDATE estudiantes
      SET dni = ?, ciclo = ?, curso = ?
      WHERE id = ?
      `,
      [dni, ciclo, curso, req.params.id]
    );

    res.json({ message: "Estudiante actualizado" });
  } catch (error) {
    console.error("Error al actualizar estudiante:", error);
    res.status(500).json({ error: "Error al actualizar estudiante" });
  }
});

// =====================================================
// Eliminar estudiante (ADMIN)
// =====================================================
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM estudiantes WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    res.json({ message: "Estudiante eliminado" });
  } catch (error) {
    console.error("Error al eliminar estudiante:", error);
    res.status(500).json({ error: "Error al eliminar estudiante" });
  }
});

// =====================================================
// CREAR ESTUDIANTE + USUARIO (ENDPOINT PRO)
// =====================================================
router.post("/crear-completo", auth, role("admin"), async (req, res) => {
  const { nombre, email, password, dni, ciclo, curso } = req.body;

  if (!nombre || !email || !dni || !ciclo) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // 1. Comprobar si ya existe usuario con ese email
    const [exists] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (exists.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // 2. Crear usuario
    const bcrypt = require("bcrypt");
    const passwordHash = await bcrypt.hash(password || "123456", 10);

    const [userResult] = await db.query(
      `
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES (?, ?, ?, 'estudiante')
      `,
      [nombre, email, passwordHash]
    );

    const usuario_id = userResult.insertId;

    // 3. Crear estudiante vinculado
    const [studResult] = await db.query(
      `
      INSERT INTO estudiantes (usuario_id, dni, ciclo, curso)
      VALUES (?, ?, ?, ?)
      `,
      [usuario_id, dni, ciclo, curso || ""]
    );

    res.status(201).json({
      message: "Estudiante creado correctamente",
      usuario: {
        id: usuario_id,
        nombre,
        email,
        rol: "estudiante",
      },
      estudiante: {
        id: studResult.insertId,
        dni,
        ciclo,
        curso,
      }
    });

  } catch (error) {
    console.error("Error creando estudiante completo:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
