/**
 * Autenticación y sesiones del panel de administración.
 *
 * La CONTRASEÑA del admin vive en MongoDB, hasheada con scrypt
 * (models/Admin.js + lib/password.js). No se guarda en el código ni en el
 * bundle, y se puede cambiar desde el panel (/api/admin/password).
 *
 * Al iniciar sesión firmamos un token y lo guardamos en una cookie HttpOnly.
 * El cliente nunca vuelve a tocar la contraseña: la cookie viaja sola en
 * cada petición.
 *
 * Seguridad:
 *  - La contraseña se compara en TIEMPO CONSTANTE (evita timing attacks).
 *  - Se guarda con hash scrypt + salt aleatorio (lib/password.js).
 *  - El token está firmado con HMAC-SHA256 usando AUTH_SECRET (si alguien
 *    lo modifica, la firma no coincide).
 *  - El token expira solo (SESSION_TTL_SECONDS).
 *  - La cookie es HttpOnly (no legible desde JS), Secure (solo HTTPS) y
 *    SameSite=Strict (no se manda en requests cross-site).
 *
 * Nota: el token de sesión es stateless, así que funciona en Vercel/serverless.
 */

import crypto from "crypto";
import { connectToDatabase } from "./mongodb.js";
import Admin from "../models/Admin.js";
import { hashPassword, verifyPassword } from "./password.js";

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 días

/**
 * Compara dos valores en tiempo constante. Para evitar filtrar la longitud
 * por timing, hasheamos ambos lados con SHA-256 y comparamos los digests.
 */
export function safeEqual(a, b) {
  const ah = crypto.createHash("sha256").update(String(a ?? "")).digest();
  const bh = crypto.createHash("sha256").update(String(b ?? "")).digest();
  return crypto.timingSafeEqual(ah, bh);
}

/**
 * Devuelve la credencial admin desde MongoDB.
 * Si no existe ninguna (primera vez), la crea con la contraseña inicial de
 * ADMIN_PASSWORD (.env.local). Ese es el ÚNICO uso de la variable: después
 * la credencial vive en la DB y se cambia desde el panel.
 */
export async function getAdminCredential() {
  await connectToDatabase();
  const admin = await Admin.findOne({});
  if (admin) return admin;

  const initial = process.env.ADMIN_PASSWORD;
  if (!initial) {
    throw new Error(
      "No hay credencial de admin en la base y falta ADMIN_PASSWORD para inicializarla."
    );
  }
  return Admin.create({ passwordHash: hashPassword(initial) });
}

/**
 * Verifica la contraseña de admin contra el hash guardado en MongoDB.
 * Devuelve una promesa boolean. Falla cerrado ante cualquier error de DB.
 */
export async function checkAdminPassword(input) {
  if (typeof input !== "string" || !input) return false;
  try {
    const admin = await getAdminCredential();
    return verifyPassword(input, admin.passwordHash);
  } catch {
    return false;
  }
}

/**
 * Actualiza la contraseña del admin (nuevo hash scrypt en MongoDB) y
 * marca `passwordChangedAt` para revocar las sesiones emitidas antes del
 * cambio (consultado en isAuthenticatedRequest).
 */
export async function updateAdminPassword(newPassword) {
  await connectToDatabase();
  const admin = await getAdminCredential();
  admin.passwordHash = hashPassword(newPassword);
  admin.passwordChangedAt = new Date();
  await admin.save();
  return admin;
}

/**
 * Firma un token de sesión: `iat.exp.hmac` donde:
 *   iat = issued-at (unix seg), exp = expiración,
 *   hmac = HMAC-SHA256(`iat.exp`, AUTH_SECRET)
 */
function signSessionToken() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_TTL_SECONDS;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(`${iat}.${exp}`)
    .digest("hex");
  return `${iat}.${exp}.${sig}`;
}

/**
 * Parsea un token de sesión SIN validar la firma:
 * devuelve { iat, exp, sig } o null si el formato es inválido.
 */
export function parseSessionToken(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [iat, exp, sig] = parts;
  if (!/^\d+$/.test(iat) || !/^\d+$/.test(exp)) return null;
  return { iat: Number(iat), exp: Number(exp), sig };
}

/**
 * Valida un token de sesión (firma + expiración).
 * Si AUTH_SECRET cambió, expiró o fue manipulado → false.
 */
export function verifySessionToken(token) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  const parsed = parseSessionToken(token);
  if (!parsed) return false;

  // Recalculamos la firma sobre `iat.exp` y la comparamos en tiempo constante.
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parsed.iat}.${parsed.exp}`)
    .digest("hex");
  if (!safeEqual(expected, parsed.sig)) return false;

  // Expiración.
  return parsed.exp > Math.floor(Date.now() / 1000);
}

/**
 * Crea una sesión nueva (token + opciones de cookie).
 * Devuelve null si falta AUTH_SECRET.
 */
export function createSession() {
  const token = signSessionToken();
  if (!token) return null;
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      // Secure solo en producción: en localhost (HTTP) los navegadores
      // igual lo aceptan, pero curl/muchas herramientas no. En Vercel es HTTPS.
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}

/**
 * Devuelve true si el request trae una sesión válida en su cookie.
 * Recibe el objeto `request` del Route Handler (NextRequest).
 *
 * Revocación (M8): una vez que se cambia la contraseña, se invalidan
 * los tokens emitidos ANTES de ese cambio. Las sesiones son stateless
 * (el token trae el issued-at `iat`); el Admin tiene `passwordChangedAt`.
 */
export async function isAuthenticatedRequest(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!verifySessionToken(token)) return false;

  try {
    const admin = await getAdminCredential();
    const parsed = parseSessionToken(token);
    if (admin?.passwordChangedAt && parsed) {
      // El token guarda `iat` en SEGUNDOS. Comparamos contra el segundo del
      // cambio: las sesiones de segundos anteriores se revocan, y un login
      // inmediatamente posterior (mismo segundo) sigue siendo válido.
      const changedAtSecond = Math.floor(admin.passwordChangedAt.getTime() / 1000);
      if (parsed.iat < changedAtSecond) {
        return false;
      }
    }
    return true;
  } catch {
    // Fail-closed: si no podemos confirmar el passwordChangedAt, no autorizamos.
    // Antes se validaba solo la firma y una sesión revocada podía colarse.
    return false;
  }
}
