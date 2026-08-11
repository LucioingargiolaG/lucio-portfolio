/**
 * Ruta API: POST /api/admin/password
 *
 * Cambia la contraseña del admin (guardada hasheada en MongoDB).
 *
 * Requisitos:
 *  - Sesión válida (cookie firmada) → solo el admin logueado puede cambiar.
 *  - Enviar { currentPassword, newPassword }.
 *  - currentPassword debe coincidir con la actual; newPassword debe tener
 *    al menos 8 caracteres.
 *
 * Nota: las sesiones ya emitidas (cookie firmada con AUTH_SECRET) siguen
 * válidas hasta que expiren; cambiar la contraseña no las revoca. Para
 * revocarlas habría que rotar AUTH_SECRET.
 */

import { NextResponse } from "next/server";
import { isAuthenticatedRequest, checkAdminPassword, updateAdminPassword } from "@/lib/auth";

export async function POST(req) {
  if (!isAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json().catch(() => ({}));

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { error: "La nueva contraseña debe tener al menos 8 caracteres" },
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
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
