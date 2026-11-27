/**
 * Ruta API: POST /api/admin/verify
 *
 * Verifica la contraseña de administrador contra el hash guardado en MongoDB
 * (models/Admin.js). Si es la primera vez y no hay credencial, la crea con
 * ADMIN_PASSWORD del entorno.
 *
 * Seguridad:
 *  - Comparación en TIEMPO CONSTANTE (scrypt + salt) → sin timing attacks.
 *  - Rate limiting PERSISTENTE en MongoDB, atómico y compartido entre
 *    instancias de Vercel (lib/rateLimit.js). Fail-closed ante errores.
 *  - Login exitoso → cookie firmada HttpOnly; Secure; SameSite=Strict.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminPassword, createSession } from "@/lib/auth";
import { checkAttempt, getClientIp, resetAttempts } from "@/lib/rateLimit";

const STORE_ERROR = {
  ok: false,
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
      ok: false,
      error: `Demasiados intentos. Esperá ${limit.retryAfterSeconds} segundos.`,
      retryAfterSeconds: limit.retryAfterSeconds,
    },
    {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    }
  );
}

export async function POST(req) {
  // Rate limit ANTES de comparar: si está bloqueado, ni se lee la contraseña.
  let ip;
  let limit;
  try {
    ip = getClientIp(req);
    limit = await checkAttempt(ip, "login");
  } catch {
    limit = STORE_ERROR;
  }
  if (!limit.ok) return rateLimitResponse(limit);

  const { password } = await req.json().catch(() => ({}));

  // Error de DB o contraseña incorrecta → 401. El intento ya quedó contado.
  if (!(await checkAdminPassword(password))) {
    return NextResponse.json(
      { ok: false, error: "Contraseña incorrecta" },
      { status: 401 }
    );
  }

  // Si falla el reset, el contador queda como estaba: es fail-closed.
  await resetAttempts(ip, "login");

  const session = createSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Error de configuración del servidor" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(session.name, session.value, session.options);

  return NextResponse.json({ ok: true });
}
