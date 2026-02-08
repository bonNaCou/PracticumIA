const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// =====================================================
// Obtener todas las empresas
// =====================================================
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM empresas");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    res.status(500).json({ error: "Error al obtener empresas" });
  }
});

// =====================================================
// Obtener empresa por ID
// =====================================================
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM empresas WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    res.status(500).json({ error: "Error al obtener empresa" });
  }
});

// =====================================================
// Crear empresa (solo ADMIN)
// =====================================================
router.post("/", auth, role("admin"), async (req, res) => {
  const { nombre, direccion, telefono, email, tutor_empresa } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO empresas (nombre, direccion, telefono, email, tutor_empresa) VALUES (?, ?, ?, ?, ?)",
      [nombre, direccion, telefono, email, tutor_empresa]
    );

    res.status(201).json({
      message: "Empresa creada",
      empresa_id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear empresa:", error);
    res.status(500).json({ error: "Error al crear empresa" });
  }
});

// =====================================================
// Actualizar empresa (solo ADMIN)
// =====================================================
router.put("/:id", auth, role("admin"), async (req, res) => {
  const { nombre, direccion, telefono, email, tutor_empresa } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM empresas WHERE id = ?", [
      req.params.id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    await db.query(
      "UPDATE empresas SET nombre = ?, direccion = ?, telefono = ?, email = ?, tutor_empresa = ? WHERE id = ?",
      [nombre, direccion, telefono, email, tutor_empresa, req.params.id]
    );

    res.json({ message: "Empresa actualizada" });
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    res.status(500).json({ error: "Error al actualizar empresa" });
  }
});

// =====================================================
// Eliminar empresa (solo ADMIN)
// =====================================================
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM empresas WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.json({ message: "Empresa eliminada" });
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    res.status(500).json({ error: "Error al eliminar empresa" });
  }
});

module.exports = router;
