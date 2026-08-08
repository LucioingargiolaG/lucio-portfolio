/**
 * Conexión a MongoDB usando Mongoose.
 *
 * Este helper se importa desde las rutas API y las páginas del servidor
 * para conectarse a la base de datos antes de hacer consultas.
 *
 * Next.js (App Router) ejecuta el servidor en Node y las rutas API pueden
 * correr varias veces; por eso cacheamos la conexión en `global` para
 * reutilizar la misma instancia de Mongoose y no abrir millones de
 * conexiones por request (el patrón oficial recomendado por Next.js).
 */

import mongoose from "mongoose";

// La URI se lee de las variables de entorno (.env.local).
// Ejemplo: mongodb://localhost:27017/lucio-portfolio
const MONGODB_URI = process.env.MONGODB_URI;

// Si falta la URI avisamos por consola (para que el dev se dé cuenta).
if (!MONGODB_URI) {
  console.warn(
    "MONGODB_URI no está definida. Usa .env.local para configurarla."
  );
}

// Cache global: guardamos la conexión y/o la promesa de conexión para
// reutilizarlas entre requests. `global` sobrevive a los hot-reloads.
const cached = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Conecta a MongoDB (si ya está conectado, devuelve la conexión existente).
 * Devuelve la instancia de conexión de Mongoose.
 */
export async function connectToDatabase() {
  // Ya estamos conectados: devolver lo que hay en cache.
  if (cached.conn) return cached.conn;

  // La URI es obligatoria: sin ella no se puede conectar.
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI no está configurada en .env.local");
  }

  // Si no hay una conexión en curso, la iniciamos y guardamos la promesa.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  // Esperamos a que termine y cacheamos la conexión lista.
  cached.conn = await cached.promise;
  return cached.conn;
}
