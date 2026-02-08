const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");

/* =====================================================
   OBTENER LOGS DE IA (solo del usuario o todos si es admin)
   ===================================================== */
router.get("/", auth, async (req, res) => {
  try {
    let query = `
      SELECT 
        c.id,
        c.mensaje AS pregunta,
        c.respuesta,
        c.voz_usada,
        c.fecha,
        u.nombre AS usuario_nombre
      FROM ia_conversaciones c
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY c.fecha DESC
    `;

    // Si NO es admin → solo sus propios logs
    if (req.user.rol !== "admin") {
      query = `
        SELECT 
          c.id,
          c.mensaje AS pregunta,
          c.respuesta,
          c.voz_usada,
          c.fecha,
          u.nombre AS usuario_nombre
        FROM ia_conversaciones c
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.usuario_id = ${req.user.id}
        ORDER BY c.fecha DESC
      `;
    }

    const [rows] = await db.query(query);
    res.json(rows);

  } catch (error) {
    console.error("❌ Error obteniendo logs IA:", error);
    res.status(500).json({ error: "Error obteniendo logs" });
  }
});

/* =====================================================
   REGISTRAR UN LOG DE IA AUTOMÁTICAMENTE
   (chat + voz que se usó)
   ===================================================== */
router.post("/", auth, async (req, res) => {
  const { pregunta, respuesta, voz_usada } = req.body;

  if (!pregunta || !respuesta) {
    return res.status(400).json({ error: "Faltan datos para guardar el log" });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO ia_conversaciones (usuario_id, mensaje, respuesta, voz_usada)
      VALUES (?, ?, ?, ?)
      `,
      [req.user.id, pregunta, respuesta, voz_usada || "synthia"]
    );

    res.status(201).json({
      message: "Log IA registrado correctamente",
      log_id: result.insertId,
    });

  } catch (error) {
    console.error("❌ Error creando el log IA:", error);
    res.status(500).json({ error: "Error creando log IA" });
  }
});

module.exports = router;
