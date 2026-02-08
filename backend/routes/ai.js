const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload.js");

const aiController = require("../controllers/aiController");

router.post("/chat", auth, aiController.chat);
router.post("/tts", auth, aiController.tts);
router.post("/pdf", auth, upload.single("file"), aiController.pdfAnalyze);
router.post("/informe", auth, aiController.generarInforme);

module.exports = router;
