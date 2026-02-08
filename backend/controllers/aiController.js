// ======================================================
// IMPORTS
// ======================================================
const { chatIA, generarAudio, analizarPDF, generarInforme } = require("../services/aiService");
const db = require("../db");


// ======================================================
// CHAT IA — PERSONALIDAD + EMPRESA + PRIMER MENSAJE
// ======================================================
exports.chat = async (req, res) => {
  try {
    const { prompt, voice, empresa } = req.body;
    const userId = req.user.id;

    // 1️⃣ Detectar si es el primer mensaje del usuario
    const [rows] = await db.query(
      "SELECT id FROM ia_conversaciones WHERE usuario_id = ? LIMIT 1",
      [userId]
    );
    const isFirstMessage = rows.length === 0;

    // 2️⃣ Adaptar el prompt si el usuario seleccionó empresa
    let promptFinal = prompt;

    if (empresa) {
      promptFinal = `
      El usuario está interesado en realizar prácticas en la empresa **${empresa}**.
      Ajusta tus respuestas al contexto real de esta empresa y a perfiles DAW.

      Pregunta original:
      ${prompt}
      `;
    }

    // 3️⃣ Generar respuesta IA
    const respuesta = await chatIA(promptFinal, voice, isFirstMessage);

    // 4️⃣ Guardar en BD
    await db.query(
      `INSERT INTO ia_conversaciones (usuario_id, mensaje, respuesta, voz_usada, empresa)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, prompt, respuesta, voice, empresa || null]
    );

    res.json({ respuesta });

  } catch (error) {
    console.error("Error en chat IA:", error);
    res.status(500).json({ error: "Error procesando consulta IA" });
  }
};


// ======================================================
// 🔊 TEXTO → VOZ (TTS)
// ======================================================
exports.tts = async (req, res) => {
  try {
    const { text, voice = "synthia" } = req.body;

    const audioBuffer = await generarAudio(text, voice);

    res.set("Content-Type", "audio/mp3");
    res.send(audioBuffer);

  } catch (error) {
    console.error("Error TTS:", error);
    res.status(500).json({ error: "Error generando audio" });
  }
};


// ======================================================
// ANALIZAR PDF (GEMINI)
// ======================================================
exports.pdfAnalyze = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({ error: "No se envió archivo" });
    }

    const resumen = await analizarPDF(file);

    await db.query(
      `INSERT INTO ia_conversaciones (usuario_id, mensaje, respuesta)
       VALUES (?, ?, ?)`,
      [userId, "Análisis PDF", resumen]
    );

    res.json({ resumen });

  } catch (error) {
    console.error("Error analizando PDF:", error);
    res.status(500).json({ error: "Error procesando PDF" });
  }
};


// ======================================================
// 📝 GENERAR INFORME ACADÉMICO
// ======================================================
exports.generarInforme = async (req, res) => {
  try {
    const { alumno, ciclo, practicas, rendimiento } = req.body;

    const prompt = `
      Genera un informe educativo profesional para:

      Alumno: ${alumno}
      Ciclo: ${ciclo}
      Prácticas: ${practicas}
      Rendimiento: ${rendimiento}

      Incluye:
      - Resumen general
      - Competencias destacadas
      - Recomendaciones
      - Empresas ideales donde podría trabajar
      - Evaluación global
    `;

    const informeIA = await generarInforme(prompt);

    res.json({ informe: informeIA });

  } catch (error) {
    console.error("Error generando informe académico:", error);
    res.status(500).json({ error: "Error generando informe" });
  }
};
