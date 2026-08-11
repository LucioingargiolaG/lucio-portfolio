/**
 * Hash de contraseñas con scrypt (Node built-in, sin dependencias).
 *
 * Formato almacenado: `salt:hash` (hex). El salt es aleatorio por
 * contraseña, así que dos hashes iguales de la misma contraseña son
 * distintos. La verificación compara en TIEMPO CONSTANTE.
 */

import crypto from "crypto";

const KEY_LEN = 64;

/**
 * Hashea una contraseña en texto plano → `salt:hash`.
 */
export function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plain, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifica una contraseña contra un hash almacenado (`salt:hash`).
 * Comparación en tiempo constante. Devuelve true/false.
 */
export function verifyPassword(plain, stored) {
  if (typeof stored !== "string") return false;

  const idx = stored.indexOf(":");
  if (idx <= 0) return false;

  const salt = stored.slice(0, idx);
  const expected = stored.slice(idx + 1);

  const hash = crypto.scryptSync(plain, salt, KEY_LEN);
  const expectedBuf = Buffer.from(expected, "hex");

  return hash.length === expectedBuf.length && crypto.timingSafeEqual(hash, expectedBuf);
}
