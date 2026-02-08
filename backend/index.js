require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const usuariosRoutes = require("./routes/usuarios");
const empresasRoutes = require("./routes/empresas");
const estudiantesRoutes = require("./routes/estudiantes");
const practicasRoutes = require("./routes/practicas");
const evaluacionesRoutes = require("./routes/evaluaciones");
const authRoutes = require("./routes/auth");
const documentosRoutes = require("./routes/documentos");
const iaLogsRoutes = require("./routes/ia_logs");
const aiRoutes = require("./routes/ai");

// Swagger UI
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

// Rutas
app.use("/usuarios", usuariosRoutes);
app.use("/empresas", empresasRoutes);
app.use("/estudiantes", estudiantesRoutes);
app.use("/practicas", practicasRoutes);
app.use("/evaluaciones", evaluacionesRoutes);
app.use("/api/auth", authRoutes); // Ruta  login
app.use("/documentos", documentosRoutes);
app.use("/ia_logs", iaLogsRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/ai", aiRoutes);

// Ruta principal
app.get("/", (req, res) => {
  res.send("PracticumIA Backend funcionando correctamente");
});

// Swagger Docs 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend iniciado en puerto ${PORT}`);
});
