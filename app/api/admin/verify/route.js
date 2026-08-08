/**
 * Ruta API: POST /api/admin/verify
 *
 * Verifica el PIN de administración contra la variable de entorno
 * ADMIN_PIN (.env.local). Si es correcto devuelve { ok: true }.
 *
 * El front (SecretAccess y AdminPanel) guarda el PIN en sessionStorage y
 * luego lo manda en el header "x-admin-pin" en las otras llamadas.
 *
 * Nota: esto es una protección simple (PIN por variable de entorno).
 * Para producción real convendría usar sesiones/JWT reales.
 */

import { NextResponse } from "next/server";

// PIN de admin definido en .env.local
const ADMIN_PIN = process.env.ADMIN_PIN;

export async function POST(req) {
  // Leemos el JSON del body: { pin: "..." } (con .catch para que no explote
  // si mandan un body vacío o inválido).
  const { pin } = await req.json().catch(() => ({}));

  // Si no hay ADMIN_PIN configurado, o el PIN no coincide → 401.
  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return NextResponse.json({ ok: false, error: "Código incorrecto" }, { status: 401 });
  }

  // PIN correcto.
  return NextResponse.json({ ok: true });
}
