/**
 * Acceso secreto al panel de administración.
 *
 * Cómo funciona (easter egg):
 *  1. Tecleá la palabra "admin" en cualquier parte de la página.
 *  2. Aparece un candado flotante arriba a la derecha (6 segundos).
 *  3. Al clickearlo, se abre un input de PIN que "emerge" de la foto de
 *     perfil (animación con framer-motion y posicionamiento calculado).
 *  4. Si el PIN es correcto (validado contra /api/admin/verify), te redirige
 *     a /admin.
 *
 * También maneja: botón atrás del navegador (history), Escape y click en un
 * link para cerrar el overlay.
 */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, LogIn } from 'lucide-react';

// Palabra secreta que hay que teclear para que aparezca el candado.
const SECRET = 'admin';
// Dimensiones de la tarjeta de login (para calcular posición).
const CARD_W = 380;
const CARD_H = 330;

export default function SecretAccess() {
  const router = useRouter();
  const [showLock, setShowLock] = useState(false); // ¿mostrar candado?
  const [open, setOpen] = useState(false); // ¿overlay de PIN abierto?
  const [pos, setPos] = useState(null); // posición y punto de origen
  const [pin, setPin] = useState(''); // texto del input
  const [loading, setLoading] = useState(false); // verificando PIN
  const [error, setError] = useState(null); // mensaje de error

  const bufferRef = useRef(''); // buffer de teclas para detectar "admin"
  const lockTimerRef = useRef(null); // timer que oculta el candado
  const idleTimerRef = useRef(null); // timer que limpia el buffer si no se teclea
  const inputRef = useRef(null); // referencia al input (para focus)
  const historyPushedRef = useRef(false); // ¿se pusheó un estado al history?

  // Oculta el candado y limpia su timer.
  const hideLock = () => {
    setShowLock(false);
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  };

  // Cierra el overlay y deshace el pushState del history (para que el botón
  // atrás no deje la página "falsa").
  const closeOverlay = useCallback(() => {
    setOpen(false);
    setPin('');
    setError(null);
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      window.history.back();
    }
  }, []);

  // Calcula la posición final (al lado de la foto de perfil) y el punto de
  // origen (centro de la foto) para que el input "salga" de ahí.
  const openOverlay = useCallback(() => {
    hideLock();
    // Posición por defecto (arriba a la derecha).
    let left = Math.max(16, window.innerWidth - CARD_W - 16);
    let top = 120;
    let cx = window.innerWidth / 2; // centro del origen de la animación
    let cy = 160;

    // Si existe el avatar (#profile-avatar), el overlay aparece al lado
    // y la animación arranca desde el centro de la foto.
    const avatar = document.getElementById('profile-avatar');
    if (avatar) {
      const r = avatar.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      left = r.right + 80;
      top = r.top;

      // Ajustes para que la tarjeta nunca quede fuera de la pantalla.
      if (left + CARD_W > window.innerWidth - 16) {
        left = window.innerWidth - CARD_W - 16;
      }
      if (top + CARD_H > window.innerHeight - 16) {
        top = window.innerHeight - CARD_H - 16;
      }
      if (top < 16) top = 16;
      if (left < 16) left = 16;
    }

    setPos({ left, top, cx, cy });
    // PushState para que el botón "atrás" cierre el overlay (ver onPopState).
    window.history.pushState({ secretOpen: true }, '');
    historyPushedRef.current = true;
    setOpen(true);
  }, []);

  // Listeners globales: detectar la palabra secreta, Escape, click en links.
  useEffect(() => {
    // Detector de tecleo: acumula caracteres y busca la palabra "admin".
    const onKeyDown = (e) => {
      const target = e.target;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      // Si el usuario está escribiendo en un input, no interferimos.
      if (isTyping) return;

      // Agregamos el caracter al buffer (máx. 20).
      bufferRef.current += e.key.toLowerCase();
      if (bufferRef.current.length > 20) {
        bufferRef.current = bufferRef.current.slice(-20);
      }

      // Si el buffer contiene "admin": mostramos el candado por 6 segundos.
      if (bufferRef.current.includes(SECRET)) {
        bufferRef.current = '';
        setShowLock(true);
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(hideLock, 6000);
      } else if (showLock) {
        hideLock();
      }

      // Limpia el buffer si el usuario deja de teclear 2.5s.
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        bufferRef.current = '';
      }, 2500);
    };

    // Escape cierra el overlay.
    const onKeyUp = (e) => {
      if (open && e.key === 'Escape') {
        closeOverlay();
      }
    };

    // Clickear un link cierra el overlay (para no dejar la tarjeta abierta).
    const onClick = (e) => {
      if (open && e.target.closest('a[href]')) {
        closeOverlay();
      }
    };

    // Botón "atrás" del navegador: cierra el overlay.
    const onPopState = () => {
      historyPushedRef.current = false;
      setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('popstate', onPopState);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', onClick);
      clearTimeout(idleTimerRef.current);
      clearTimeout(lockTimerRef.current);
    };
  }, [open, showLock, closeOverlay]);

  // Enfoca el input del PIN cuando se abre el overlay.
  useEffect(() => {
    if (open && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 450);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Verifica el PIN contra la API y, si es correcto, redirige a /admin.
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok) {
        // Guardamos el PIN en sessionStorage (vida útil = pestaña).
        sessionStorage.setItem('admin_pin', pin);
        setOpen(false);
        setPin('');
        setError(null);
        historyPushedRef.current = false;
        router.replace('/admin'); // reemplaza la URL (no deja el overlay en history)
      } else {
        setError(data.error ?? 'Código incorrecto');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Vector de "retorno": de dónde viene y a dónde vuelve la animación.
  // exitX/Y = distancia entre el centro de la tarjeta y el origen (foto).
  const exitX = pos ? pos.cx - (pos.left + CARD_W / 2) : 0;
  const exitY = pos ? pos.cy - (pos.top + CARD_H / 2) : 0;

  return (
    <>
      {/* Candado flotante */}
      <AnimatePresence>
        {showLock && !open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 right-6 z-40"
          >
            <button
              type="button"
              onClick={openOverlay}
              aria-label="Acceso privado"
              title="…"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-accent-30 bg-[var(--bg-card)] text-[var(--accent)] shadow-accent-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-accent-xl cursor-pointer"
            >
              <Lock size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input de verificación que emerge de la foto de perfil */}
      <AnimatePresence>
        {open && pos && (
          <motion.div
            key="admin-card"
            initial={{ opacity: 0, scale: 0.2, x: exitX, y: exitY }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.2, x: exitX, y: exitY }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              width: CARD_W,
              maxWidth: 'calc(100vw - 2rem)',
              zIndex: 40,
            }}
            className="pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Acceso privado"
          >
            <form
              onSubmit={handleLogin}
              className="w-full rounded-2xl border border-accent-30 bg-[var(--bg-card)] p-8 shadow-2xl shadow-black/50"
            >
              <div className="flex items-start justify-between">
                {/* Ícono de candado */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-10 text-[var(--accent)]">
                  <Lock size={26} />
                </div>
                {/* Botón cerrar */}
                <button
                  type="button"
                  onClick={closeOverlay}
                  aria-label="Cerrar"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[var(--ink-faint)] hover:text-[var(--ink-strong)] hover:bg-[var(--bg-glass)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 mt-6 text-[var(--ink-soft)]">
                Código de acceso
              </label>
              <input
                ref={inputRef}
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                autoFocus
                placeholder="Ingresá tu código"
                className="w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg-section-glass)] text-sm text-[var(--ink-strong)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-accent transition-colors"
              />

              {/* Error de PIN incorrecto */}
              {error && <p className="mt-3 text-sm font-medium text-red-300">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 py-3.5 rounded-full font-bold text-black bg-accent hover:bg-accent-strong transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                <LogIn size={16} />
                {loading ? 'Verificando…' : 'Ingresar'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
