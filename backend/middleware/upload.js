/**
 * Middleware de subida de archivos para PracticumIA
 * - Guarda archivos en /backend/uploads
 * - Valida tipos de archivo permitidos
 * - Genera nombres únicos
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ruta absoluta al directorio uploads
const uploadDir = path.join(__dirname, "..", "uploads");

// Crear carpeta uploads si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Validación de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Tipo de archivo no permitido"), false);
  }

  cb(null, true);
};

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueName + extension);
  }
});

// Middleware final de subida
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

module.exports = upload;
