const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload.js");
const fs = require("fs");
const path = require("path");

/*
=================================================
OBTENER DOCUMENTOS
=================================================
*/
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, nombre_archivo, tipo, url, fecha_subida
      FROM documentos
      ORDER BY fecha_subida DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo documentos:", error);
    res.status(500).json({ error: "Error obteniendo documentos" });
  }
});

/*
=================================================
SUBIR DOCUMENTO
=================================================
*/
router.post("/upload", auth, (req, res) => {
  upload.single("archivo")(req, res, function (err) {
    if (err) {
      console.error("Error de Multer:", err.message);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    db.query(
      "INSERT INTO documentos (nombre_archivo, tipo, url) VALUES (?, ?, ?)",
      [req.file.filename, req.file.mimetype, fileUrl]
    )
      .then(([result]) => {
        res.status(201).json({
          id: result.insertId,
          nombre_archivo: req.file.filename,
          tipo: req.file.mimetype,
          url: fileUrl
        });
      })
      .catch((dbError) => {
        console.error("Error en DB:", dbError);
        res.status(500).json({ error: "Error guardando en base de datos" });
      });
  });
});


/*
=================================================
ELIMINAR DOCUMENTO
=================================================
*/
router.delete("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT url FROM documentos WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    const filePath = path.join(__dirname, "..", rows[0].url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query(
      "DELETE FROM documentos WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando documento:", error);
    res.status(500).json({ error: "Error eliminando documento" });
  }
});

module.exports = router;
