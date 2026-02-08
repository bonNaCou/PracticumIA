const express = require("express");
const router = express.Router();
const ai = require("../controllers/aiController");
const auth = require("../middleware/authMiddleware");

router.post("/chat", auth, ai.chat);
router.post("/tts", auth, ai.tts);
router.post("/informe", auth, ai.generarInforme);

module.exports = router;
