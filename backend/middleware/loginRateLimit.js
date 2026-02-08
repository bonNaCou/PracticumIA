/**
 * Rate Limit manual para /auth/login
 * Protege contra ataques de fuerza bruta usando:
 *  - IP del cliente
 *  - Email (si se envía)
 *  - Ventana temporal de 15 min
 */

const attempts = new Map();

module.exports = (req, res, next) => {
  const ip = req.ip;
  const email = req.body.email || "unknown";

  const key = `${ip}-${email}`;
  const now = Date.now();

  const WINDOW = 15 * 60 * 1000; // 15 minutos
  const MAX_ATTEMPTS = 10;       // Límite de intentos

  // Si no hay registro previo → crear uno
  if (!attempts.has(key)) {
    attempts.set(key, { count: 1, lastAttempt: now });
    return next();
  }

  const data = attempts.get(key);

  // Si pasaron más de 15 min → reiniciar contador
  if (now - data.lastAttempt > WINDOW) {
    attempts.set(key, { count: 1, lastAttempt: now });
    return next();
  }

  // Incrementar intentos
  data.count++;
  data.lastAttempt = now;

  // Si superó el límite → bloquear
  if (data.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      error: "Demasiados intentos. Intente nuevamente en unos minutos."
    });
  }

  next();
};
