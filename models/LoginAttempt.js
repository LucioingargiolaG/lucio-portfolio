/**
 * Modelo de datos para el rate limiting persistente del panel de administración.
 *
 * Un documento por IP (hasheada) y ámbito ("login" o "password"). La clave
 * NUNCA guarda la IP en claro: se deriva con HMAC-SHA256 desde AUTH_SECRET.
 *
 * `expiresAt` se usa con un índice TTL (expireAfterSeconds: 0) para que
 * MongoDB elimine automáticamente los registros viejos. La lógica de ventana
 * y bloqueo NO depende de que el TTL ya haya corrido: findOneAndUpdate
 * recalcula el estado de forma atómica en cada intento.
 */

import mongoose, { Schema } from "mongoose";

const LoginAttemptSchema = new Schema(
  {
    key: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    firstAt: { type: Date, required: true },
    lockedUntil: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
    blocked: { type: Boolean, default: false },
    retryAfterSeconds: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Una sola fila por IP/ámbito: evita carreras entre instancias serverless.
LoginAttemptSchema.index({ key: 1 }, { unique: true });

// TTL: MongoDB borra el documento cuando expiresAt <= ahora.
LoginAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.LoginAttempt || mongoose.model("LoginAttempt", LoginAttemptSchema);
