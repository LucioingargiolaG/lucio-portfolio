/**
 * Rate limiting persistente y compartido para el panel de administración.
 *
 * Antes era un Map en memoria: en Vercel cada instancia tenía su propio
 * contador y se perdía en cada cold start. Ahora el estado vive en MongoDB
 * Atlas (la misma base del sitio), con una operación atómica por intento.
 *
 * Seguridad:
 *  - La IP se valida con net.isIP() y se guarda SOLO como HMAC-SHA256.
 *  - En Vercel se confía únicamente en headers inyectados por la plataforma.
 *    Fuera de Vercel se ignoran x-forwarded-for / x-real-ip (spoofables).
 *  - Ante error de DB, de AUTH_SECRET o de índices: fail-closed (429/503),
 *    nunca se permite un intento "gratis".
 */

import crypto from "node:crypto";
import net from "node:net";
import { connectToDatabase } from "./mongodb.js";
import LoginAttempt from "../models/LoginAttempt.js";

export const MAX_ATTEMPTS = 5; // intentos permitidos por ventana
export const WINDOW_MS = 15 * 60 * 1000; // ventana de 15 minutos
export const LOCK_MS = 15 * 60 * 1000; // bloqueo de 15 minutos

const TTL_MARGIN_MS = 60 * 1000;
const STORE_FAILURE_RETRY_SECONDS = 30;

let indexesReady = null;

function looksLikeVercel(req) {
  return Boolean(
    process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      req?.headers?.get?.("x-vercel-id")
  );
}

function isValidIp(value) {
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  return net.isIP(v) !== 0;
}

/**
 * Obtiene la IP del cliente sin confiar en valores que pueda fijar el usuario.
 *
 * - En Vercel: x-vercel-forwarded-for y x-forwarded-for son sobreescritos por
 *   la plataforma, así que el primero es confiable. x-real-ip se usa como
 *   último recurso. Si ninguno es válido, se lanza (fail-closed).
 * - Fuera de Vercel: todos los requests comparten la clave "local". Esto es
 *   intencional: aceptar headers detrás de un proxy propio requiere configurar
 *   explícitamente ese proxy; acá no se hace para no abrir un bypass.
 */
export function getClientIp(req) {
  if (looksLikeVercel(req)) {
    const candidates = [
      "x-vercel-forwarded-for",
      "x-forwarded-for",
      "x-real-ip",
    ];

    for (const name of candidates) {
      const raw = req?.headers?.get?.(name);
      if (!raw) continue;
      const first = raw.split(",")[0].trim();
      if (isValidIp(first)) return first;
    }

    throw new Error("No se pudo obtener una IP válida de Vercel");
  }

  return "local";
}

/**
 * Deriva la clave HMAC. Nunca se guarda la IP en claro ni en logs.
 */
function keyFor(ip, scope) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no configurado");
  return crypto
    .createHmac("sha256", secret)
    .update(`admin-rate-limit:${scope}:${ip}`)
    .digest("hex");
}

async function ensureIndexes() {
  if (!indexesReady) {
    // init() crea los índices definidos en el modelo (único + TTL) una sola vez.
    indexesReady = LoginAttempt.init();
  }
  try {
    await indexesReady;
  } catch (err) {
    indexesReady = null;
    throw err;
  }
}

/**
 * Registra un intento de forma atómica y devuelve si está permitido.
 *
 * Un único findOneAndUpdate con pipeline evita que dos instancias concurrentes
 * lean el mismo contador. El window y el lock se recalculan dentro de MongoDB.
 *
 * @returns {Promise<{ok: boolean, retryAfterSeconds?: number, reason?: string}>}
 */
export async function checkAttempt(ip, scope = "login") {
  const storeFailure = {
    ok: false,
    reason: "store",
    retryAfterSeconds: STORE_FAILURE_RETRY_SECONDS,
  };

  // Un upsert concurrente puede chocar con el índice único (E11000).
  // Reintentamos una vez; el segundo findOneAndUpdate ya lee la fila creada.
  for (let round = 0; round < 2; round += 1) {
    try {
      const key = keyFor(ip, scope);
      await connectToDatabase();
      await ensureIndexes();
  
      const now = Date.now();
      const nowDate = new Date(now);
      const windowStart = new Date(now - WINDOW_MS);
      const lockUntil = new Date(now + LOCK_MS);
      const expiresAt = new Date(now + WINDOW_MS + LOCK_MS + TTL_MARGIN_MS);
  
      const doc = await LoginAttempt.findOneAndUpdate(
        { key },
        [
          {
            $set: {
              __now: { $literal: nowDate },
              __windowStart: { $literal: windowStart },
              __lockUntil: { $literal: lockUntil },
              __expiresAt: { $literal: expiresAt },
            },
          },
          {
            $set: {
              __prevCount: { $ifNull: ["$count", 0] },
              __prevFirstAt: { $ifNull: ["$firstAt", "$__now"] },
              __prevLockedUntil: { $ifNull: ["$lockedUntil", null] },
            },
          },
          { $set: { __lockActive: { $gt: ["$__prevLockedUntil", "$__now"] } } },
          {
            $set: {
              __windowExpired: { $lte: ["$__prevFirstAt", "$__windowStart"] },
            },
          },
          {
            $set: {
              __shouldReset: {
                $and: [
                  { $not: "$__lockActive" },
                  {
                    $or: [
                      "$__windowExpired",
                      { $eq: ["$__prevCount", 0] },
                    ],
                  },
                ],
              },
            },
          },
          {
            $set: {
              __count: {
                $cond: [
                  "$__shouldReset",
                  1,
                  {
                    $cond: [
                      "$__lockActive",
                      "$__prevCount",
                      { $add: ["$__prevCount", 1] },
                    ],
                  },
                ],
              },
            },
          },
          {
            $set: {
              __firstAt: {
                $cond: ["$__shouldReset", "$__now", "$__prevFirstAt"],
              },
            },
          },
          {
            $set: {
              __block: {
                $cond: [
                  "$__lockActive",
                  true,
                  { $gt: ["$__count", MAX_ATTEMPTS] },
                ],
              },
            },
          },
          {
            $set: {
              __finalLockedUntil: {
                $cond: [
                  "$__block",
                  {
                    $cond: [
                      "$__lockActive",
                      "$__prevLockedUntil",
                      "$__lockUntil",
                    ],
                  },
                  null,
                ],
              },
            },
          },
          {
            $set: {
              __retryAfter: {
                $cond: [
                  "$__block",
                  {
                    $max: [
                      1,
                      {
                        $ceil: {
                          $divide: [
                            { $subtract: ["$__finalLockedUntil", "$__now"] },
                            1000,
                          ],
                        },
                      },
                    ],
                  },
                  0,
                ],
              },
            },
          },
          {
            $set: {
              count: "$__count",
              firstAt: "$__firstAt",
              lockedUntil: "$__finalLockedUntil",
              expiresAt: "$__expiresAt",
              blocked: "$__block",
              retryAfterSeconds: "$__retryAfter",
            },
          },
          {
            $unset: [
              "__now",
              "__windowStart",
              "__lockUntil",
              "__expiresAt",
              "__prevCount",
              "__prevFirstAt",
              "__prevLockedUntil",
              "__lockActive",
              "__windowExpired",
              "__shouldReset",
              "__count",
              "__firstAt",
              "__block",
              "__finalLockedUntil",
              "__retryAfter",
            ],
          },
        ],
        { upsert: true, returnDocument: "after", updatePipeline: true }
      );
  
      if (!doc) throw new Error("No se pudo registrar el intento");
  
      return doc.blocked
        ? { ok: false, retryAfterSeconds: doc.retryAfterSeconds }
        : { ok: true };
    } catch (err) {
      if (err?.code === 11000 && round === 0) continue;
      // Fail-closed: si el store no responde, no se permite intentar.
      return storeFailure;
    }
  }

  return storeFailure;
}

/** Borra el contador tras un login válido. Si falla, no abre el acceso. */
export async function resetAttempts(ip, scope = "login") {
  try {
    const key = keyFor(ip, scope);
    await connectToDatabase();
    await ensureIndexes();
    await LoginAttempt.deleteOne({ key });
    return true;
  } catch {
    return false;
  }
}
