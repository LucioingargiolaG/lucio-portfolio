/**
 * Modelo de datos "Project" (Proyecto).
 *
 * Define la estructura de cada documento que se guarda en la colección
 * "projects" de MongoDB. Usamos Mongoose, que agrega validaciones y un
 * esquema tipado por encima de MongoDB.
 *
 * El patrón `mongoose.models.Project || mongoose.model(...)` evita el error
 * "Cannot overwrite model" cuando el módulo se recarga varias veces (algo
 * común con el hot-reload de Next.js en desarrollo).
 */

import mongoose, { Schema } from "mongoose";

// Esquema de un proyecto del portfolio.
const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "El título es requerido"], // obligatorio: mensaje de error si falta
      trim: true, // quita espacios al inicio y al final
      maxlength: [100, "El título no puede exceder 100 caracteres"],
    },
    description: {
      type: String,
      required: [true, "La descripción es requerida"],
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    // Lista de tecnologías usadas: ["React", "Next.js", "MongoDB", ...]
    technologies: {
      type: [String],
      required: [true, "Al menos una tecnología es requerida"],
      validate: {
        validator: (v) => v.length > 0, // la lista no puede estar vacía
        message: "Debe haber al menos una tecnología",
      },
    },
    githubUrl: {
      type: String,
      required: [true, "La URL de GitHub es requerida"],
    },
    // Categoría del proyecto, solo admite estos 3 valores (enum).
    category: {
      type: String,
      enum: ["web", "landing", "marketing"],
      required: [true, "La categoría es requerida"],
    },
    // Explicación técnica de cómo está construido (arquitectura).
    architecture: {
      type: String,
      required: [true, "La explicación de arquitectura es requerida"],
      maxlength: [1000, "La arquitectura no puede exceder 1000 caracteres"],
    },
    // "Imagen" del proyecto: por simplicidad se usa un emoji (🛒, 📊...).
    image: {
      type: String,
      default: "🛒",
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

// Reutiliza el modelo si ya fue compilado; si no, lo crea.
export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
