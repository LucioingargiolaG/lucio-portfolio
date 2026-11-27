/**
 * Verificación aislada de autenticación y rate limiting del panel admin.
 *
 * Uso:
 *   node --env-file=.env.local scripts/verify-admin-security.mjs
 *
 * Todas las escrituras van a una base de prueba derivada de MONGODB_URI
 * (nombre con timestamp + pid). Nunca se tocan projects ni admins reales.
 * La password se genera en memoria con crypto.randomBytes: no se imprime.
 */

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const results = [];
async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true });
    console.log(`OK   ${name}${detail ? ` — ${detail}` : ""}`);
  } catch (err) {
    results.push({ name, ok: false });
    console.error(`FAIL ${name} — ${err?.message || "error desconocido"}`);
  }
}

if (!process.env.MONGODB_URI) throw new Error("Falta MONGODB_URI");
if (!process.env.AUTH_SECRET) throw new Error("Falta AUTH_SECRET");

// MongoDB Atlas limita el nombre de DB a 38 bytes.
const testName = `sec-${Date.now().toString(36)}-${process.pid.toString(36)}`;
const sourceUri = new URL(process.env.MONGODB_URI);
const originalName = sourceUri.pathname.replace(/^\//, "").split("?")[0];
assert.ok(originalName, "No se pudo derivar el nombre de la base original");
assert.notEqual(testName, originalName);
sourceUri.pathname = `/${testName}`;
const testUri = sourceUri.toString();
process.env.MONGODB_URI = testUri;

const { connectToDatabase } = await import("../lib/mongodb.js");
const { default: LoginAttempt } = await import("../models/LoginAttempt.js");
const { default: Admin } = await import("../models/Admin.js");
const { hashPassword, verifyPassword } = await import("../lib/password.js");
const auth = await import("../lib/auth.js");
const rate = await import("../lib/rateLimit.js");

const conn = await connectToDatabase();
const db = conn.connection.db;
assert.equal(db.databaseName, testName, "La base de pruebas no es la aislada");
await db.dropDatabase();

const keyFor = (ip, scope) =>
  crypto
    .createHmac("sha256", process.env.AUTH_SECRET)
    .update(`admin-rate-limit:${scope}:${ip}`)
    .digest("hex");

const nowSeconds = () => Math.floor(Date.now() / 1000);
const makeToken = (iat) => {
  const exp = iat + 3600;
  const sig = crypto
    .createHmac("sha256", process.env.AUTH_SECRET)
    .update(`${iat}.${exp}`)
    .digest("hex");
  return `${iat}.${exp}.${sig}`;
};
const requestWithToken = (token) => ({
  cookies: { get: (name) => (name === auth.SESSION_COOKIE ? { value: token } : undefined) },
});

const unitPassword = crypto.randomBytes(24).toString("base64url");
const changedPassword = crypto.randomBytes(24).toString("base64url");

await check("token HMAC: válido, manipulado y expirado", () => {
  const now = nowSeconds();
  const valid = makeToken(now);
  assert.equal(auth.verifySessionToken(valid), true);
  const tampered = valid.slice(0, -1) + (valid.endsWith("0") ? "1" : "0");
  assert.equal(auth.verifySessionToken(tampered), false);
  assert.equal(auth.verifySessionToken(makeToken(now - 7200)), false);
  assert.equal(auth.verifySessionToken("no.es.un.token"), false);
  return "4 casos";
});

await check("credencial: hash scrypt y comparación", async () => {
  await Admin.create({
    passwordHash: hashPassword(unitPassword),
    passwordChangedAt: new Date(Date.now() - 60_000),
  });
  assert.equal(await auth.checkAdminPassword(unitPassword), true);
  assert.equal(await auth.checkAdminPassword("incorrecta".repeat(3)), false);
  return "2 casos";
});

await check("sesión: revocación por passwordChangedAt", async () => {
  const admin = await Admin.findOne({});
  const changedAtSeconds = Math.floor(admin.passwordChangedAt.getTime() / 1000);
  assert.equal(
    await auth.isAuthenticatedRequest(requestWithToken(makeToken(changedAtSeconds - 60))),
    false
  );
  assert.equal(
    await auth.isAuthenticatedRequest(requestWithToken(makeToken(changedAtSeconds + 60))),
    true
  );
  return "anterior=401, posterior=200";
});

await check("IP detrás de Vercel: headers de plataforma y suplantación", () => {
  const vercel = {
    headers: {
      get: (name) =>
        ({
          "x-vercel-id": "test",
          "x-vercel-forwarded-for": "203.0.113.10, 10.0.0.1",
          "x-forwarded-for": "198.51.100.99",
        })[name.toLowerCase()] ?? null,
    },
  };
  assert.equal(rate.getClientIp(vercel), "203.0.113.10");

  const local = {
    headers: {
      get: (name) => (name.toLowerCase() === "x-forwarded-for" ? "203.0.113.10" : null),
    },
  };
  assert.equal(rate.getClientIp(local), "local");

  const invalid = {
    headers: {
      get: (name) =>
        ({
          "x-vercel-id": "test",
          "x-vercel-forwarded-for": "unknown",
        })[name.toLowerCase()] ?? null,
    },
  };
  assert.throws(() => rate.getClientIp(invalid));
  return "3 casos";
});

await check("índices: único por clave y TTL automático", async () => {
  // La colección se materializa con el primer intento. syncIndexes() garantiza
  // que los índices existan aunque la base de prueba se haya dropeado antes.
  await rate.checkAttempt("203.0.113.1", "index-probe");
  await LoginAttempt.syncIndexes();
  const indexes = await LoginAttempt.collection.indexes();
  assert.ok(indexes.some((i) => i.key?.expiresAt === 1 && i.expireAfterSeconds === 0));
  assert.ok(indexes.some((i) => i.key?.key === 1 && i.unique === true));
  return "unique + TTL(0)";
});

await check("rate limit secuencial: 5 permitidos y bloqueo posterior", async () => {
  const ip = "198.51.100.10";
  const scope = "login-secuencial";
  for (let i = 1; i <= rate.MAX_ATTEMPTS; i += 1) {
    const result = await rate.checkAttempt(ip, scope);
    assert.equal(result.ok, true, `intento ${i} debió permitirse`);
  }
  const blocked = await rate.checkAttempt(ip, scope);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfterSeconds > 0);
  const stored = await LoginAttempt.findOne({ key: keyFor(ip, scope) });
  assert.equal(stored.count, rate.MAX_ATTEMPTS + 1);
  assert.equal(stored.blocked, true);
  assert.ok(!JSON.stringify(stored.key).includes(ip));
  return `bloqueo tras ${rate.MAX_ATTEMPTS}`;
});

await check("rate limit concurrente: 10 solicitudes simultáneas", async () => {
  const ip = "198.51.100.11";
  const scope = "login-concurrente";
  const results = await Promise.all(
    Array.from({ length: 10 }, () => rate.checkAttempt(ip, scope))
  );
  assert.equal(results.filter((r) => r.ok).length, rate.MAX_ATTEMPTS);
  assert.equal(results.filter((r) => !r.ok).length, 10 - rate.MAX_ATTEMPTS);
  return "5 permitidas / 5 bloqueadas";
});

await check("ventana expirada: contador se reinicia de forma atómica", async () => {
  const ip = "198.51.100.12";
  const scope = "login-ventana";
  await rate.checkAttempt(ip, scope);
  const stored = await LoginAttempt.findOne({ key: keyFor(ip, scope) });
  stored.firstAt = new Date(Date.now() - rate.WINDOW_MS - 5000);
  stored.count = rate.MAX_ATTEMPTS;
  stored.lockedUntil = null;
  stored.expiresAt = new Date(Date.now() + 600_000);
  await stored.save();
  const result = await rate.checkAttempt(ip, scope);
  assert.equal(result.ok, true);
  const fresh = await LoginAttempt.findOne({ key: keyFor(ip, scope) });
  assert.equal(fresh.count, 1);
  return "count=1";
});

await check("reset tras login: contador eliminado", async () => {
  const ip = "198.51.100.13";
  const scope = "login-reset";
  await rate.checkAttempt(ip, scope);
  assert.equal(await rate.resetAttempts(ip, scope), true);
  assert.equal(await LoginAttempt.countDocuments({ key: keyFor(ip, scope) }), 0);
  return "0 registros";
});

await check("actualización de password: revoca sesión anterior", async () => {
  await auth.updateAdminPassword(changedPassword);
  const admin = await Admin.findOne({});
  assert.ok(admin.passwordChangedAt);
  assert.equal(await auth.checkAdminPassword(changedPassword), true);
  assert.equal(await auth.checkAdminPassword(unitPassword), false);
  const changedAtSeconds = Math.floor(admin.passwordChangedAt.getTime() / 1000);
  assert.equal(
    await auth.isAuthenticatedRequest(requestWithToken(makeToken(changedAtSeconds - 2))),
    false
  );
  // Una cookie anterior sin precisión suficiente se invalida por seguridad.
  assert.equal(
    await auth.isAuthenticatedRequest(requestWithToken(makeToken(changedAtSeconds))),
    false
  );
  assert.equal(
    await auth.isAuthenticatedRequest(requestWithToken(makeToken(changedAtSeconds + 2))),
    true
  );
  const realNow = Date.now;
  const issueAt = (timestamp) => {
    Date.now = () => timestamp;
    try {
      return auth.createSession().value;
    } finally {
      Date.now = realNow;
    }
  };
  const changedAt = admin.passwordChangedAt.getTime();
  assert.equal(await auth.isAuthenticatedRequest(requestWithToken(issueAt(changedAt))), false);
  assert.equal(await auth.isAuthenticatedRequest(requestWithToken(issueAt(changedAt + 1))), true);
  return "emisión anterior o ambigua denegada, emisión posterior permitida";
});

await check("fail-closed: DB inaccesible en auth y rate limiter", () => {
  const code = `
    const rate = await import('./lib/rateLimit.js');
    const auth = await import('./lib/auth.js');
    const limit = await rate.checkAttempt('203.0.113.99', 'store-caido');
    const allowed = await auth.isAuthenticatedRequest({ cookies: { get: () => undefined } });
    if (limit.ok !== false || limit.reason !== 'store' || allowed !== false) process.exit(2);
  `;
  const child = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      MONGODB_URI: "mongodb://127.0.0.1:1/failclosed?serverSelectionTimeoutMS=300",
    },
    encoding: "utf8",
    timeout: 15_000,
  });
  assert.equal(child.status, 0);
  return "rate=denegado, auth=denegado";
});

// --- Integración HTTP contra un servidor Next efímero con la base aislada ---
const port = Number(process.env.TEST_PORT || 3187);
const base = `http://127.0.0.1:${port}`;
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const childEnv = { ...process.env, MONGODB_URI: testUri };
const server = spawn(process.execPath, [nextBin, "start", "--port", String(port)], {
  cwd: process.cwd(),
  env: childEnv,
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput += String(chunk); });
server.stderr.on("data", (chunk) => { serverOutput += String(chunk); });

async function waitForServer() {
  for (let i = 0; i < 80; i += 1) {
    if (server.exitCode !== null) throw new Error(`servidor terminó: ${serverOutput.slice(-300)}`);
    try {
      const res = await fetch(`${base}/api/admin/me`, { signal: AbortSignal.timeout(1000) });
      if (res.status === 401) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("timeout esperando al servidor de pruebas");
}

function jsonPost(path, body, { ip, cookie } = {}) {
  const headers = {
    "content-type": "application/json",
    "x-vercel-id": "test",
    "x-vercel-forwarded-for": ip,
  };
  if (cookie) headers.cookie = cookie;
  return fetch(`${base}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
}

function cookieFrom(res) {
  const all = res.headers.getSetCookie?.() ?? [res.headers.get("set-cookie")].filter(Boolean);
  return all.find((c) => c.startsWith("admin_session="))?.split(";")[0];
}

const httpNewPassword = crypto.randomBytes(24).toString("base64url");
let oldCookie;

try {
  await waitForServer();
  results.push({ name: "servidor aislado listo", ok: true });

  await check("HTTP /me sin cookie → 401", async () => {
    const res = await fetch(`${base}/api/admin/me`);
    assert.equal(res.status, 401);
    return "401";
  });

  await check("HTTP /verify: bloqueo tras intentos fallidos", async () => {
    const ip = "198.51.100.20";
    for (let i = 0; i < rate.MAX_ATTEMPTS; i += 1) {
      const res = await jsonPost("/api/admin/verify", { password: "incorrecta" }, { ip });
      assert.equal(res.status, 401);
    }
    const blocked = await jsonPost("/api/admin/verify", { password: "incorrecta" }, { ip });
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get("retry-after")) > 0);
    return `401 x${rate.MAX_ATTEMPTS} → 429`;
  });

  await check("HTTP /verify: login correcto y cookie de sesión", async () => {
    const res = await jsonPost(
      "/api/admin/verify",
      { password: changedPassword },
      { ip: "198.51.100.21" }
    );
    assert.equal(res.status, 200);
    oldCookie = cookieFrom(res);
    assert.ok(oldCookie);
    const me = await fetch(`${base}/api/admin/me`, { headers: { cookie: oldCookie } });
    assert.equal(me.status, 200);
    return "200 / me=200";
  });

  await check("HTTP /password: exige sesión y contraseña actual", async () => {
    const unauth = await jsonPost(
      "/api/admin/password",
      { currentPassword: changedPassword, newPassword: httpNewPassword },
      { ip: "198.51.100.22" }
    );
    assert.equal(unauth.status, 401);

    const wrong = await jsonPost(
      "/api/admin/password",
      { currentPassword: "incorrecta", newPassword: httpNewPassword },
      { ip: "198.51.100.22", cookie: oldCookie }
    );
    assert.equal(wrong.status, 400);
    return "401 / 400";
  });

  await check("HTTP /password: cambio válido invalida la sesión anterior", async () => {
    const res = await jsonPost(
      "/api/admin/password",
      { currentPassword: changedPassword, newPassword: httpNewPassword },
      { ip: "198.51.100.22", cookie: oldCookie }
    );
    assert.equal(res.status, 200);
    const oldMe = await fetch(`${base}/api/admin/me`, { headers: { cookie: oldCookie } });
    assert.equal(oldMe.status, 401);
    const oldProjects = await fetch(`${base}/api/admin/projects`, {
      headers: { cookie: oldCookie },
    });
    assert.equal(oldProjects.status, 401);
    return "cambio=200, sesión antigua=401";
  });

  await check("HTTP cambio persistió el hash en la base aislada", async () => {
    const admin = await Admin.findOne({});
    assert.equal(verifyPassword(httpNewPassword, admin.passwordHash), true);
    assert.ok(admin.passwordChangedAt);
    return "hash vigente";
  });

  await check("HTTP: login con la nueva password y acceso a /admin/projects", async () => {
    const login = await jsonPost(
      "/api/admin/verify",
      { password: httpNewPassword },
      { ip: "198.51.100.23" }
    );
    assert.equal(login.status, 200);
    const freshCookie = cookieFrom(login);
    assert.ok(freshCookie);
    const me = await fetch(`${base}/api/admin/me`, { headers: { cookie: freshCookie } });
    assert.equal(me.status, 200);
    const projects = await fetch(`${base}/api/admin/projects`, {
      headers: { cookie: freshCookie },
    });
    assert.equal(projects.status, 200);
    return "me=200, projects=200";
  });

  await check("HTTP /password: propio límite por IP (ámbito separado)", async () => {
    const ip = "198.51.100.24";
    for (let i = 0; i < rate.MAX_ATTEMPTS; i += 1) {
      const res = await jsonPost(
        "/api/admin/password",
        { currentPassword: "incorrecta", newPassword: httpNewPassword },
        { ip }
      );
      assert.ok([400, 401].includes(res.status));
    }
    const blocked = await jsonPost(
      "/api/admin/password",
      { currentPassword: "incorrecta", newPassword: httpNewPassword },
      { ip }
    );
    assert.equal(blocked.status, 429);

    const login = await jsonPost(
      "/api/admin/verify",
      { password: httpNewPassword },
      { ip }
    );
    assert.equal(login.status, 200);
    return "password=429, login=200 (ámbitos independientes)";
  });
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => setTimeout(resolve, 250));
  if (server.exitCode === null) server.kill("SIGKILL");
  await db.dropDatabase();
  await mongooseDisconnect();
}

async function mongooseDisconnect() {
  const mongoose = (await import("mongoose")).default;
  await mongoose.disconnect();
}

const failed = results.filter((r) => !r.ok);
console.log(
  JSON.stringify(
    {
      resumen: { total: results.length, ok: results.length - failed.length, fallidos: failed.length },
      fallos: failed.map((r) => r.name),
      base: "aislada (no se mostraron credenciales)",
    },
    null,
    2
  )
);
if (failed.length) process.exitCode = 1;
