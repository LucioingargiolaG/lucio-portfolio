/**
 * Ruta API: POST /api/admin/verify
 *
 * Verifica la contraseña de administrador contra el hash guardado en MongoDB
 * (models/Admin.js). Si es la primera vez y no hay credencial, la crea con
 * ADMIN_PASSWORD de .env.local.
 *
 * Seguridad:
 *  - La contraseña se guarda hasheada (scrypt) y se compara en TIEMPO
 *    CONSTANTE (lib/password.js) → sin timing attacks ni texto plano.
 *  - RATE LIMITING por IP (lib/rateLimit.js) → frena fuerza bruta; tras N
 *    intentos fallidos la IP queda bloqueada temporalmente (ni se compara).
 *  - Login exitoso → se firma un token de sesión (HMAC + expiración) y se
 *    guarda en una cookie HttpOnly; Secure; SameSite=Strict. El cliente ya
 *    no guarda ni reenvía la contraseña.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminPassword, createSession } from "@/lib/auth";
import { checkAttempt, getClientIp, resetAttempts } from "@/lib/rateLimit";

export async function POST(req) {
  // Rate limit ANTES de comparar: si la IP está bloqueada, ni intentamos.
  const ip = getClientIp(req);
  const limit = checkAttempt(ip);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Demasiados intentos. Esperá ${limit.retryAfterSeconds} segundos.`,
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  const { password } = await req.json().catch(() => ({}));

  // Contraseña incorrecta (o error de DB) → 401. El intento ya quedó contado.
  if (!(await checkAdminPassword(password))) {
    return NextResponse.json(
      { ok: false, error: "Contraseña incorrecta" },
      { status: 401 }
    );
  }

  // Contraseña correcta: limpiamos el contador y creamos la sesión.
  resetAttempts(ip);

  const session = createSession();
  if (!session) {
    // AUTH_SECRET no está configurado: no podemos firmar sesiones.
    return NextResponse.json(
      { ok: false, error: "Error de configuración del servidor" },
      { status: 500 }
    );
  }

  // Guardamos la cookie de sesión en la respuesta.
  const cookieStore = await cookies();
  cookieStore.set(session.name, session.value, session.options);

  return NextResponse.json({ ok: true });
}
