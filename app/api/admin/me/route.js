/**
 * Ruta API: GET /api/admin/me
 *
 * Indica si la petición tiene una sesión de admin válida.
 * El panel lo usa al montar para saber si mostrar el login o el panel.
 */

import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/auth";

export async function GET(req) {
  if (!isAuthenticatedRequest(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
