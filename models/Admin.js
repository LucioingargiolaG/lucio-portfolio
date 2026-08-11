/**
 * Modelo de datos "Admin" — credencial del panel de administración.
 *
 * La contraseña NUNCA se guarda en texto plano: se almacena hasheada
 * (scrypt + salt) vía lib/password.js. El único documento que existe es la
 * credencial activa del admin (passwordHash).
 *
 * Ventajas de guardarla acá (y no en una variable de entorno):
 *  - Se puede cambiar desde el propio panel (/api/admin/password) sin
 *    redeployear ni tocar .env.
 *  - No aparece en el código ni en el bundle.
 *
 * El patrón `mongoose.models.Admin || mongoose.model(...)` evita el error
 * "Cannot overwrite model" con el hot-reload de Next.js en desarrollo.
 */

import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema(
  {
    passwordHash: {
      type: String,
      required: [true, "El hash de contraseña es requerido"],
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

// Reutiliza el modelo si ya fue compilado; si no, lo crea.
export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
