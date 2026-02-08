const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// Middlewares
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

/* =========================================================
   LISTAR TODOS LOS USUARIOS
   → SOLO ADMIN
========================================================= */
router.get("/", auth, role("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nombre, email, rol, created_at FROM usuarios"
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

/* =========================================================
   OBTENER USUARIO POR ID
   → ADMIN: cualquiera
   → RESTO: solo su propio perfil
========================================================= */
router.get("/:id", auth, async (req, res) => {
  const idSolicitado = Number(req.params.id);

  // Estudiante no puede ver otros perfiles
  if (req.user.rol === "estudiante" && req.user.id !== idSolicitado) {
    return res.status(403).json({ error: "Acceso no autorizado" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?",
      [idSolicitado]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

/* =========================================================
   CREAR USUARIO
   → SOLO ADMIN
========================================================= */
router.post("/", auth, role("admin"), async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, passwordHash, rol]
    );

    res.status(201).json({
      message: "Usuario creado correctamente",
      usuario_id: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    res.status(500).json({ error: "Error al crear usuario" });
  }
});

/* =========================================================
   ACTUALIZAR USUARIO
   → SOLO ADMIN
========================================================= */
router.put("/:id", auth, role("admin"), async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let passwordHash = existing[0].password_hash;

    // Si se envía nueva contraseña → se re-hashea
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    await db.query(
      "UPDATE usuarios SET nombre = ?, email = ?, password_hash = ?, rol = ? WHERE id = ?",
      [nombre, email, passwordHash, rol, req.params.id]
    );

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

/* =========================================================
   ELIMINAR USUARIO
   → SOLO ADMIN
========================================================= */
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM usuarios WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

module.exports = router;
