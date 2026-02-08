const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Configuración básica de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PracticumIA API",
      version: "1.0.0",
      description: "Documentación de la API del sistema PracticumIA",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
  },

  // Archivos donde Swagger buscará anotaciones
  apis: ["./routes/*.js"],
};

// Generar documentación
const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
