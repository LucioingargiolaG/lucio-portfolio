# Guía de despliegue — Vercel + MongoDB Atlas

Documento que junta toda la información necesaria para colgar el portfolio en **Vercel** usando **MongoDB Atlas** como base de datos en la nube.

---

## Concepto general

Tu proyecto tiene 3 partes que, en producción, viven en **3 lugares distintos**:

| Parte | En tu PC (desarrollo) | En producción |
| --- | --- | --- |
| El código/sitio (HTML, React, rutas) | `localhost:3000` | **Vercel** (servidores) |
| Los datos (proyectos del portfolio) | MongoDB en tu PC | **MongoDB Atlas** (nube) |
| Tus secretos (`ADMIN_PIN`, URI) | `.env.local` | Variables de entorno en Vercel |

En desarrollo los 3 están juntos en tu PC. Al desplegar se separan, y cada uno cumple su rol.

> **¿Necesito `localhost:3000`?**
> No. `localhost:3000` es solo tu máquina, para desarrollar. En Vercel el sitio corre en los servidores de ellos: compilan el proyecto (`npm run build`), lo hostean y te dan una URL pública (ej. `tu-sitio.vercel.app`). No tenés que dejar nada abierto en tu PC.

> **¿Y la base de datos?**
> El MongoDB local (`mongodb://localhost:27017`) no funciona en producción: Vercel no puede conectarse a tu computadora. Necesitás una base en la nube → **MongoDB Atlas** (plan free, 512 MB, alcanza de sobra para un portfolio).

> **¿Por qué Vercel?**
> Vercel es creado por el mismo equipo que desarrolla Next.js: es la integración oficial (adapter verificado) y la más simple para este proyecto.

---

## Qué es un CLUSTER

Un **cluster** es "un grupo de servidores que trabajan juntos". En MongoDB Atlas, al crear un cluster lo que hacés es **alquilar un grupo de computadoras (servidores) en la nube** donde se guarda tu base de datos.

- Tiene una URL única (la *connection string*) para conectarse desde cualquier parte del mundo.
- El plan **M0 Free** es un cluster chiquito y gratis: un solo servidor, 512 MB.
- Tu base de datos **no vive en tu PC** — vive en los servidores de Atlas, prendidos 24/7. Así Vercel puede leerla aunque tu computadora esté apagada.

---

## Glosario de los pasos

| Concepto | Qué es |
| --- | --- |
| **Cluster** | Grupo de servidores en la nube donde se guarda la base de datos. |
| **Connection string** | La "dirección" de tu base: `mongodb+srv://usuario:clave@cluster0....mongodb.net/lucio-portfolio`. |
| **Usuario y contraseña** | La llave de acceso a tu base. La elegís vos. |
| **IP `0.0.0.0/0`** | Permitir conexiones desde cualquier IP del mundo (necesario porque Vercel se conecta desde servidores variables). |
| **GitHub** | El depósito del código fuente. Vercel descarga el código desde acá. |
| **Importar en Vercel** | Vercel descarga tu repo, compila (`npm run build`) y sirve el resultado en una URL pública. |
| **Variables de entorno** | Secretos guardados en el servidor de Vercel. Reemplazan a tu `.env.local` en producción. |
| **Serverless function** | Cada ruta `/api/*` se convierte en un mini-programa que se enciende solo cuando alguien la llama. |

---

## Desglose de la connection string

```
mongodb+srv://admin:TUCLAVE@cluster0.xxxxx.mongodb.net/lucio-portfolio
   │        │      │         │                    └── nombre de la base
   │        │      │         └── dirección del cluster en la nube
   │        │      └── contraseña
   │        └── usuario
   └── protocolo de conexión a MongoDB
```

Esta string es lo que va a parar a la variable `MONGODB_URI`. Tu código la usa en `lib/mongodb.js` para conectarse.

---

## Pasos a seguir

### 1. Crear la base en MongoDB Atlas

1. Entrá a [mongodb.com/atlas](https://www.mongodb.com/atlas) → crear cuenta gratis.
2. Creá un cluster **M0 (Free)**.
3. En *Database Access* → creá un usuario con contraseña (ej. `admin` / una clave segura y larga).
4. En *Network Access* → agregá IP `0.0.0.0/0` (permitir desde cualquier lado).
5. En tu cluster → *Connect* → *Connect your application* → copiá la connection string:
   ```
   mongodb+srv://admin:TUCLAVE@cluster0.xxxxx.mongodb.net/lucio-portfolio?retryWrites=true&w=majority
   ```

### 2. Subir el código a GitHub

1. Creá un repo en github.com.
2. Subí el proyecto (el `.gitignore` ya excluye `.env.local`, así que tu PIN no se sube).

### 3. Conectar Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new) y creá cuenta (podés entrar con tu cuenta de GitHub).
2. Elegí **Import Git Repository** → seleccioná el repo `lucio-portfolio`.
3. Vercel detecta Next.js solo (no hay que tocar nada): build command `npm run build`, output `.next`, Framework **Next.js**.
4. Clic en **Deploy**. Tarda un par de minutos.

### 4. Configurar las variables de entorno (paso clave)

Después del deploy, en **Project → Settings → Environment Variables** → agregar:

```
MONGODB_URI = mongodb+srv://admin:TUCLAVE@cluster0.xxxxx.mongodb.net/lucio-portfolio
ADMIN_PIN   = <una clave fuerte y nueva>
```

Al agregarlas, Vercel te ofrece redeployear: aceptá (**Redeploy**). Esto reemplaza a tu `.env.local` local. **Importante:** elegí un PIN fuerte que no esté publicado en ningún lado.

### 5. Probar

1. Entrá a tu `tu-sitio.vercel.app` y verificá que carguen los proyectos.
2. Corré `npm run seed` desde tu PC **una sola vez** (con Atlas en tu `.env.local`) para sembrar datos, o creálos desde `/admin`.

---

## Cosas a tener en cuenta

- Las API routes (`/api/admin/*`) corren como **serverless functions** de Vercel: funcionan igual que en local, se encienden bajo demanda.
- Cada función serverless se conecta a MongoDB; `lib/mongodb.js` ya cachea la conexión con `globalThis`, así que está bien.
- Cada vez que hacés `git push` al repo, Vercel **redeployea solo**.
- Si querés tu propio dominio (ej. `lucio.com.ar`), se configura en **Project → Settings → Domains**.
- El plan gratuito de Atlas tiene 512 MB: suficiente para un portfolio.

---

## Flujo completo

```
Vos (creás proyectos en /admin)
   │  (HTTPS)
   ▼
Vercel ──(serverless function)──► MongoDB Atlas
   ▲                                  │
   │                                  ▼
Vos mirás el sitio en tu vercel.app    Datos guardados 24/7
```
