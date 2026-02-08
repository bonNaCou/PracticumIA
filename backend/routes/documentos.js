const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

// =====================================================
// Obtener todos los documentos (admin/tutor/estudiante)
// =====================================================
router.get("/", auth, async (req, res) => {
  try {
    let query = `
      SELECT d.*, p.estudiante_id, p.empresa_id
      FROM documentos d
      INNER JOIN practicas p ON d.practica_id = p.id
    `;

    if (req.user.rol === "estudiante") {
      query += `
        INNER JOIN estudiantes s ON p.estudiante_id = s.id
        WHERE s.usuario_id = ${req.user.id}
      `;
    }

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

// =====================================================
// SUBIR ARCHIVO REAL
// =====================================================
router.post(
  "/upload",
  auth,
  upload.single("archivo"),
  async (req, res) => {
    try {
      const { practica_id } = req.body;

      if (!practica_id) {
        return res.status(400).json({ error: "practica_id es obligatorio" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Archivo no recibido" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      const [result] = await db.query(
        `
        INSERT INTO documentos (practica_id, nombre_archivo, tipo, url)
        VALUES (?, ?, ?, ?)
      `,
        [practica_id, req.file.filename, req.file.mimetype, fileUrl]
      );

      res.status(201).json({
        message: "Documento subido correctamente",
        documento_id: result.insertId,
        url: fileUrl
      });
    } catch (error) {
      console.error("Error al subir documento:", error);
      res.status(500).json({ error: "Error al subir documento" });
    }
  }
);

// =====================================================
// Descargar archivo
// =====================================================
router.get("/download/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT url FROM documentos WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = path.join(__dirname, "..", rows[0].url);

    res.download(filePath);
  } catch (error) {
    console.error("Error al descargar documento:", error);
    res.status(500).json({ error: "Error al descargar documento" });
  }
});

// =====================================================
// Eliminar documento (admin)
// =====================================================
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT url FROM documentos WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = path.join(__dirname, "..", rows[0].url);

    // Borrar archivo físico
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Borrar registro BD
    await db.query("DELETE FROM documentos WHERE id = ?", [
      req.params.id
    ]);

    res.json({ message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});

module.exports = router;