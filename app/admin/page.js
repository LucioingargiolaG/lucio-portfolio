/**
 * Página del panel de administración — ruta "/admin".
 *
 * Esta página es un envoltorio (wrapper): solo define los metadatos y
 * renderiza el componente cliente `AdminPanel` (todo el estado y la lógica
 * viven en AdminPanel.js).
 *
 * SEO: los motores de búsqueda NO deben indexar esta página, por eso
 * `robots: { index: false, follow: false }`.
 */

import AdminPanel from "./AdminPanel";

export const metadata = {
  title: "Admin | Lucio Ingargiola",
  description: "Panel privado para administrar los proyectos.",
  robots: {
    index: false, // no indexar en Google
    follow: false, // no seguir enlaces de esta página
  },
};

export default function AdminPage() {
  // El trabajo pesado lo hace AdminPanel (componente cliente).
  return <AdminPanel />;
}
