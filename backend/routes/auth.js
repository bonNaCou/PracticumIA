/**
 * ============================================================
 * AUTH.JS — Autenticación PRO (Login + Refresh + Register)
 * ============================================================
 * Incluye:
 *  - Validación stricta (express-validator)
 *  - Tokens JWT (Access + Refresh)
 *  - Rate Limit Anti-Bruteforce
 *  - Swagger Documentado
 * ============================================================
 */

const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("../middleware/loginRateLimit");

/* ============================================================
   VALIDACIÓN — LOGIN
============================================================ */
const loginValidation = [
  body("email").isEmail().withMessage("Email no válido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener mínimo 6 caracteres"),
];

/* ============================================================
   SWAGGER — /auth/login
============================================================ */
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     description: Devuelve un Access Token + Refresh Token si las credenciales son correctas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login correcto.
 *       401:
 *         description: Credenciales incorrectas.
 */
router.post("/login", rateLimit, loginValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { email, password } = req.body;
  console.log(`[LOGIN] Intento de login: ${email}`);

  try {
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    const usuario = rows[0];

    const validPass = await bcrypt.compare(password, usuario.password_hash);
    if (!validPass)
      return res.status(401).json({ error: "Credenciales incorrectas" });

    // Tokens
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: usuario.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login correcto",
      token,
      refreshToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno en login" });
  }
});

/* ============================================================
   SWAGGER — /auth/refresh
============================================================ */
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar el Access Token
 *     tags: [Autenticación]
 *     description: Devuelve un nuevo Access Token usando un Refresh Token válido.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renovado correctamente.
 *       401:
 *         description: Refresh Token inválido o expirado.
 */
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ error: "Refresh Token faltante" });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const newToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      message: "Token renovado",
      token: newToken,
    });

  } catch (error) {
    console.error("Error en refresh:", error);
    res.status(401).json({ error: "Refresh Token inválido o expirado" });
  }
});

/* ============================================================
   VALIDACIÓN — REGISTER
============================================================ */
const registerValidation = [
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password").isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
  body("rol").notEmpty().withMessage("El rol es obligatorio"),
];

/* ============================================================
   SWAGGER — /auth/register
============================================================ */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un usuario
 *     tags: [Autenticación]
 *     description: Registrar un usuario nuevo en el sistema.
 */
router.post("/register", registerValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { nombre, email, password, rol } = req.body;

  try {
    const [exists] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (exists.length > 0)
      return res.status(400).json({ error: "El email ya está registrado" });

    const hashedPass = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPass, rol]
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario_id: result.insertId,
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

/* ============================================================
   VALIDACIÓN — REGISTER PÚBLICO
   ------------------------------------------------------------
   Registro abierto para cualquier persona desde la web.
   El rol se asigna automáticamente como "estudiante".
============================================================ */
const publicRegisterValidation = [
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener mínimo 6 caracteres"),
];

/* ============================================================
   SWAGGER — /auth/register-public
============================================================ */
/**
 * @swagger
 * /auth/register-public:
 *   post:
 *     summary: Registro público de usuario
 *     tags: [Autenticación]
 *     description: Registro abierto. El usuario se crea con rol "estudiante" por defecto.
 */
router.post(
  "/register-public",
  publicRegisterValidation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { nombre, email, password } = req.body;

    try {
      // Verificar si el email ya existe
      const [exists] = await db.query(
        "SELECT id FROM usuarios WHERE email = ?",
        [email]
      );

      if (exists.length > 0) {
        return res.status(400).json({
          error: "El email ya está registrado",
        });
      }

      // Encriptar contraseña
      const hashedPass = await bcrypt.hash(password, 10);

      // Crear usuario con rol seguro por defecto
      const [result] = await db.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol)
         VALUES (?, ?, ?, 'estudiante')`,
        [nombre, email, hashedPass]
      );

      res.status(201).json({
        message: "Registro completado correctamente",
        usuario_id: result.insertId,
      });

    } catch (error) {
      console.error("Error en registro público:", error);
      res.status(500).json({
        error: "Error interno en el registro",
      });
    }
  }
);


module.exports = router;
