/**
 * Rate limiting en memoria para el login del panel de administración.
 *
 * Objetivo: frenar la fuerza bruta. Por IP se permiten MAX_ATTEMPTS intentos
 * en una ventana de WINDOW_MS; pasado el máximo, la IP queda bloqueada por
 * LOCK_MS (no se compara siquiera la contraseña).
 *
 * Limitaciones honestas:
 *  - Es por proceso/instancia. En Vercel (serverless) cada instancia tiene su
 *    propio Map, así que esto es una capa best-effort (frena bots locales y
 *    la mayoría de los ataques de un solo origen).
 *  - Se resetea al reiniciar el servidor. Para protección en producción real
 *    convendría algo persistente (Redis o un servicio tipo Upstash).
 */

const MAX_ATTEMPTS = 5; // intentos permitidos
const WINDOW_MS = 15 * 60 * 1000; // ventana de 15 minutos
const LOCK_MS = 15 * 60 * 1000; // bloqueo de 15 minutos
const MAX_ENTRIES = 10_000; // tope para no acumular infinitas IPs

const attempts = new Map(); // key = ip → { count, firstAt, lockedUntil }

/**
 * Obtiene la IP del cliente desde los headers de proxy. Fuera de proxies
 * (localhost) no hay x-forwarded-for, así que usamos un fallback fijo.
 */
export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "local";
}

function prune() {
  if (attempts.size < MAX_ENTRIES) return;
  const now = Date.now();
  for (const [key, val] of attempts) {
    if (now - val.firstAt > WINDOW_MS && now > (val.lockedUntil || 0)) {
      attempts.delete(key);
    }
  }
}

/**
 * Registra un intento de login y devuelve si está permitido.
 * Devuelve { ok: true } si puede intentar, o { ok: false, retryAfterSeconds }.
 */
export function checkAttempt(key) {
  prune();
  const now = Date.now();
  const entry = attempts.get(key);

  // Bloqueado por fuerza bruta.
  if (entry && entry.lockedUntil && now < entry.lockedUntil) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }

  if (!entry) {
    attempts.set(key, { count: 1, firstAt: now, lockedUntil: null });
    return { ok: true };
  }

  // Si ya pasó la ventana, reiniciamos el contador.
  if (now - entry.firstAt > WINDOW_MS) {
    entry.count = 1;
    entry.firstAt = now;
    entry.lockedUntil = null;
    return { ok: true };
  }

  entry.count += 1;

  // Superó el máximo: bloqueamos.
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_MS;
    return { ok: false, retryAfterSeconds: LOCK_MS / 1000 };
  }

  return { ok: true };
}

/** Reinicia el contador de la IP tras un login exitoso. */
export function resetAttempts(key) {
  attempts.delete(key);
}
