# Lucio Ingargiola — Portfolio

Portfolio personal desarrollado con **Next.js 16** (App Router), **React 19**, **Tailwind CSS v4** y **MongoDB (Mongoose)**. Incluye dos "modos" de visualización, selector de idioma (ES/EN), modo oscuro/claro, sistema de acceso admin y un formulario de contacto simulado.

---

## Stack

| Tecnología | Uso |
| --- | --- |
| **Next.js 16.2** | Framework (App Router, Server Components, API Routes) |
| **React 19** | UI y estado (hooks, context) |
| **Tailwind CSS v4** | Estilos (importado vía PostCSS, tema con `@theme`) |
| **MongoDB + Mongoose** | Base de datos y modelo `Project` |
| **framer-motion** | Animaciones de entrada (fade-in, stagger) |
| **lucide-react** | Íconos de interfaz |
| **react-icons** | Íconos de marcas/tecnologías |

> ⚠️ **Atención:** este proyecto usa una versión de Next.js con breaking changes respecto a versiones anteriores. Antes de tocar código, consultá la documentación local en `node_modules/next/dist/docs/`.

---

## Comandos

```bash
npm install     # instala dependencias
npm run dev     # servidor de desarrollo (http://localhost:3000)
npm run build   # compila para producción
npm run start   # sirve la build de producción
npm run seed    # siembra MongoDB con proyectos de ejemplo
```

---

## Variables de entorno

Creá un archivo `.env.local` en la raíz:

```
MONGODB_URI=mongodb://localhost:27017/lucio-portfolio
ADMIN_PASSWORD=una-contraseña-fuerte-y-larga
AUTH_SECRET=un-secreto-aleatorio-para-firmar-sesiones
```

| Variable | Descripción |
| --- | --- |
| `MONGODB_URI` | URI de conexión a MongoDB |
| `ADMIN_PASSWORD` | Contraseña del panel privado (se compara en el servidor, en tiempo constante) |
| `AUTH_SECRET` | Secreto con el que se firman las sesiones (cookie HttpOnly); si cambia, se invalidan las sesiones activas |

> 🔒 **Seguridad:** el panel de administración es privado y no está documentado en este README. `.env.local` está en `.gitignore`, así que no se sube al repositorio.

---

## Estructura del proyecto

```
lucio-portfolio/
├── app/
│   ├── admin/                  → Panel de administración privado
│   │   ├── page.js             →   wrapper con metadata (noindex)
│   │   └── AdminPanel.js       →   login + crear/eliminar proyectos
│   ├── api/
│   │   └── admin/
│   │       ├── verify/route.js     → login (valida ADMIN_PASSWORD + rate limit)
│   │       ├── me/route.js         → ¿sesión válida?
│   │       ├── logout/route.js     → borra la cookie de sesión
│   │       └── projects/route.js   → GET/POST/DELETE de proyectos
│   ├── components/             → todos los componentes de UI
│   ├── context/                → contextos globales
│   │   ├── ModeContext.js      →   modo WEB / IA
│   │   ├── ThemeProvider.js    →   tema oscuro / claro
│   │   └── LanguageContext.js  →   idioma ES / EN
│   ├── globals.css             → estilos globales, variables y animaciones
│   ├── layout.js               → raíz (fonts, metadata, providers)
│   ├── page.js                 → página de inicio (hero + secciones)
│   ├── projects/page.js        → página /projects (lista completa)
│   └── portfolio-digital/page.js → placeholder (ComingSoon)
├── lib/
│   ├── mongodb.js              → conexión a MongoDB (con cache)
│   ├── auth.js                 → sesiones firmadas + comparación en tiempo constante
│   └── rateLimit.js            → anti fuerza bruta (login)
├── models/
│   └── Project.js              → esquema Mongoose de los proyectos
├── scripts/
│   └── seed.js                 → borra e inserta proyectos de ejemplo
├── public/                     → estáticos (avatar, CV, favicons)
├── .env.local                  → variables de entorno (NO se sube)
├── jsconfig.json               → alias "@/*" → raíz
├── next.config.mjs             → configuración de Next.js
└── package.json                → scripts y dependencias
```

---

## Modos de visualización

El sitio tiene un **modo WEB** y un **modo IA**, que se alternan con el switch de la barra de navegación:

| Sección | Modo WEB | Modo IA |
| --- | --- | --- |
| Hero / skills / cómo trabajo | ✅ | — |
| Proyectos | ✅ | — |
| Marketing (CV) | ✅ | — |
| Contacto | ✅ | — |
| Vista "reclutador" (resumen en markdown, botón copiar) | — | ✅ |

## Idiomas

Seleccionable con el toggle **ES / EN** en la navbar. Las traducciones viven en `app/context/LanguageContext.js` y se persisten en `localStorage`.

## Tema

Toggle **🌙 / ☀️** en la navbar. El tema se guarda en `localStorage`, se aplica una clase `.light` al `<html>` y todas las variables de color están definidas en `app/globals.css`.

---

## Proyectos

Los proyectos se guardan en MongoDB con el siguiente modelo (`models/Project.js`):

- `title` — nombre
- `description` — qué hace
- `technologies` — array de tecnologías
- `githubUrl` — link al repo/portfolio
- `category` — `web` | `landing` | `marketing`
- `architecture` — cómo está armado
- `image` — emoji representativo

En la home se muestran en un carrusel 3D rotatorio y en `/projects` como tarjetas expandidas (zig-zag). Si MongoDB no está disponible, el sitio **no se rompe**: se muestra un estado vacío o los proyectos de ejemplo (`fallbackProjects`).

---

## Despliegue (Vercel)

El proyecto está pensado para desplegarse en [Vercel](https://vercel.com):

1. Importá el repositorio en Vercel.
2. Agregá las variables de entorno (`MONGODB_URI`, `ADMIN_PASSWORD`, `AUTH_SECRET`) en *Settings → Environment Variables*.
3. Deploy.

> Si MongoDB es local, no será accesible desde Vercel. Para producción conviene usar **MongoDB Atlas** (base en la nube) y apuntar `MONGODB_URI` a ese clúster.
