/**
 * Ruta API CRUD de proyectos: /api/admin/projects
 *
 * Toda petición debe enviar el header `x-admin-pin` con el PIN correcto
 * (mismo valor que ADMIN_PIN en .env.local). Si no, responde 401.
 *
 * Métodos soportados:
 *  - GET    → lista todos los proyectos (del más nuevo al más viejo)
 *  - POST   → crea un proyecto nuevo
 *  - DELETE → borra un proyecto por su _id
 */

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";

const ADMIN_PIN = process.env.ADMIN_PIN;

/**
 * Valida que el header "x-admin-pin" coincida con el PIN del servidor.
 */
function checkPin(req) {
  return ADMIN_PIN && req.headers.get("x-admin-pin") === ADMIN_PIN;
}

// GET: lista de proyectos.
export async function GET(req) {
  // Seguridad: sin PIN no se devuelve nada.
  if (!checkPin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      // String(_id) porque ObjectId no es JSON-serializable directo.
      projects: projects.map((p) => ({ ...p, _id: String(p._id) })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: crea un proyecto.
export async function POST(req) {
  if (!checkPin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // `technologies` puede llegar como string ("React, Next") o como array.
    // Si es string, lo partimos por comas y filtramos los vacíos.
    const project = await Project.create({
      title: body.title,
      description: body.description,
      technologies: Array.isArray(body.technologies)
        ? body.technologies
        : String(body.technologies || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      githubUrl: body.githubUrl,
      category: body.category,
      architecture: body.architecture,
      image: body.image || "🛒", // emoji por defecto si no mandan imagen
    });

    // 201 = recurso creado correctamente.
    return NextResponse.json(
      { project: { ...project.toObject(), _id: String(project._id) } },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: elimina un proyecto por su id (mandado en el body).
export async function DELETE(req) {
  if (!checkPin(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await req.json().catch(() => ({}));
  if (!id) {
    return NextResponse.json({ error: "id requerido" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    await Project.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
