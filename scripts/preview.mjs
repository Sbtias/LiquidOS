// ============================================================
// LiquidOS — servidor de la vista previa
//
//   · Sirve la demo (preview/)
//   · /api/web        navegador real: descarga y sanea páginas
//   · /api/store/*    tienda real: catálogo Flathub y Flatpak
//   · /api/downloads  versiones publicadas en Supabase
//
// Solo escucha en 127.0.0.1. Uso: node scripts/preview.mjs [puerto]
// ============================================================
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const root = resolve(fileURLToPath(new URL('../preview', import.meta.url)));
const port = Number(process.argv[2] || 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

const UA =
  'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0 LiquidOS/1.0';

/* ============================================================
 * Utilidades HTTP
 * ============================================================ */

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  });
  res.end(body);
}

function readJson(req, limit = 64 * 1024) {
  return new Promise((resolvePromise, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > limit) {
        reject(new Error('Cuerpo de la petición demasiado grande'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolvePromise({});
      try {
        resolvePromise(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('JSON no válido'));
      }
    });
    req.on('error', reject);
  });
}

/* ============================================================
 * Navegador real: descarga con protecciones SSRF
 * ============================================================ */

const BLOCKED_SUFFIXES = [
  '.localhost', '.local', '.internal', '.home', '.lan', '.test', '.invalid',
  '.example', '.onion'
];

const V4_BLOCKS = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4]
];

function v4ToInt(ip) {
  return ip.split('.').reduce((acc, oct) => ((acc << 8) + Number(oct)) >>> 0, 0);
}

function isPublicV4(ip) {
  const n = v4ToInt(ip);
  return !V4_BLOCKS.some(([net, bits]) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (n & mask) === (v4ToInt(net) & mask);
  });
}

function isPublicIp(ip) {
  if (isIP(ip) === 4) return isPublicV4(ip);
  if (isIP(ip) !== 6) return false;
  const s = ip.toLowerCase().replace(/%.*$/, '');
  if (s === '::' || s === '::1') return false;
  if (s.startsWith('::ffff:')) {
    const mapped = s.slice(7);
    if (isIP(mapped) === 4) return isPublicV4(mapped);
  }
  if (/^f[cd]/.test(s)) return false;           // fc00::/7 (ULA)
  if (/^fe[89ab]/.test(s)) return false;        // fe80::/10
  if (/^ff/.test(s)) return false;              // multicast
  if (s.startsWith('2001:db8')) return false;   // documentación
  return true;
}

async function assertPublicUrl(input) {
  let u;
  try {
    u = input instanceof URL ? input : new URL(input);
  } catch {
    throw new Error('Dirección no válida');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Solo se permiten direcciones http y https');
  }
  if (u.username || u.password) throw new Error('La dirección no puede llevar credenciales');
  if (u.port && u.port !== '80' && u.port !== '443') {
    throw new Error('Solo se permiten los puertos 80 y 443');
  }
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host) throw new Error('Falta el nombre del servidor');
  if (host === 'localhost' || host === '0.0.0.0') {
    throw new Error('No se permite acceder a la red local');
  }
  if (BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new Error('No se permite acceder a la red local');
  }
  if (isIP(host)) {
    if (!isPublicIp(host)) throw new Error('No se permite acceder a direcciones privadas');
    return u;
  }
  if (!host.includes('.')) throw new Error('Nombre de servidor no válido');
  let addresses;
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error(`No se pudo resolver ${host}`);
  }
  if (!addresses.length) throw new Error(`No se pudo resolver ${host}`);
  // Nota: la comprobación y la conexión resuelven por separado. Para una
  // demo local es suficiente; un servidor público necesitaría fijar la IP.
  for (const a of addresses) {
    if (!isPublicIp(a.address)) {
      throw new Error('El servidor apunta a una dirección privada');
    }
  }
  return u;
}

async function readLimited(stream, limit) {
  const chunks = [];
  let total = 0;
  for await (const chunk of stream) {
    total += chunk.length;
    if (total > limit) throw new Error('La página es demasiado grande (máximo 4 MB)');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function fetchWithTimeout(url, ms = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      redirect: 'manual',
      signal: ctrl.signal,
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5',
        'accept-language': 'es-ES,es;q=0.9,en;q=0.7'
      }
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('El sitio tardó demasiado en responder');
    throw new Error(`No se pudo conectar: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }
}

function detectCharset(contentType, buffer) {
  const fromHeader = /charset\s*=\s*["']?([\w-]+)/i.exec(contentType || '');
  if (fromHeader && isValidCharset(fromHeader[1])) return fromHeader[1].toLowerCase();
  const head = buffer.subarray(0, 8192).toString('latin1');
  const meta = /<meta[^>]+charset\s*=\s*["']?([\w-]+)/i.exec(head);
  if (meta && isValidCharset(meta[1])) return meta[1].toLowerCase();
  return 'utf-8';
}

function isValidCharset(label) {
  try {
    new TextDecoder(label);
    return true;
  } catch {
    return false;
  }
}

async function fetchPage(rawUrl) {
  let current = await assertPublicUrl(rawUrl);
  for (let hop = 0; hop < 5; hop++) {
    const res = await fetchWithTimeout(current);
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) throw new Error(`Redirección sin destino (HTTP ${res.status})`);
      if (res.body) res.body.cancel().catch(() => {});
      current = await assertPublicUrl(new URL(loc, current));
      continue;
    }
    if (!res.ok) {
      if (res.body) res.body.cancel().catch(() => {});
      throw new Error(`El sitio respondió HTTP ${res.status}`);
    }
    const ctype = res.headers.get('content-type') || '';
    if (!/text\/html|application\/xhtml|text\/plain/i.test(ctype) && ctype) {
      if (res.body) res.body.cancel().catch(() => {});
      throw new Error(`Esa dirección no es una página web (${ctype.split(';')[0]})`);
    }
    const buffer = await readLimited(res.body, 4 * 1024 * 1024);
    const charset = detectCharset(ctype, buffer);
    let html;
    try {
      html = new TextDecoder(charset).decode(buffer);
    } catch {
      html = new TextDecoder('utf-8').decode(buffer);
    }
    return { html, finalUrl: current.href, contentType: ctype };
  }
  throw new Error('Demasiadas redirecciones');
}

/* ------------------------- Saneado de HTML ------------------------- */

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function decodeEntities(text) {
  return String(text)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function htmlTitle(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m ? decodeEntities(m[1].replace(/\s+/g, ' ').trim()).slice(0, 160) : '';
}

const BRIDGE = `
<style>
  img, video, canvas, svg { max-width: 100%; }
  body { overflow-wrap: break-word; }
</style>
<script>
(function () {
  function send(msg) {
    try { parent.postMessage(msg, '*'); } catch (e) {}
  }
  function absolute(url) {
    try { return new URL(url, document.baseURI).href; } catch (e) { return null; }
  }
  function intercept(event) {
    var el = event.target;
    if (!el || !el.closest) return;
    var a = el.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#' || /^javascript:/i.test(href)) return;
    var url = absolute(a.href);
    if (!url) return;
    event.preventDefault();
    event.stopPropagation();
    // Solo se navega a http(s); data:, file:, javascript:* se bloquean.
    if (!/^https?:/i.test(url)) {
      send({ type: 'liquidos:notice', text: 'Ese enlace no se puede abrir en la vista previa.' });
      return;
    }
    send({ type: 'liquidos:navigate', url: url });
  }
  document.addEventListener('click', intercept, true);
  function handleForm(form) {
    var method = (form.getAttribute('method') || 'get').toLowerCase();
    if (method !== 'get') {
      send({ type: 'liquidos:notice', text: 'Este formulario usa POST y no está disponible en la vista previa.' });
      return;
    }
    var url = absolute(form.getAttribute('action') || document.baseURI);
    if (!url) return;
    var target = new URL(url);
    try {
      new FormData(form).forEach(function (value, key) {
        target.searchParams.append(key, String(value));
      });
    } catch (e) {}
    send({ type: 'liquidos:navigate', url: target.href });
  }
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM') return;
    event.preventDefault();
    event.stopPropagation();
    handleForm(form);
  }, true);
  try {
    var nativeSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () { handleForm(this); };
    void nativeSubmit;
  } catch (e) {}
  function announceTitle() {
    send({ type: 'liquidos:title', title: document.title || location.host });
  }
  if (document.readyState === 'complete') announceTitle();
  window.addEventListener('load', announceTitle);
  setTimeout(announceTitle, 600);
})();
</script>`;

function sanitizeHtml(rawHtml, baseUrl, title) {
  let html = rawHtml;

  // 1. Quitar elementos que pueden ejecutar código o romper el marco.
  html = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<script\b[^>]*\/?>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, '')
    .replace(/<iframe\b[^>]*\/?>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object\s*>/gi, '')
    .replace(/<object\b[^>]*\/?>/gi, '')
    .replace(/<embed\b[^>]*\/?>/gi, '')
    .replace(/<applet\b[^>]*>[\s\S]*?<\/applet\s*>/gi, '')
    .replace(/<frame\b[^>]*\/?>/gi, '')
    .replace(/<frameset\b[^>]*>[\s\S]*?<\/frameset\s*>/gi, '')
    .replace(/<template\b[^>]*>[\s\S]*?<\/template\s*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, (tag) =>
      /http-equiv\s*=\s*["']?(?:refresh|content-security-policy)/i.test(tag) ? '' : tag)
    .replace(/<base\b[^>]*>/gi, '');

  // 2. Quitar manejadores de eventos y URLs javascript:.
  html = html
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(srcdoc)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src|action)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, ' $1="#"')
    .replace(/\s(href|src|action)\s*=\s*javascript:[^\s>]+/gi, ' $1="#"');

  // 3. Enlaces de resultados de DuckDuckGo → destino real.
  html = html.replace(
    /href=(["'])(?:https?:)?\/\/(?:html\.)?duckduckgo\.com\/l\/\?uddg=([^"'&]+)[^"']*\1/gi,
    (match, quote, encoded) => {
      try {
        return `href=${quote}${decodeEntities(decodeURIComponent(encoded))}${quote}`;
      } catch {
        return match;
      }
    }
  );

  // 4. Base, viewport y puente de navegación.
  const headInject =
    `<base href="${escapeAttr(baseUrl)}">` +
    '<meta name="referrer" content="no-referrer">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">';

  if (/<head\b[^>]*>/i.test(html)) {
    html = html.replace(/<head\b([^>]*)>/i, (m, attrs) => `<head${attrs}>${headInject}`);
  } else if (/<html\b[^>]*>/i.test(html)) {
    html = html.replace(/<html\b([^>]*)>/i, (m, attrs) => `<html${attrs}><head>${headInject}</head>`);
  } else {
    html = `<head>${headInject}</head>${html}`;
  }

  if (/<\/body\s*>/i.test(html)) {
    html = html.replace(/<\/body\s*>/i, `${BRIDGE}</body>`);
  } else {
    html += BRIDGE;
  }

  // 5. Título visible y color de fondo neutro si el sitio no define uno.
  void title;
  return html;
}

/* Cache sencilla de páginas (para atrás/adelante y recargas rápidas) */
const pageCache = new Map();
const PAGE_TTL = 3 * 60 * 1000;

function cacheGet(url) {
  const hit = pageCache.get(url);
  if (!hit) return null;
  if (Date.now() - hit.at > PAGE_TTL) {
    pageCache.delete(url);
    return null;
  }
  return hit;
}

function cacheSet(url, data) {
  pageCache.set(url, { ...data, at: Date.now() });
  while (pageCache.size > 20) {
    pageCache.delete(pageCache.keys().next().value);
  }
}

/* ============================================================
 * Tienda real: Flathub + Flatpak
 * ============================================================ */

const store = {
  checked: 0,
  available: false,
  version: '',
  remotes: [],
  flathub: false,
  lastRemoteTry: 0
};

const flathubCache = new Map();
const jobs = new Map();
const APP_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{2,254}$/;

function detectFlatpak(force = false) {
  if (!force && Date.now() - store.checked < 15000) return store;
  store.checked = Date.now();
  const r = spawnSync('flatpak', ['--version'], { encoding: 'utf8', timeout: 8000 });
  store.available = !r.error && r.status === 0;
  store.version = store.available ? (r.stdout || '').trim() : '';
  store.remotes = [];
  if (store.available) {
    const rr = spawnSync('flatpak', ['remotes', '--columns=name,url,scope'], {
      encoding: 'utf8',
      timeout: 8000
    });
    if (!rr.error && rr.status === 0) {
      store.remotes = (rr.stdout || '')
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          const [name, url, scope] = line.split('\t');
          return { name, url, scope };
        });
    }
  }
  store.flathub = store.remotes.some((r) => r.name === 'flathub');
  return store;
}

function ensureFlathubRemote() {
  detectFlatpak(true);
  if (!store.available || store.flathub) return;
  if (Date.now() - store.lastRemoteTry < 60000) return;
  store.lastRemoteTry = Date.now();
  spawnSync(
    'flatpak',
    ['remote-add', '--user', '--if-not-exists', 'flathub',
      'https://dl.flathub.org/repo/flathub.flatpakrepo'],
    { encoding: 'utf8', timeout: 20000 }
  );
  detectFlatpak(true);
}

function scopeArgs() {
  const remotes = store.remotes;
  const user = remotes.some((r) => r.name === 'flathub' && r.scope === 'user');
  const system = remotes.some((r) => r.name === 'flathub' && r.scope === 'system');
  if (system && !user) return [];
  return ['--user'];
}

function parseLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => line.split('\t'));
}

function installedApps() {
  if (!store.available) return [];
  const r = spawnSync(
    'flatpak',
    ['list', '--app', '--columns=application,name,version,size,origin,installation'],
    { encoding: 'utf8', timeout: 15000 }
  );
  if (r.error || r.status !== 0) return [];
  return parseLines(r.stdout).map(([id, name, version, size, origin, installation]) => ({
    id,
    name: name || id,
    version: version || '',
    size: size || '',
    origin: origin || '',
    installation: installation || ''
  }));
}

function updatesAvailable() {
  if (!store.available) return [];
  const r = spawnSync(
    'flatpak',
    ['remote-ls', '--updates', '--columns=application,name,version,branch,origin'],
    { encoding: 'utf8', timeout: 25000 }
  );
  if (r.error || r.status !== 0) return [];
  const seen = new Set();
  return parseLines(r.stdout)
    .map(([id, name, version, branch, origin]) => ({
      id,
      name: name || id,
      version: version || '',
      branch: branch || '',
      origin: origin || ''
    }))
    .filter((app) => {
      if (!app.id || seen.has(app.id)) return false;
      seen.add(app.id);
      return true;
    });
}

function startJob(args, meta = {}) {
  const id = randomUUID();
  const job = {
    id,
    args,
    command: `flatpak ${args.join(' ')}`,
    state: 'running',
    output: '',
    code: null,
    started: Date.now(),
    ended: null
  };
  const child = spawn('flatpak', args, {
    env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' },
    windowsHide: true
  });
  let ended = false;
  const append = (chunk) => {
    job.output += chunk.toString();
    if (job.output.length > 20000) job.output = job.output.slice(-20000);
  };
  child.stdout.on('data', append);
  child.stderr.on('data', append);
  child.on('error', (err) => {
    if (ended) return;
    ended = true;
    job.state = 'error';
    job.code = -1;
    job.output += `\n${err.message}`;
    job.ended = Date.now();
  });
  child.on('close', (code) => {
    if (ended) return;
    ended = true;
    job.state = code === 0 ? 'done' : 'error';
    job.code = code;
    job.ended = Date.now();
  });
  jobs.set(id, job);
  // Limpieza de trabajos antiguos.
  for (const [key, value] of jobs) {
    if (Date.now() - value.started > 60 * 60 * 1000) jobs.delete(key);
  }
  return job;
}

function jobJson(job) {
  return {
    ok: true,
    id: job.id,
    state: job.state,
    code: job.code,
    command: job.command,
    output: job.output.slice(-5000),
    started: job.started,
    ended: job.ended
  };
}

async function flathubSearch(query) {
  const q = query.trim().slice(0, 80);
  if (!q) return [];
  const key = q.toLowerCase();
  const cached = flathubCache.get(key);
  if (cached && Date.now() - cached.at < 5 * 60 * 1000) return cached.hits;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  let res;
  try {
    res = await fetch('https://flathub.org/api/v2/search', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', 'user-agent': UA },
      body: JSON.stringify({ query: q, page: 1, hitsPerPage: 24 })
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Flathub tardó demasiado en responder');
    throw new Error(`No se pudo consultar Flathub: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`Flathub respondió HTTP ${res.status}`);
  const data = await res.json();
  const hits = (data.hits || []).map((hit) => ({
    id: hit.app_id,
    name: hit.name || hit.app_id,
    summary: hit.summary || '',
    icon: hit.icon || '',
    developer: hit.developer_name || '',
    category: mapCategory(hit.main_categories),
    verified: Boolean(hit.verification_verified)
  }));
  flathubCache.set(key, { at: Date.now(), hits });
  return hits;
}

const CATEGORIES = {
  audio: 'Multimedia', video: 'Multimedia', audiovideo: 'Multimedia',
  'audio-video': 'Multimedia', graphics: 'Diseño',
  development: 'Desarrollo', utility: 'Utilidades', network: 'Internet',
  game: 'Juegos', office: 'Productividad', system: 'Sistema',
  education: 'Educación', science: 'Ciencia'
};

function mapCategory(value) {
  const key = String(value || '').toLowerCase().split(';')[0];
  return CATEGORIES[key] || 'Utilidades';
}

/* ============================================================
 * Descargas reales: registro público en Supabase
 *
 * Solo se lee la tabla public.liquidos_releases con la clave
 * publicable (segura de exponer). La escritura la hace únicamente
 * scripts/publicar-descarga.sh con la clave de servicio en CI.
 * ============================================================ */

const SUPABASE_URL = (
  process.env.LIQUIDOS_SUPABASE_URL || 'https://noeankaxfyqvgtkrulno.supabase.co'
).replace(/\/+$/, '');

const SUPABASE_KEY =
  process.env.LIQUIDOS_SUPABASE_ANON_KEY ||
  'sb_publishable_Z7xSrzPPt4ECu7kywl_cmg_K-6yrdDT';

const downloadsCache = { at: 0, data: null };

function cleanUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return /^https?:$/.test(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function releaseJson(row) {
  const channel = String(row.channel || 'stable').replace(/[^A-Za-z0-9._-]/g, '');
  const version = String(row.version || '').replace(/[^A-Za-z0-9._-]/g, '');
  return {
    version: String(row.version || ''),
    channel: String(row.channel || 'stable'),
    name: String(row.iso_name || ''),
    size: Number(row.size_bytes) || 0,
    sha256: String(row.sha256 || ''),
    downloadUrl: cleanUrl(row.download_url),
    source: String(row.source || 'release'),
    runUrl: cleanUrl(row.run_url),
    notes: String(row.notes || ''),
    parts: Array.isArray(row.parts)
      ? row.parts.map(cleanUrl).filter(Boolean)
      : [],
    current: Boolean(row.is_current),
    createdAt: String(row.created_at || ''),
    manifestUrl: version
      ? `${SUPABASE_URL}/storage/v1/object/public/liquidos/releases/${encodeURIComponent(channel)}/${encodeURIComponent(version)}.json`
      : ''
  };
}

async function fetchDownloads() {
  if (downloadsCache.data && Date.now() - downloadsCache.at < 60 * 1000) {
    return { ...downloadsCache.data, cached: true };
  }

  const select = [
    'version', 'channel', 'iso_name', 'size_bytes', 'sha256',
    'download_url', 'source', 'run_url', 'notes', 'parts', 'is_current', 'created_at'
  ].join(',');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/liquidos_releases?select=${select}` +
        '&order=is_current.desc,created_at.desc&limit=20',
      {
        signal: ctrl.signal,
        headers: {
          apikey: SUPABASE_KEY,
          authorization: `Bearer ${SUPABASE_KEY}`,
          accept: 'application/json',
          'user-agent': UA
        }
      }
    );
    if (!res.ok) throw new Error(`Supabase respondió HTTP ${res.status}`);
    const rows = await res.json();
    const data = {
      ok: true,
      configured: true,
      releases: Array.isArray(rows) ? rows.map(releaseJson) : []
    };
    downloadsCache.at = Date.now();
    downloadsCache.data = data;
    return data;
  } catch (err) {
    const message =
      err.name === 'AbortError'
        ? 'Supabase tardó demasiado en responder'
        : `No se pudo consultar Supabase: ${err.message}`;
    return { ok: false, configured: true, error: message, releases: [] };
  } finally {
    clearTimeout(timer);
  }
}

/* ============================================================
 * Rutas
 * ============================================================ */

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // peticiones locales sin Origin (curl)
  try {
    const o = new URL(origin);
    return o.host === req.headers.host;
  } catch {
    return false;
  }
}

async function handleApi(req, res, url) {
  const path = url.pathname;

  if (path === '/api/health') {
    return json(res, 200, {
      ok: true,
      app: 'LiquidOS',
      version: '1.0',
      node: process.version,
      platform: process.platform
    });
  }

  /* ---------------------- Descargas reales ---------------------- */
  if (path === '/api/downloads') {
    return json(res, 200, await fetchDownloads());
  }

  /* ---------------------- Navegador real ---------------------- */
  if (path === '/api/web') {
    const target = url.searchParams.get('url');
    if (!target) return json(res, 400, { ok: false, error: 'Falta el parámetro url' });
    if (target.length > 4096) return json(res, 400, { ok: false, error: 'Dirección demasiado larga' });

    const cached = cacheGet(target);
    if (cached) return json(res, 200, { ok: true, ...cached, cached: true });

    try {
      const page = await fetchPage(target);
      const title = htmlTitle(page.html) || new URL(page.finalUrl).hostname;
      const html = sanitizeHtml(page.html, page.finalUrl, title);
      const data = {
        url: page.finalUrl,
        title,
        html,
        bytes: Buffer.byteLength(html, 'utf8')
      };
      cacheSet(target, data);
      return json(res, 200, { ok: true, ...data });
    } catch (err) {
      return json(res, 200, { ok: false, error: err.message, url: target });
    }
  }

  /* ---------------------- Tienda real ---------------------- */
  if (path === '/api/store/status') {
    ensureFlathubRemote();
    detectFlatpak(true);
    return json(res, 200, {
      ok: true,
      flatpak: { available: store.available, version: store.version },
      remotes: store.remotes,
      flathub: store.flathub,
      mode: store.available ? 'real' : 'demo',
      platform: process.platform
    });
  }

  if (path === '/api/store/search') {
    const q = url.searchParams.get('q') || '';
    try {
      const hits = await flathubSearch(q);
      return json(res, 200, { ok: true, query: q, hits, count: hits.length });
    } catch (err) {
      return json(res, 200, { ok: false, error: err.message, query: q });
    }
  }

  if (path === '/api/store/installed') {
    detectFlatpak(true);
    if (!store.available) {
      return json(res, 200, {
        ok: false,
        error: 'Flatpak no está instalado en este equipo',
        apps: []
      });
    }
    return json(res, 200, { ok: true, apps: installedApps() });
  }

  if (path === '/api/store/updates') {
    detectFlatpak(true);
    if (!store.available) {
      return json(res, 200, { ok: false, error: 'Flatpak no está instalado en este equipo', apps: [] });
    }
    return json(res, 200, { ok: true, apps: updatesAvailable() });
  }

  if (path === '/api/store/install' && req.method === 'POST') {
    if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Origen no permitido' });
    const body = await readJson(req).catch((err) => ({ error: err.message }));
    const appId = String(body.appId || '');
    if (!APP_ID.test(appId)) return json(res, 400, { ok: false, error: 'Identificador de aplicación no válido' });
    detectFlatpak(true);
    if (!store.available) {
      return json(res, 200, {
        ok: false,
        reason: 'flatpak-missing',
        error: 'Este equipo no tiene Flatpak, así que la demostración no puede instalar aplicaciones de verdad.',
        command: `flatpak install flathub ${appId}`,
        url: `https://flathub.org/apps/${appId}`
      });
    }
    ensureFlathubRemote();
    if (!store.flathub) {
      return json(res, 200, {
        ok: false,
        reason: 'flathub-missing',
        error: 'Flatpak está instalado, pero no se pudo configurar Flathub. Revisa la conexión.',
        command: 'flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo',
        url: 'https://flathub.org/setup'
      });
    }
    const args = [...scopeArgs(), '--noninteractive', 'install', '--assumeyes', 'flathub', appId];
    const job = startJob(args, { kind: 'install', appId });
    return json(res, 200, { ok: true, job: job.id, command: job.command });
  }

  if (path === '/api/store/remove' && req.method === 'POST') {
    if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Origen no permitido' });
    const body = await readJson(req).catch((err) => ({ error: err.message }));
    const appId = String(body.appId || '');
    if (!APP_ID.test(appId)) return json(res, 400, { ok: false, error: 'Identificador de aplicación no válido' });
    detectFlatpak(true);
    if (!store.available) {
      return json(res, 200, {
        ok: false,
        reason: 'flatpak-missing',
        error: 'Flatpak no está instalado en este equipo.',
        command: `flatpak uninstall ${appId}`,
        url: `https://flathub.org/apps/${appId}`
      });
    }
    const app = installedApps().find((a) => a.id === appId);
    const args = [
      ...(app && app.installation === 'user' ? ['--user'] : []),
      '--noninteractive', 'uninstall', '--assumeyes', appId
    ];
    const job = startJob(args, { kind: 'remove', appId });
    return json(res, 200, { ok: true, job: job.id, command: job.command });
  }

  if (path === '/api/store/update' && req.method === 'POST') {
    if (!sameOrigin(req)) return json(res, 403, { ok: false, error: 'Origen no permitido' });
    const body = await readJson(req).catch((err) => ({ error: err.message }));
    const appId = body.appId ? String(body.appId) : '';
    if (appId && !APP_ID.test(appId)) {
      return json(res, 400, { ok: false, error: 'Identificador de aplicación no válido' });
    }
    detectFlatpak(true);
    if (!store.available) {
      return json(res, 200, {
        ok: false,
        reason: 'flatpak-missing',
        error: 'Flatpak no está instalado en este equipo.',
        command: 'flatpak update',
        url: 'https://flathub.org/setup'
      });
    }
    const args = [
      ...scopeArgs(), '--noninteractive', 'update', '--assumeyes',
      ...(appId ? [appId] : [])
    ];
    const job = startJob(args, { kind: 'update', appId });
    return json(res, 200, { ok: true, job: job.id, command: job.command });
  }

  const jobMatch = /^\/api\/store\/job\/([a-f0-9-]{36})$/.exec(path);
  if (jobMatch) {
    const job = jobs.get(jobMatch[1]);
    if (!job) return json(res, 404, { ok: false, error: 'Trabajo no encontrado' });
    return json(res, 200, jobJson(job));
  }

  return json(res, 404, { ok: false, error: 'Ruta no encontrada' });
}

/* ============================================================
 * Servidor
 * ============================================================ */

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('405 — método no permitido');
      return;
    }

    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    const file = rel === '' || rel === '.' ? join(root, 'index.html') : join(root, rel);
    if (!file.startsWith(root + sep)) throw new Error('fuera del directorio');
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': types[extname(file)] || 'application/octet-stream',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff'
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 — no encontrado');
  }
});

server.listen(port, '127.0.0.1', () => {
  detectFlatpak(true);
  console.log(`LiquidOS · vista previa en http://127.0.0.1:${port}`);
  console.log(`  navegador real: /api/web · tienda: /api/store/status · descargas: /api/downloads`);
  console.log(
    store.available
      ? `  flatpak detectado: ${store.version}${store.flathub ? ' · Flathub listo' : ' · Flathub pendiente'}`
      : '  flatpak no instalado: la tienda mostrará el catálogo real de Flathub y el comando de instalación'
  );
});
