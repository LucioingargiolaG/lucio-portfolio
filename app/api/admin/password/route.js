/**
 * Ruta API: POST /api/admin/password
 *
 * Cambia la contraseña del admin (guardada hasheada en MongoDB).
 *
 * Requisitos:
 *  - Sesión válida (cookie firmada) → solo el admin logueado puede cambiarla.
 *  - Rate limit persistente e independiente del de /verify (ámbito "password").
 *  - currentPassword debe coincidir; newPassword mínimo 8 caracteres.
 *
 * `passwordChangedAt` revoca las sesiones emitidas antes del cambio, según
 * lo consultado por isAuthenticatedRequest() en lib/auth.js.
 */

import { NextResponse } from "next/server";
import {
  isAuthenticatedRequest,
  checkAdminPassword,
  updateAdminPassword,
} from "@/lib/auth";
import { checkAttempt, getClientIp, resetAttempts } from "@/lib/rateLimit";

const STORE_ERROR = {
  error: "Servicio no disponible. Intentá nuevamente en unos segundos.",
  retryAfterSeconds: 30,
};

function rateLimitResponse(limit) {
  if (limit.reason === "store") {
    return NextResponse.json(STORE_ERROR, {
      status: 503,
      headers: { "Retry-After": String(STORE_ERROR.retryAfterSeconds) },
    });
  }

  return NextResponse.json(
    {
      error: `Demasiados intentos. Esperá ${limit.retryAfterSeconds} segundos.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    }
  );
}

export async function POST(req) {
  let ip;
  let limit;
  try {
    ip = getClientIp(req);
    limit = await checkAttempt(ip, "password");
  } catch {
    limit = { ...STORE_ERROR, reason: "store" };
  }
  if (!limit.ok) return rateLimitResponse(limit);

  // Falla cerrado: si la DB no responde, isAuthenticatedRequest devuelve false.
  if (!(await isAuthenticatedRequest(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json().catch(() => ({}));

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { error: "La nueva contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  if (newPassword === currentPassword) {
    return NextResponse.json(
      { error: "La nueva contraseña es igual a la actual" },
      { status: 400 }
    );
  }

  if (!(await checkAdminPassword(currentPassword))) {
    return NextResponse.json(
      { error: "La contraseña actual no es correcta" },
      { status: 400 }
    );
  }

  try {
    await updateAdminPassword(newPassword);
    await resetAttempts(ip, "password");
    return NextResponse.json({ ok: true });
  } catch {
    // No devolver err.message: puede filtrar detalles internos.
    return NextResponse.json(
      { error: "No se pudo actualizar la contraseña" },
      { status: 500 }
    );
  }
}
