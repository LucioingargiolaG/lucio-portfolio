/**
 * Panel de administración privado (client component).
 *
 * Flujo:
 *  1. Al montar consulta /api/admin/me con la cookie de sesión: si es
 *     válida, entra directo y carga proyectos.
 *  2. Si no → muestra un formulario de login que verifica la contraseña
 *     contra /api/admin/verify (el servidor firma una cookie HttpOnly).
 *  3. Ya autenticado: permite crear proyectos (formulario) y eliminarlos
 *     (lista). La sesión viaja sola en la cookie; la contraseña nunca se
 *     guarda en el navegador ni se reenvía.
 *
 * Para acceder: escribir "admin" en cualquier parte del sitio → candado
 * flotante → ingresar la contraseña → /admin.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Plus, Trash2, RefreshCw, Save, FolderPlus, LogOut, KeyRound } from 'lucide-react';

// Categorías permitidas para los proyectos (se muestran en el select).
const categories = [
  { value: 'web', label: 'Web App' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'marketing', label: 'Marketing' },
];

// Estado inicial del formulario de alta de proyectos.
const emptyForm = {
  title: '',
  description: '',
  technologies: '',
  githubUrl: '',
  category: 'web',
  architecture: '',
  image: '',
};

export default function AdminPanel() {
  const router = useRouter();
  const [password, setPassword] = useState(''); // contraseña tipeada en el login
  const [authed, setAuthed] = useState(false); // ¿está logueado?
  const [loading, setLoading] = useState(false); // indicador de "haciendo algo"
  const [message, setMessage] = useState(null); // toast de éxito/error
  const [projects, setProjects] = useState([]); // proyectos guardados
  const [form, setForm] = useState(emptyForm); // valores del formulario
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' }); // cambio de contraseña
  const [pwLoading, setPwLoading] = useState(false); // guardando contraseña

  // Muestra un mensaje temporal (se borra solo a los 4 segundos).
  const setMessageState = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Carga la lista de proyectos desde la API (la sesión viaja en la cookie).
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects ?? []);
      } else {
        setMessageState('error', data.error ?? 'Error al cargar proyectos');
      }
    } catch (err) {
      setMessageState('error', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Al montar: si hay sesión válida (cookie), entramos directo y cargamos.
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          setAuthed(true);
          loadProjects();
        }
      } catch {
        // sin sesión: nos quedamos en el login
      }
    };
    checkSession();
  }, [loadProjects]);

  // Verifica la contraseña contra la API. Si es correcta, el servidor firma
  // una cookie HttpOnly (la sesión). No guardamos nada en el navegador.
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthed(true);
        setPassword('');
        loadProjects();
      } else {
        setMessageState('error', data.error ?? 'Contraseña incorrecta');
      }
    } catch (err) {
      setMessageState('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cierra la sesión en el servidor (borra la cookie) y vuelve al login.
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // si falla la red, igual limpiamos el estado local
    }
    setAuthed(false);
    setProjects([]);
    setForm(emptyForm);
  };

  // Actualiza el campo del formulario que cambió (por su atributo name).
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Envía el formulario a la API para crear el proyecto.
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setForm(emptyForm);
        setMessageState('success', 'Proyecto creado correctamente');
        loadProjects();
      } else {
        setMessageState('error', data.error ?? 'Error al crear el proyecto');
      }
    } catch (err) {
      setMessageState('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Elimina un proyecto (con confirmación previa del usuario).
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessageState('success', 'Proyecto eliminado');
        loadProjects();
      } else {
        setMessageState('error', data.error ?? 'Error al eliminar');
      }
    } catch (err) {
      setMessageState('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cambia la contraseña del admin (se guarda hasheada en MongoDB).
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setMessageState('error', 'La nueva contraseña no coincide');
      return;
    }
    if (pwForm.next.length < 8) {
      setMessageState('error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwForm.current,
          newPassword: pwForm.next,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwForm({ current: '', next: '', confirm: '' });
        setMessageState('success', 'Contraseña actualizada');
      } else {
        setMessageState('error', data.error ?? 'Error al cambiar la contraseña');
      }
    } catch (err) {
      setMessageState('error', err.message);
    } finally {
      setPwLoading(false);
    }
  };

  // Clases reutilizables de inputs y labels.
  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg-card)] text-sm text-[var(--ink-strong)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-accent transition-colors';

  const labelClass =
    'block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--ink-soft)]';

  return (
    <section className="relative min-h-screen bg-[var(--bg-section-glass)] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Encabezado: badge + título + botón salir */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <span className="font-mono inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--accent)] border border-accent-20 bg-accent-5 rounded-full px-4 py-1.5">
              <Lock size={12} />
              Panel privado
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-4 text-[var(--ink-strong)]">
              Administración
            </h1>
          </div>
          {authed && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              Salir
            </button>
          )}
        </div>

        {/* Toast de éxito/error */}
        {message && (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              message.type === 'success'
                ? 'border-accent-30 bg-accent-5 text-[var(--accent)]'
                : 'border-red-400/40 bg-red-500/10 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Vista según estado: login o panel */}
        {!authed ? (
          // -------- LOGIN: formulario de contraseña --------
          <form
            onSubmit={handleLogin}
            className="mt-10 max-w-md mx-auto rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-8 shadow-xl"
          >
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-10 text-[var(--accent)]">
              <Lock size={26} />
            </div>
            <label className={labelClass}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresá tu contraseña"
              autoFocus
              className={inputClass}
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3.5 rounded-full font-bold text-black bg-accent hover:bg-accent-strong transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Verificando…' : 'Ingresar'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 py-3 rounded-full border border-[var(--line)] text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--accent)] hover:border-accent-50 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              Salir
            </button>
          </form>
        ) : (
          // -------- PANEL: crear + listar proyectos --------
          <div className="mt-10 space-y-12">
            {/* Formulario de creación */}
            <form
              onSubmit={handleCreate}
              className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6 md:p-8 shadow-xl"
            >
              <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--ink-strong)]">
                <FolderPlus size={18} className="text-[var(--accent)]" />
                Agregar proyecto
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>Título *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="Nombre del proyecto"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Descripción *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="¿Qué hace el proyecto?"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Tecnologías * (separadas por coma)</label>
                  <input
                    type="text"
                    name="technologies"
                    value={form.technologies}
                    onChange={handleChange}
                    required
                    placeholder="React, Next.js, MongoDB"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Categoría *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Enlace * (Git o portfolio de edición)</label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={form.githubUrl}
                    onChange={handleChange}
                    required
                    placeholder="https://github.com/tu-usuario/proyecto o tu portfolio de edición"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Arquitectura *</label>
                  <textarea
                    name="architecture"
                    value={form.architecture}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Explicá cómo está armado el proyecto"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Imagen (emoji, opcional)</label>
                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="🛒"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex items-center gap-2 py-3 px-6 rounded-full font-bold text-black bg-accent hover:bg-accent-strong transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus size={16} />
                {loading ? 'Guardando…' : 'Guardar proyecto'}
              </button>
            </form>

            {/* Lista de proyectos */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6 md:p-8 shadow-xl">
              <h2 className="flex items-center justify-between text-lg font-bold text-[var(--ink-strong)]">
                <span className="flex items-center gap-2">
                  <Save size={18} className="text-[var(--accent)]" />
                  Proyectos guardados
                </span>
                <button
                  type="button"
                  onClick={loadProjects}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refrescar
                </button>
              </h2>

              {projects.length === 0 ? (
                <p className="mt-6 text-sm text-[var(--ink-faint)]">
                  Aún no hay proyectos. Creá el primero con el formulario.
                </p>
              ) : (
                <ul className="mt-6 space-y-3">
                  {projects.map((project) => (
                    <li
                      key={project._id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--bg-section-glass)] p-4"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate text-sm font-bold text-[var(--ink-strong)]">
                          <span className="text-base">{project.image}</span>
                          {project.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-[var(--ink-faint)]">
                          {project.technologies.join(', ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(project._id)}
                        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl border border-red-400/30 text-red-300/80 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                        aria-label={`Eliminar ${project.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cambiar contraseña */}
            <form
              onSubmit={handleChangePassword}
              className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6 md:p-8 shadow-xl"
            >
              <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--ink-strong)]">
                <KeyRound size={18} className="text-[var(--accent)]" />
                Cambiar contraseña
              </h2>
              <p className="mt-2 text-xs text-[var(--ink-faint)]">
                Se guarda hasheada en la base de datos. Las sesiones ya
                abiertas siguen válidas hasta que expiren.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Contraseña actual *</label>
                  <input
                    type="password"
                    value={pwForm.current}
                    onChange={(e) =>
                      setPwForm((prev) => ({ ...prev, current: e.target.value }))
                    }
                    required
                    autoComplete="current-password"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Nueva contraseña *</label>
                  <input
                    type="password"
                    value={pwForm.next}
                    onChange={(e) =>
                      setPwForm((prev) => ({ ...prev, next: e.target.value }))
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Repetir nueva *</label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) =>
                      setPwForm((prev) => ({ ...prev, confirm: e.target.value }))
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="mt-6 inline-flex items-center gap-2 py-3 px-6 rounded-full font-bold text-black bg-accent hover:bg-accent-strong transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <KeyRound size={16} />
                {pwLoading ? 'Guardando…' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
