/**
 * Verificación en navegador REAL contra el servidor local.
 * Genera capturas en /screenshots y un JSON con resultados.
 * No modifica datos ni envía correos.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3123';
const OUT = process.env.SCREENSHOT_DIR || join(process.cwd(), 'screenshots');
mkdirSync(OUT, { recursive: true });

const results = [];
const consoleErrors = [];
let currentStep = 'inicio';

function record(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function run(name, fn) {
  currentStep = name;
  try {
    const detail = await fn();
    record(name, true, detail || '');
  } catch (err) {
    record(name, false, err.message);
  }
}

const browser = await chromium.launch({ headless: true });

// ---------------------------------------------------------------- escritorio
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
});
const page = await ctx.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(`[${currentStep}] ${m.text()}`);
});
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

await page.goto(`${BASE}/?lang=es`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(2500);

await run('home render + lang es', async () => {
  const h1 = await page.locator('h1').first().innerText();
  const lang = await page.locator('html').getAttribute('lang');
  if (!h1.includes('Lucio') || lang !== 'es') throw new Error(`h1="${h1}" lang=${lang}`);
  return `h1="${h1.slice(0, 40)}", lang=${lang}`;
});

await run('footer en el HTML inicial solo en la portada', async () => {
  for (const [path, expected] of [['/?lang=es', true], ['/?lang=en', true], ['/portfolio-digital', false]]) {
    const response = await page.request.get(`${BASE}${path}`);
    if (!response.ok()) throw new Error(`${path}: HTTP ${response.status()}`);
    if (/<footer\b/.test(await response.text()) !== expected) {
      throw new Error(`${path}: se esperaba el footer ${expected ? 'presente' : 'ausente'} antes de hidratar`);
    }
  }
  return 'portada ES/EN con footer SSR y galería sin footer';
});

await run('portada: landmark, salto por teclado y habilidades sin duplicados', async () => {
  await page.reload({ waitUntil: 'domcontentloaded' });
  if (await page.getByRole('main').count() !== 1) throw new Error('Se esperaba un landmark main');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Saltar al contenido principal' });
  if (!(await skip.evaluate((element) => element === document.activeElement))) throw new Error('El primer Tab no enfoca el enlace de salto');
  await page.keyboard.press('Enter');
  if (!(await page.locator('main').evaluate((element) => element === document.activeElement))) throw new Error('El salto no enfocó main');
  if (await page.getByRole('heading', { name: /Lenguajes & Web/i }).count() !== 1) throw new Error('Hay una copia accesible del marquee');
  const pause = page.getByRole('button', { name: 'Pausar desplazamiento' });
  await pause.click();
  try {
    const marquee = page.locator('.skill-marquee .animate-marquee');
    if (await marquee.evaluate((element) => getComputedStyle(element).animationName) !== 'none') throw new Error('El marquee no se detuvo');
  } finally {
    await page.getByRole('button', { name: 'Reanudar desplazamiento' }).click();
  }
});

await run('sin overflow horizontal (desktop)', async () => {
  const r = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
  }));
  if (r.sw > r.iw + 1) throw new Error(`scrollWidth=${r.sw} > innerWidth=${r.iw}`);
  return `${r.sw}/${r.iw}`;
});

await run('navbar superior', async () => {
  const box = await page.locator('header').first().boundingBox();
  if (!box || box.y > 30) throw new Error(`y=${box?.y}`);
  return `y=${box.y.toFixed(1)}px`;
});

await run('proyectos destacados: jerarquía y orden', async () => {
  const r = await page.evaluate(() => {
    const sec = document.getElementById('proyectos');
    const h2 = sec.querySelector('h2');
    const desc = h2.nextElementSibling;
    const cards = [...sec.querySelectorAll('[data-card]')];
    const track = cards[0].parentElement;
    const talk = [...sec.querySelectorAll('h3')].at(-1);
    const top = (el) => el.getBoundingClientRect().top + scrollY;
    const bottom = (el) => el.getBoundingClientRect().bottom + scrollY;
    return {
      orderOk: bottom(h2) <= top(desc) && bottom(desc) <= top(track) && bottom(track) <= top(talk),
      titles: cards.slice(0, 2).map((c) => c.querySelector('h3').textContent.trim()),
      bottomGap: Math.round(top(sec.nextElementSibling) - bottom(sec)),
    };
  });
  if (!r.orderOk || !/UTAP/i.test(r.titles[0]) || !/Portfolio/i.test(r.titles[1]) || r.bottomGap > 32) {
    throw new Error(JSON.stringify(r));
  }
  await page.locator('#proyectos').screenshot({ caret: 'initial', path: join(OUT, 'verification-10-projects-desktop.png') });
  return `título→descripción→tarjetas→CTA, ${r.titles.join(' / ')}, gap=${r.bottomGap}px`;
});

await run('starfield + estrellas fugaces', async () => {
  const r = await page.evaluate(() => {
    const root = document.querySelector('[data-starfield]');
    const decor = [...root.querySelectorAll('[data-motion-decorative]')]
      .filter((e) => e.className.includes('w-24'));
    return {
      stars: Number(root.dataset.starCount),
      layers: root.querySelectorAll('[data-star-layer]').length,
      shooting: decor.length,
      anim: getComputedStyle(root.querySelector('[data-star-layer]')).animationName,
      details: decor.map((e) => {
        const s = getComputedStyle(e);
        return {
          name: s.animationName,
          fill: s.animationFillMode,
          opacity: +(+s.opacity).toFixed(2),
          angle: parseFloat(s.rotate),
        };
      }),
    };
  });
  // Dos fugaces como máximo. `fill-mode: both` evita la línea horizontal
  // estática durante el delay; la rotación -35° da la diagonal natural.
  if (
    r.stars < 72 || r.layers > 8 || r.shooting < 1 || r.shooting > 2 ||
    !r.anim.includes('star-') ||
    r.details.some((d) => d.name !== 'shoot' || d.fill !== 'both' || d.angle !== -35)
  ) throw new Error(JSON.stringify(r));
  return `${r.stars} estrellas, ${r.shooting} fugaces, fill=both, diagonal=-35deg`;
});

await run('marquee continuo', async () => {
  const anim = await page.locator('.animate-marquee').first().evaluate(
    (el) => getComputedStyle(el).animationName
  );
  if (!anim.includes('marquee')) throw new Error(`animationName=${anim}`);
  return anim;
});

await page.screenshot({ caret: 'initial', path: join(OUT, 'verification-01-home-es.png'), fullPage: false });

await run('transición de página al navegar por Link', async () => {
  await page.goto(`${BASE}/?lang=es`, { waitUntil: 'load' });
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/proyectos'),
    page.getByRole('link', { name: 'Ver mi trabajo', exact: true }).click(),
  ]);
  const anim = await page.locator('.page-transition').first().evaluate(
    (el) => getComputedStyle(el).animationName
  );
  if (!anim.includes('page-enter')) throw new Error(`animationName=${anim}`);
  return anim;
});

await run('detalle UTAP: descripción ES y EN', async () => {
  const sitemap = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
  const ids = [...sitemap.matchAll(/\/proyectos\/([a-zA-Z0-9]+)/g)].map((m) => m[1]);
  let url = '';
  for (const id of ids) {
    await page.goto(`${BASE}/proyectos/${id}?lang=es`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const title = await page.locator('h1').first().innerText();
    if (/UTAP/i.test(title)) {
      url = `${BASE}/proyectos/${id}`;
      break;
    }
  }
  if (!url) throw new Error(`UTAP no encontrado en sitemap (${ids.length} ids)`);
  const esText = await page.locator('p.max-w-3xl').first().innerText();
  if (!esText.includes('hamburguesería')) throw new Error(`ES="${esText.slice(0, 80)}"`);
  await page.goto(`${url}?lang=en`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const enText = await page.locator('p.max-w-3xl').first().innerText();
  const meta = await page.locator('meta[name="description"]').getAttribute('content');
  if (!enText.includes('burger restaurant') || !meta?.includes('burger restaurant')) {
    throw new Error(`EN="${enText.slice(0, 80)}" meta="${meta?.slice(0, 80)}"`);
  }
  return `ES ok / EN ok / meta ok (${url})`;
});

await run('cambio de idioma desde el switch', async () => {
  await page.goto(`${BASE}/?lang=es`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.locator('header button[aria-pressed]:visible').filter({ hasText: /^en$/i }).first().click();
  await page.waitForTimeout(500);
  const lang = await page.locator('html').getAttribute('lang');
  const nav = await page.locator('header').first().innerText();
  if (lang !== 'en' || !/Services|Projects/i.test(nav)) throw new Error(`lang=${lang} nav=${nav.slice(0, 60)}`);
  await page.screenshot({ caret: 'initial', path: join(OUT, 'verification-02-home-en.png'), fullPage: false });
  return `lang=${lang}, nav EN detectado`;
});

await run('tema claro', async () => {
  await page.getByRole('button', { name: 'Change theme' }).first().click();
  await page.waitForTimeout(500);
  const cls = await page.locator('html').getAttribute('class');
  if (!cls.includes('light')) throw new Error(`class=${cls}`);
  await page.screenshot({ caret: 'initial', path: join(OUT, 'verification-03-light-theme.png'), fullPage: false });
  return 'html.light activo';
});

await run('modo IA y vuelta a WEB', async () => {
  await page.getByRole('button', { name: 'AI', exact: true }).first().click();
  await page.waitForTimeout(500);
  const iaVisible = await page.getByText(/## Inteligencia artificial|## Artificial intelligence/).first().isVisible();
  if (!iaVisible) throw new Error('Vista IA no visible');
  await page.screenshot({ caret: 'initial', path: join(OUT, 'verification-04-ia-mode.png'), fullPage: false });
  await page.getByRole('button', { name: 'WEB', exact: true }).first().click();
  await page.waitForTimeout(400);
  return 'IA visible y WEB restaurado';
});

await run('teclado: menús de CV, flechas y retorno de foco', async () => {
  const hasFocus = (locator) => locator.evaluate((element) => element === document.activeElement);
  for (const label of [/^CV$/, /CV de edición/i]) {
    await page.goto(`${BASE}/?lang=es`, { waitUntil: 'load' });
    const button = page.getByRole('button', { name: label });
    await button.scrollIntoViewIfNeeded();
    await button.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    const first = menu.getByRole('menuitem').first();
    const last = menu.getByRole('menuitem').last();
    await first.waitFor();
    if (!(await hasFocus(first))) throw new Error(`${label}: foco inicial incorrecto`);
    await page.keyboard.press('ArrowDown');
    if (!(await hasFocus(last))) throw new Error(`${label}: ArrowDown no avanzó y aria-expanded quedó en ${await button.getAttribute('aria-expanded')}`);
    await page.keyboard.press('ArrowUp');
    if (!(await hasFocus(first))) throw new Error(`${label}: ArrowUp no volvió`);
    await page.keyboard.press('Escape');
    if (await button.getAttribute('aria-expanded') !== 'false' || !(await hasFocus(button))) {
      throw new Error(`${label}: Escape no cerró devolviendo el foco`);
    }
    await menu.waitFor({ state: 'hidden' });
  }
});

await run('descarga de los 4 CV', async () => {
  // Cada descarga arranca de una página limpia: evita estados intermedios
  // del menú portal al encadenar clics en modo dev.
  const files = [
    ['/CV_Desarrollo_ES.pdf', /^CV$/],
    ['/CV_Development_EN.pdf', /^CV$/],
    ['/CV_Edicion_ES.pdf', /CV de edición/i],
    ['/CV_Editing_EN.pdf', /CV de edición/i],
  ];
  for (const [href, label] of files) {
    let downloaded = null;
    // El menú usa un portal y se animations: en contadas ocasiones el click
    // cae durante una transición. Reintentamos desde una página limpia.
    for (let attempt = 1; attempt <= 3 && !downloaded; attempt++) {
      await page.goto(`${BASE}/?lang=es`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1400);
      const button = page.locator('button[aria-expanded]:visible').filter({ hasText: label }).first();
      await button.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await button.click();
      const link = page.locator(`a[role="menuitem"][href="${href}"]`);
      await link.waitFor({ state: 'visible', timeout: 8000 });
      try {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 12000 }),
          link.click(),
        ]);
        downloaded = download;
      } catch (err) {
        if (attempt === 3) throw err;
      }
    }
    if (downloaded.suggestedFilename() !== href.slice(1)) {
      throw new Error(`${href} → ${downloaded.suggestedFilename()}`);
    }
  }
  return '4/4 nombres correctos';
});

// ------------------------------------------------------------ portafolio AV
await run('portafolio AV: 12 tarjetas, miniaturas y uniformidad', async () => {
  await page.goto(`${BASE}/portfolio-digital?lang=es`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  const cards = page.locator('button[aria-label^="Reproducir"]');
  const count = await cards.count();
  if (count !== 12) throw new Error(`count=${count}`);
  const info = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('button[aria-label^="Reproducir"]')];
    const ratios = cards.map((c) => {
      const box = c.querySelector('div[style*="aspect-ratio"]')?.getBoundingClientRect();
      return box ? +(box.width / box.height).toFixed(3) : null;
    });
    const imgs = [...document.querySelectorAll('img[alt][loading="lazy"]')];
    return {
      ratios,
      loaded: imgs.filter((i) => i.naturalWidth > 0).length,
      imgs: imgs.length,
    };
  });
  if (info.loaded < 12) throw new Error(`miniaturas cargadas=${info.loaded}/${info.imgs}`);
  if (info.ratios.some((r) => r === null || Math.abs(r - 0.5625) > 0.02)) {
    throw new Error(`ratios=${JSON.stringify(info.ratios)}`);
  }
  await page.screenshot({ caret: 'initial', path: join(OUT, 'verification-05-av-grid.png'), fullPage: true });
  return `12 tarjetas, ${info.loaded} miniaturas, ratio 9:16 uniforme`;
});

await run('filtros de categoría', async () => {
  await page.getByRole('button', { name: 'Gaceta Play', exact: true }).press('Enter');
  await page.waitForTimeout(300);
  const gaceta = await page.locator('button[aria-label^="Reproducir"]').count();
  if (gaceta !== 3) throw new Error(`Gaceta=${gaceta}`);
  await page.getByRole('button', { name: 'Todos', exact: true }).click();
  await page.waitForTimeout(300);
  const all = await page.locator('button[aria-label^="Reproducir"]').count();
  if (all !== 12) throw new Error(`Todos=${all}`);
  return `Gaceta=3, Todos=12`;
});

await run('reproductor: apertura, enlace Drive y cierre', async () => {
  await page.locator('button[aria-label^="Reproducir"]').first().click();
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: 'visible' });
  const links = await dialog.locator('a[href*="drive.google.com"]').count();
  if (links < 1) throw new Error('sin enlace a Drive');
  await page.screenshot({ caret: 'initial', path: join(OUT, 'verification-06-av-player.png'), fullPage: false });
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  return `dialog ok, ${links} enlace(s) Drive, Escape cierra`;
});
await ctx.close();

// ------------------------------------------------------------------- móvil
const mctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
const mobile = await mctx.newPage();
mobile.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(`mobile [${currentStep}]: ${m.text()}`);
});
mobile.on('pageerror', (e) => consoleErrors.push(`mobile pageerror: ${e.message}`));
await mobile.goto(`${BASE}/?lang=es`, { waitUntil: 'domcontentloaded' });
await mobile.waitForTimeout(2200);

await run('móvil: navbar arriba, foto del Hero visible y sin overlap', async () => {
  const navBox = await mobile.locator('header').first().boundingBox();
  const photoBox = await mobile.locator('img[src*="profile"]').first().boundingBox();
  if (!navBox || navBox.y > 16) throw new Error(`nav y=${navBox?.y}`);
  if (!photoBox) throw new Error('sin foto de perfil');
  const overlap = photoBox.y < navBox.y + navBox.height;
  if (overlap) throw new Error(`foto y=${photoBox.y} < nav bottom=${navBox.y + navBox.height}`);
  await mobile.screenshot({ caret: 'initial', path: join(OUT, 'verification-07-mobile-hero.png'), fullPage: false });
  return `nav y=${navBox.y.toFixed(1)}, foto y=${photoBox.y.toFixed(1)}, sin solape`;
});

await run('móvil: proyectos destacados en orden', async () => {
  const r = await mobile.evaluate(() => {
    const sec = document.getElementById('proyectos');
    const h2 = sec.querySelector('h2');
    const cards = [...sec.querySelectorAll('[data-card]')];
    const talk = [...sec.querySelectorAll('h3')].at(-1);
    const top = (el) => el.getBoundingClientRect().top + scrollY;
    const bottom = (el) => el.getBoundingClientRect().bottom + scrollY;
    return {
      orderOk: bottom(h2) <= top(h2.nextElementSibling) &&
        bottom(h2.nextElementSibling) <= top(cards[0].parentElement) &&
        bottom(cards[0].parentElement) <= top(talk),
      cards: cards.length,
    };
  });
  if (!r.orderOk || r.cards < 2) throw new Error(JSON.stringify(r));
  await mobile.locator('#proyectos').screenshot({ caret: 'initial', path: join(OUT, 'verification-11-projects-mobile.png') });
  return 'título→descripción→tarjetas→CTA apilados';
});

await run('móvil: estrellas estables al abrir/cerrar menú', async () => {
  const before = await mobile.evaluate(() => {
    const el = document.querySelector('[data-starfield]');
    window.__starNode = el;
    return el.querySelectorAll('span').length;
  });
  await mobile.getByRole('button', { name: 'Menú de navegación' }).click();
  await mobile.waitForTimeout(350);
  const during = await mobile.evaluate(() => ({
    sameNode: document.querySelector('[data-starfield]') === window.__starNode,
    stars: document.querySelector('[data-starfield]').querySelectorAll('span').length,
  }));
  await mobile.screenshot({ caret: 'initial', path: join(OUT, 'verification-08-mobile-menu.png'), fullPage: false });
  await mobile.getByRole('button', { name: 'Menú de navegación' }).click();
  await mobile.waitForTimeout(350);
  const after = await mobile.evaluate(() => ({
    sameNode: document.querySelector('[data-starfield]') === window.__starNode,
    stars: document.querySelector('[data-starfield]').querySelectorAll('span').length,
  }));
  if (!during.sameNode || !after.sameNode || before !== during.stars || during.stars !== after.stars) {
    throw new Error(`starfield: ${before}/${during.stars}/${after.stars}, same=${during.sameNode}/${after.sameNode}`);
  }
  return `mismo nodo y ${before} estrellas antes/durante/después`;
});

await run('móvil: anclas', async () => {
  const toggle = mobile.getByRole('button', { name: 'Menú de navegación' });
  const anchor = mobile.locator('header a[href="/#servicios"]:visible');
  // El menú se anima; si un click cae durante la transición puede no
  // registrar el estado. Reintentamos hasta que el ancla sea visible.
  for (let i = 0; i < 4 && (await anchor.count()) === 0; i++) {
    if ((await toggle.getAttribute('aria-expanded')) === 'true') {
      await toggle.click();
      await mobile.waitForTimeout(300);
    }
    await toggle.click();
    await mobile.waitForTimeout(400);
  }
  await anchor.waitFor({ state: 'visible', timeout: 8000 });
  await anchor.click();
  await mobile.waitForTimeout(1200);
  const r = await mobile.evaluate(() => ({
    hash: location.hash,
    y: Math.round(window.scrollY),
    top: Math.round(document.getElementById('servicios')?.getBoundingClientRect().top ?? 9999),
  }));
  if (r.hash !== '#servicios' || r.y < 100 || Math.abs(r.top) > 140) throw new Error(JSON.stringify(r));
  return `hash=${r.hash}, scrollY=${r.y}, target top=${r.top}`;
});

await run('móvil: Escape cierra el menú y devuelve el foco', async () => {
  const toggle = mobile.getByRole('button', { name: 'Menú de navegación' });
  await toggle.focus();
  await mobile.keyboard.press('Enter');
  await mobile.getByRole('navigation', { name: 'Navegación móvil' }).waitFor();
  await mobile.keyboard.press('Escape');
  if (await toggle.getAttribute('aria-expanded') !== 'false') throw new Error('El menú sigue abierto');
  if (!(await toggle.evaluate((element) => element === document.activeElement))) throw new Error('No se restituyó el foco');
});

await run('móvil: sin overflow', async () => {
  const r = await mobile.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
  }));
  if (r.sw > r.iw + 1) throw new Error(`${r.sw}/${r.iw}`);
  return `${r.sw}/${r.iw}`;
});
await mctx.close();

// ------------------------------------------------------- prefers-reduced-motion
const rctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  reducedMotion: 'reduce',
});
const reduced = await rctx.newPage();
reduced.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(`reduced: ${m.text()}`);
});
reduced.on('pageerror', (e) => consoleErrors.push(`reduced pageerror: ${e.message}`));
await reduced.goto(`${BASE}/?lang=es`, { waitUntil: 'domcontentloaded' });
await reduced.waitForTimeout(1500);
await run('prefers-reduced-motion', async () => {
  const r = await reduced.evaluate(() => ({
    marquee: getComputedStyle(document.querySelector('.animate-marquee')).animationName,
    page: getComputedStyle(document.querySelector('.page-transition')).animationName,
    shooting: getComputedStyle(document.querySelector('[data-motion-decorative]')).display,
    fade: getComputedStyle(document.querySelector('.fade-in-up')).opacity,
  }));
  if (r.marquee !== 'none' || r.page !== 'none' || r.shooting !== 'none' || r.fade !== '1') {
    throw new Error(JSON.stringify(r));
  }
  await reduced.screenshot({ caret: 'initial', path: join(OUT, 'verification-09-reduced-motion.png'), fullPage: false });
  return `marquee=${r.marquee}, page=${r.page}, fugaces=${r.shooting}, fade=${r.fade}`;
});
await rctx.close();

await run('consola sin errores / hidratación', async () => {
  const bad = consoleErrors.filter((e) => /hydrat|error|warn/i.test(e));
  if (bad.length) throw new Error(bad.slice(0, 4).join(' | '));
  return `${consoleErrors.length} errores capturados`;
});

await browser.close();
writeFileSync(
  join(OUT, 'verification-results.json'),
  JSON.stringify({ base: BASE, date: new Date().toISOString(), results, consoleErrors }, null, 2)
);
const failed = results.filter((r) => !r.ok);
console.log(`\nRESULTADO: ${results.length - failed.length}/${results.length} OK`);
if (failed.length) process.exitCode = 1;
