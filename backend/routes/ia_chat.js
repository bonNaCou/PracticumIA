const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const auth = require("../middleware/authMiddleware");
const { chatIA } = require("../services/aiService");

router.post("/", auth, async (req, res) => {
  const { message, voice = "synthia" } = req.body;
  const userId = req.user.id;

  try {
    const respuesta = await chatIA(message, voice, false);

    res.json({ reply: respuesta });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error en la IA" });
  }
});

module.exports = router;
