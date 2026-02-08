const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuración de storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueName + extension);
  }
});

// Validación de archivos
const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Tipo de archivo no permitido"), false);
  }

  cb(null, true);
};

// Límite de tamaño = 5 MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
