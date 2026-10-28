/* ============================================================
   LiquidOS — escritorio de demostración (vista previa web)
   Simula el shell de LiquidOS: barra de menús, Dock, ventanas,
   Spotlight y Centro de control.
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);

/* ---------------------------- Glifos ---------------------------- */

const GLYPHS = {
  folder: '<path d="M3.2 7.6A2.6 2.6 0 0 1 5.8 5h3.1c.7 0 1.4.3 1.8.9l.8 1.1h6.7a2.6 2.6 0 0 1 2.6 2.6v6.8a2.6 2.6 0 0 1-2.6 2.6H5.8a2.6 2.6 0 0 1-2.6-2.6z"/>',
  globe: '<circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.6 12h16.8M12 3.6c2.4 2.3 3.6 5.2 3.6 8.4s-1.2 6.1-3.6 8.4c-2.4-2.3-3.6-5.2-3.6-8.4S9.6 5.9 12 3.6z" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  mail: '<rect x="3" y="5.6" width="18" height="12.8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4.4 7.4 12 13l7.6-5.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  notes: '<rect x="4.4" y="3.6" width="15.2" height="16.8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 8.2h8M8 12h8M8 15.8h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  music: '<path d="M9.4 17.6V6.8l9-2v10.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="2.6"/><circle cx="16.4" cy="16.2" r="2.6"/>',
  terminal: '<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7.4 10.2 10 12.6l-2.6 2.4M12.6 15h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  settings: '<circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v2.3M12 18.7V21M3 12h2.3M18.7 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  trash: '<path d="M6.4 8.2h11.2l-1 11.4a1.8 1.8 0 0 1-1.8 1.6H9.2a1.8 1.8 0 0 1-1.8-1.6z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.2 8.2V5.8h5.6v2.4M4.4 8.2h15.2M10.4 11.6v6M13.6 11.6v6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  search: '<circle cx="10.4" cy="10.4" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14.8 14.8 20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  doc: '<path d="M6 3.6h7.2L18 8.4v12H6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13.2 3.6v4.8H18" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  image: '<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8.6" cy="9.4" r="1.6" fill="currentColor"/><path d="M4.4 16.6 9 12.4l3.4 3.2 3-2.6 4.2 3.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  home: '<path d="M4.4 11.2 12 4.4l7.6 6.8v8.2H4.4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  download: '<path d="M12 4v10.4M7.8 10.8 12 15l4.2-4.2M4.6 18.6h14.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  desktop: '<rect x="3.4" y="4.8" width="17.2" height="11.4" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9 20h6M12 16.2V20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  clock: '<circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.4V12l3.2 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  tag: '<path d="M11.4 3.8H20v8.6l-8.6 8.6-8.6-8.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16.2" cy="7.6" r="1.4" fill="currentColor"/>',
  chevron: '<path d="M9 5.6 15.4 12 9 18.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  wifi: '<path d="M2 6.4a15 15 0 0 1 20 0M5.4 9.8a10 10 0 0 1 13.2 0M8.7 13.2a5.5 5.5 0 0 1 6.6 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="16.2" r="1.4" fill="currentColor"/>'
};

const svg = (name, extra = '') =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${GLYPHS[name] || ''}</svg>`;

/* ---------------------------- Apps ---------------------------- */

const APPS = [
  { id: 'archivos',  name: 'Archivos',       glyph: 'folder',   c1: '#6fc0ff', c2: '#1a6fe0', w: 830, h: 520 },
  { id: 'navegador', name: 'Navegador',      glyph: 'globe',    c1: '#63e6dd', c2: '#0b8f96', w: 880, h: 560 },
  { id: 'correo',    name: 'Correo',         glyph: 'mail',     c1: '#8ec5ff', c2: '#2b6fe8', w: 760, h: 500 },
  { id: 'notas',     name: 'Notas',          glyph: 'notes',    c1: '#ffe27a', c2: '#f0a51e', w: 720, h: 470 },
  { id: 'musica',    name: 'Música',         glyph: 'music',    c1: '#ff8fb1', c2: '#c2185b', w: 680, h: 430 },
  { id: 'terminal',  name: 'Terminal',       glyph: 'terminal', c1: '#4b5262', c2: '#171a22', w: 700, h: 430 },
  { id: 'ajustes',   name: 'Ajustes',        glyph: 'settings', c1: '#c9d1e0', c2: '#7d8798', w: 780, h: 560 }
];

const byId = Object.fromEntries(APPS.map((a) => [a.id, a]));

/* ---------------------------- Estado ---------------------------- */

const state = {
  open: new Map(),          // id -> { el, min: boolean, rect: null }
  z: 10,
  cascade: 0,
  theme: 'dark',
  mag: true,
  anim: true,
  booted: false
};

const desktop = $('#desktop');
const windowsLayer = $('#windows');
const dock = $('#dock');

/* ---------------------------- Utilidades ---------------------------- */

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

function icons(name) { return svg(name); }

/* ---------------------------- Dock ---------------------------- */

function buildDock() {
  APPS.forEach((app, i) => {
    const item = document.createElement('button');
    item.className = 'dock-item';
    item.dataset.app = app.id;
    item.style.setProperty('--s', '1');
    item.innerHTML = `
      <span class="app-icon" style="--c1:${app.c1};--c2:${app.c2}">${svg(app.glyph)}</span>
      <span class="dock-tip">${app.name}</span>`;
    item.addEventListener('click', () => onDockClick(app.id));
    dock.appendChild(item);

    if (i === APPS.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'dock-sep';
      dock.appendChild(sep);

      const trash = document.createElement('button');
      trash.className = 'dock-item';
      trash.style.setProperty('--s', '1');
      trash.innerHTML = `
        <span class="app-icon trash">${svg('trash')}</span>
        <span class="dock-tip">Papelera</span>`;
      trash.addEventListener('click', () => toast('La papelera está vacía'));
      dock.appendChild(trash);
    }
  });

  dock.addEventListener('pointermove', magnify);
  dock.addEventListener('pointerleave', resetMagnify);
}

function magnify(e) {
  if (!state.mag) return;
  const items = [...dock.querySelectorAll('.dock-item')];
  const sigma = 78;
  items.forEach((el) => {
    const r = el.getBoundingClientRect();
    const d = e.clientX - (r.left + r.width / 2);
    const s = 1 + 0.34 * Math.exp(-(d * d) / (2 * sigma * sigma));
    el.style.setProperty('--s', s.toFixed(3));
    el.style.transform = `translateY(${(-(s - 1) * 16).toFixed(2)}px) scale(${s.toFixed(3)})`;
  });
}

function resetMagnify() {
  dock.querySelectorAll('.dock-item').forEach((el) => {
    el.style.setProperty('--s', '1');
    el.style.transform = '';
  });
}

/* ---------------------------- Ventanas ---------------------------- */

function onDockClick(id) {
  const entry = state.open.get(id);
  if (!entry) return openApp(id);
  if (entry.min) {
    restoreWin(id);
    return;
  }
  if (entry.el.classList.contains('focused')) {
    animateMinimize(id);
  } else {
    focusWin(id);
  }
}

function genieOrigin(win, id) {
  const item = dock.querySelector(`[data-app="${id}"]`);
  const wr = win.getBoundingClientRect();
  if (!item || !wr.width) return 50;
  const dr = item.getBoundingClientRect();
  const x = ((dr.left + dr.width / 2) - wr.left) / wr.width * 100;
  return Math.max(-20, Math.min(120, x));
}

function bounce(id) {
  const item = dock.querySelector(`[data-app="${id}"]`);
  if (!item || !state.anim) return;
  item.classList.remove('pop');
  void item.offsetWidth;
  item.classList.add('pop');
  setTimeout(() => item.classList.remove('pop'), 700);
}

function focusWin(id) {
  state.open.forEach((v, k) => v.el.classList.toggle('focused', k === id));
  const entry = state.open.get(id);
  if (!entry) return;
  entry.el.style.zIndex = ++state.z;
  const app = byId[id];
  $('.app-name').textContent = app ? app.name : (id === 'acerca' ? 'Acerca de LiquidOS' : 'Escritorio');
}

function openApp(id) {
  const app = byId[id];
  if (!app) return;
  const entry = state.open.get(id);
  if (entry) {
    if (entry.min) restoreWin(id);
    else { focusWin(id); bounce(id); }
    return;
  }

  const win = document.createElement('section');
  win.className = 'window';
  win.dataset.app = id;
  const vw = Math.min(window.innerWidth - 60, app.w);
  const vh = Math.min(window.innerHeight - 130, app.h);
  const maxX = Math.max(20, window.innerWidth - vw - 30);
  const maxY = Math.max(20, window.innerHeight - vh - 110);
  const off = (state.cascade++ % 6) * 26;
  win.style.width = vw + 'px';
  win.style.height = vh + 'px';
  win.style.left = Math.min(60 + off * 2, maxX) + 'px';
  win.style.top = Math.min(46 + off, maxY) + 'px';

  win.innerHTML = `
    <header class="window-head">
      <div class="traffic">
        <button class="dot close" title="Cerrar" aria-label="Cerrar"></button>
        <button class="dot min" title="Minimizar" aria-label="Minimizar"></button>
        <button class="dot max" title="Maximizar" aria-label="Maximizar"></button>
      </div>
      <div class="win-title">${app.name}</div>
      <div></div>
    </header>
    <div class="win-body">${render(app.id)}</div>`;

  windowsLayer.appendChild(win);
  state.open.set(id, { el: win, min: false, rect: null });
  bounce(id);
  focusWin(id);

  win.querySelector('.dot.close').addEventListener('click', () => closeWin(id));
  win.querySelector('.dot.min').addEventListener('click', () => animateMinimize(id));
  win.querySelector('.dot.max').addEventListener('click', () => toggleMax(id));
  win.addEventListener('pointerdown', () => focusWin(id), true);
  const head = win.querySelector('.window-head');
  head.addEventListener('pointerdown', (e) => startDrag(e, win, id));
  head.addEventListener('dblclick', (e) => {
    if (!e.target.closest('.dot')) toggleMax(id);
  });

  const dockItem = dock.querySelector(`[data-app="${id}"]`);
  if (dockItem) dockItem.classList.add('running');

  wireWindow(id, win);
}

function closeWin(id) {
  const entry = state.open.get(id);
  if (!entry) return;
  entry.el.classList.add('closed');
  const el = entry.el;
  setTimeout(() => el.remove(), 160);
  state.open.delete(id);
  const dockItem = dock.querySelector(`[data-app="${id}"]`);
  if (dockItem) dockItem.classList.remove('running');

  // Devuelve el foco a la ventana que quedó arriba, si hay alguna.
  const rest = [...state.open.entries()]
    .sort((a, b) => Number(b[1].el.style.zIndex || 0) - Number(a[1].el.style.zIndex || 0));
  if (rest.length) focusWin(rest[0][0]);
  else $('.app-name').textContent = 'Escritorio';
}

function animateMinimize(id) {
  const entry = state.open.get(id);
  if (!entry || entry.min) return;
  const win = entry.el;
  entry.min = true;
  win.classList.remove('focused');

  if (!state.anim) {
    win.classList.add('minimized');
    return;
  }

  win.style.setProperty('--origin-x', genieOrigin(win, id) + '%');
  win.classList.add('minimizing');
  clearTimeout(entry.minTimer);
  entry.minTimer = setTimeout(() => {
    win.classList.remove('minimizing');
    win.classList.add('minimized');
    win.style.removeProperty('--origin-x');
    entry.minTimer = null;
  }, 340);
}

function restoreWin(id) {
  const entry = state.open.get(id);
  if (!entry) return;
  const win = entry.el;
  clearTimeout(entry.minTimer);
  entry.minTimer = null;
  entry.min = false;
  win.classList.remove('minimized', 'minimizing');
  win.style.removeProperty('--origin-x');

  if (state.anim) {
    win.classList.remove('restoring');
    void win.offsetWidth;
    win.classList.add('restoring');
    setTimeout(() => win.classList.remove('restoring'), 420);
  }

  focusWin(id);
  bounce(id);
}

function toggleMax(id) {
  const entry = state.open.get(id);
  if (!entry) return;
  const win = entry.el;

  if (state.anim) {
    win.style.transition =
      'left .26s var(--ease), top .26s var(--ease), width .26s var(--ease), height .26s var(--ease)';
    setTimeout(() => { win.style.transition = ''; }, 300);
  }

  if (entry.rect) {
    Object.assign(win.style, entry.rect);
    entry.rect = null;
  } else {
    entry.rect = {
      left: win.style.left,
      top: win.style.top,
      width: win.style.width,
      height: win.style.height
    };
    win.style.left = '12px';
    win.style.top = '12px';
    win.style.width = 'calc(100% - 24px)';
    win.style.height = 'calc(100% - 104px)';
  }
}

function startDrag(e, win, id) {
  if (e.button !== 0 || e.target.closest('.dot')) return;
  const head = e.currentTarget;
  const startX = e.clientX;
  const startY = e.clientY;
  const rect = win.getBoundingClientRect();
  const parent = windowsLayer.getBoundingClientRect();
  const origLeft = rect.left - parent.left;
  const origTop = rect.top - parent.top;

  head.setPointerCapture(e.pointerId);
  win.style.transition = 'none';

  const move = (ev) => {
    const nx = origLeft + ev.clientX - startX;
    const ny = origTop + ev.clientY - startY;
    win.style.left = Math.max(-rect.width + 120, Math.min(nx, parent.width - 80)) + 'px';
    win.style.top = Math.max(0, Math.min(ny, parent.height - 52)) + 'px';
  };

  const up = () => {
    head.removeEventListener('pointermove', move);
    head.removeEventListener('pointerup', up);
    win.style.transition = '';
  };

  head.addEventListener('pointermove', move);
  head.addEventListener('pointerup', up);
  focusWin(id);
}

/* ---------------------------- Contenidos ---------------------------- */

function render(id) {
  switch (id) {
    case 'archivos': return viewFinder();
    case 'navegador': return viewBrowser();
    case 'correo': return viewMail();
    case 'notas': return viewNotes();
    case 'musica': return viewMusic();
    case 'terminal': return viewTerminal();
    case 'ajustes': return viewSettings();
    default: return '';
  }
}

function viewFinder() {
  const places = [
    ['desktop', 'Escritorio'], ['home', 'Inicio'], ['doc', 'Documentos'],
    ['download', 'Descargas'], ['image', 'Imágenes'], ['music', 'Música']
  ];
  const files = [
    ['folder-doc', 'Documentos'], ['folder-img', 'Imágenes'], ['folder-mus', 'Música'],
    ['', 'Descargas'], ['', 'Proyectos'], ['', 'Capturas'], ['', 'Escritorio'], ['folder-img', 'Vídeos']
  ];
  return `
  <div class="finder">
    <aside class="sidebar">
      <h4>Favoritos</h4>
      ${places.map(([ic, label], i) => `
        <button class="${i === 1 ? 'on' : ''}">${icons(ic)}<span>${label}</span></button>`).join('')}
      <h4>Etiquetas</h4>
      <button>${icons('tag')}<span>Importante</span></button>
      <button>${icons('tag')}<span>Proyectos</span></button>
    </aside>
    <div class="finder-main">
      <div class="finder-bar">
        <span class="pill">Inicio</span>
        <span>8 elementos · 42,3 GB disponibles</span>
      </div>
      <div class="grid">
        ${files.map(([cls, label], i) => `
          <div class="file">
            <div class="file-icon ${cls}"></div>
            <span>${i === 7 ? 'Música' : label}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewBrowser() {
  const tiles = [['⌘', 'LiquidOS'], ['★', 'Favoritos'], ['↺', 'Historial'], ['⤓', 'Descargas']];
  return `
  <div class="browser">
    <div class="browser-bar">
      <button class="nav">←</button>
      <button class="nav">→</button>
      <div class="url">${icons('globe')}<span>liquidos.local/inicio</span></div>
      <button class="nav">${icons('search')}</button>
    </div>
    <div class="start-page">
      <svg class="mark" viewBox="0 0 100 120"><path d="M50 4c14 22 34 44 34 66a34 34 0 1 1-68 0C16 48 36 26 50 4z" fill="#5aa9ff"/></svg>
      <h2>Bienvenido a LiquidOS</h2>
      <p>Tu escritorio, fluido y silencioso. Todo lo que necesitas, a un gesto de distancia.</p>
      <div class="tiles">
        ${tiles.map(([g, t]) => `<div class="tile"><b>${g}</b>${t}</div>`).join('')}
      </div>
    </div>
  </div>`;
}

function viewMail() {
  const mails = [
    ['Equipo LiquidOS', 'Bienvenido a la beta de Torrente', 'Hoy', true],
    ['Actualizaciones', 'Tu sistema está al día', 'Ayer', false],
    ['Diseño', 'Nueva paleta para el Dock', 'Ayer', false],
    ['GNOME', 'Notas de la versión 46', 'Lun', false],
    ['Comunidad', 'Reporte mensual de la distro', 'Vie', false]
  ];
  return `
  <div class="notes">
    <aside class="notes-list">
      <div class="note-item on"><b>Bandeja de entrada</b>5 mensajes sin leer</div>
      <div class="note-item"><b>Enviados</b>Hace un momento</div>
      <div class="note-item"><b>Archivo</b>128 mensajes</div>
    </aside>
    <div style="overflow:auto">
      ${mails.map(([from, subj, when, unread]) => `
        <div class="row" style="border-radius:0;border:0;border-bottom:1px solid var(--stroke-soft);margin:0;background:transparent">
          <div>
            <div style="display:flex;gap:8px;align-items:center">
              ${unread ? '<span style="width:7px;height:7px;border-radius:50%;background:var(--accent);display:inline-block"></span>' : ''}
              <b>${from}</b>
            </div>
            <small>${subj}</small>
          </div>
          <span style="color:var(--text-dim);font-size:11.5px">${when}</span>
        </div>`).join('')}
    </div>
  </div>`;
}

function viewNotes() {
  return `
  <div class="notes">
    <aside class="notes-list">
      <div class="note-item on"><b>Bienvenido</b>LiquidOS es una distro basada en Debian…</div>
      <div class="note-item"><b>Ideas</b>Dock con magnificación, Spotlight…</div>
      <div class="note-item"><b>Compilar</b>make iso · make look · make preview</div>
    </aside>
    <div class="note-edit" contenteditable="true" spellcheck="false">
      <h2>Bienvenido a LiquidOS</h2>
      <div class="date">28 de octubre de 2026 · 09:41</div>
      <p>Este es el escritorio de <b>LiquidOS</b>, una distribución de Linux basada en Debian que toma la calma visual de macOS y la combina con la libertad del software libre.</p>
      <ul>
        <li>Barra de menús translúcida con blur real.</li>
        <li>Dock con magnificación y ventanas arrastrables.</li>
        <li>Spotlight con <b>Ctrl + Espacio</b>.</li>
        <li>Centro de control con modo claro y oscuro.</li>
      </ul>
      <p style="color:var(--text-dim)">Puedes escribir aquí: esta nota es editable.</p>
    </div>
  </div>`;
}

function viewMusic() {
  const tracks = [
    ['Océano de datos', 'Liquid Sound', '3:42'],
    ['Vidrio templado', 'Liquid Sound', '4:10'],
    ['Marea lenta', 'Nocturno', '2:58'],
    ['Azul profundo', 'Nocturno', '5:06'],
    ['Destello', 'Liquid Sound', '3:21']
  ];
  return `
  <div class="music">
    <aside class="sidebar">
      <h4>Biblioteca</h4>
      <button class="on">${icons('music')}<span>Reproduciendo</span></button>
      <button>${icons('folder')}<span>Álbumes</span></button>
      <button>${icons('clock')}<span>Recientes</span></button>
    </aside>
    <div class="music-meta">
      <div class="cover">♪</div>
      <h3>Océano de datos</h3>
      <p>Liquid Sound · Ambiente</p>
      <div class="bars"><i></i><i></i><i></i><i></i><i></i></div>
      ${tracks.map(([t, a, d], i) => `
        <div class="track">
          <span>${i + 1}. ${t} <span style="color:var(--text-dim)">· ${a}</span></span>
          <span>${d}</span>
        </div>`).join('')}
    </div>
  </div>`;
}

function viewTerminal() {
  return `
  <div class="term">
    <div><span class="prompt">sebas@liquidos</span>:<span class="d">~</span>$ neofetch</div>
    <pre style="margin:8px 0;color:#79c0ff">
        <span style="color:#5aa9ff">      ▄▄▄▄▄▄▄      </span>  <span class="c">sebas</span>@<span class="c">liquidos</span>
     <span style="color:#5aa9ff">    ▄█▀     ▀█▄    </span>  ----------------------
    <span style="color:#7b5cff">    ██   ▄▄▄   ██   </span>  <span class="w">OS</span>: LiquidOS 1.0 "Torrente" x86_64
    <span style="color:#7b5cff">    ██  █████  ██   </span>  <span class="w">Kernel</span>: 6.1.0-liquidos-amd64
   <span style="color:#2fd1c5">     ▀█▄  ▀▀▀  ▄█▀    </span>  <span class="w">Shell</span>: zsh 5.9
      <span style="color:#2fd1c5">      ▀▀▀▀▀▀▀      </span>  <span class="w">DE</span>: GNOME 46 (LiquidShell)
                          <span class="w">WM</span>: Mutter
                          <span class="w">Theme</span>: Liquid-Dark
                          <span class="w">Icons</span>: Liquid-Icons
                          <span class="w">Terminal</span>: GNOME Terminal
                          <span class="w">CPU</span>: AMD Ryzen 7 (16) @ 3.8GHz
                          <span class="w">Memory</span>: 2.4GiB / 16GiB
    </pre>
    <div><span class="prompt">sebas@liquidos</span>:<span class="d">~</span>$ cat /etc/os-release</div>
    <div class="dim">NAME="LiquidOS"</div>
    <div class="dim">VERSION="1.0 (Torrente)"</div>
    <div class="dim">ID=liquidos</div>
    <div class="dim">ID_LIKE=debian</div>
    <div class="dim">PRETTY_NAME="LiquidOS 1.0 (Torrente)"</div>
    <div style="margin-top:10px"><span class="prompt">sebas@liquidos</span>:<span class="d">~</span>$ <span class="caret"></span></div>
  </div>`;
}

function viewSettings() {
  return `
  <div class="settings">
    <aside class="sidebar">
      <h4>Sistema</h4>
      <button>${icons('wifi')}<span>Wi-Fi</span></button>
      <button class="on">${icons('settings')}<span>Apariencia</span></button>
      <button>${icons('desktop')}<span>Escritorio y Dock</span></button>
      <button>${icons('music')}<span>Sonido</span></button>
      <button>${icons('clock')}<span>Pantalla</span></button>
      <h4>Acerca de</h4>
      <button data-open-about="1">${icons('doc')}<span>Acerca de LiquidOS</span></button>
    </aside>
    <div class="set-body">
      <h3>Apariencia</h3>
      <p class="sub">Elige cómo se ve LiquidOS en este equipo.</p>

      <div class="row">
        <div><b>Tema</b><small>Claro u oscuro para todo el sistema</small></div>
        <div class="seg2" id="settingsTheme">
          <button data-theme="light" class="${state.theme === 'light' ? 'on' : ''}">Claro</button>
          <button data-theme="dark" class="${state.theme === 'dark' ? 'on' : ''}">Oscuro</button>
        </div>
      </div>

      <div class="row">
        <div><b>Dock</b><small>Ocultar automáticamente</small></div>
        <button class="switch" data-switch="dock" aria-label="Dock automático"></button>
      </div>

      <div class="row">
        <div><b>Magnificación del Dock</b><small>Efecto al pasar el cursor</small></div>
        <button class="switch on" data-switch="mag" aria-label="Magnificación"></button>
      </div>

      <div class="row">
        <div><b>Animaciones</b><small>Transiciones y movimiento del sistema</small></div>
        <button class="switch on" data-switch="anim" aria-label="Animaciones"></button>
      </div>

      <div class="row">
        <div><b>Sonidos del sistema</b><small>Efectos de interfaz</small></div>
        <button class="switch on" data-switch="snd" aria-label="Sonidos"></button>
      </div>

      <div class="row">
        <div><b>Modo oscuro automático</b><small>Según la hora del día</small></div>
        <button class="switch" data-switch="auto" aria-label="Automático"></button>
      </div>

      <h3 style="margin-top:22px">Ventanas</h3>
      <p class="sub">Los botones se muestran a la izquierda, como en macOS.</p>
      <div class="row">
        <div><b>Botones de ventana</b><small>cerrar · minimizar · maximizar</small></div>
        <span style="display:flex;gap:6px">
          <span style="width:12px;height:12px;border-radius:50%;background:#ff5f57;display:inline-block"></span>
          <span style="width:12px;height:12px;border-radius:50%;background:#febc2e;display:inline-block"></span>
          <span style="width:12px;height:12px;border-radius:50%;background:#28c840;display:inline-block"></span>
        </span>
      </div>
    </div>
  </div>`;
}

function viewAbout() {
  return `
  <div class="about">
    <svg class="mark" viewBox="0 0 100 120"><path d="M50 4c14 22 34 44 34 66a34 34 0 1 1-68 0C16 48 36 26 50 4z" fill="#5aa9ff"/></svg>
    <h2>LiquidOS</h2>
    <div class="ver">Versión 1.0 “Torrente” · edición de desarrollo</div>
    <dl>
      <dt>Base</dt><dd>Debian 12 (bookworm)</dd>
      <dt>Escritorio</dt><dd>GNOME 46 · LiquidShell</dd>
      <dt>Kernel</dt><dd>6.1 amd64</dd>
      <dt>Paquetes</dt><dd>~1 850</dd>
      <dt>Licencia</dt><dd>GPL / MIT</dd>
    </dl>
  </div>`;
}

/* ---------------------------- Cableado interno ---------------------------- */

function wireWindow(id, win) {
  if (id === 'ajustes') {
    win.querySelectorAll('#settingsTheme button').forEach((b) => {
      b.addEventListener('click', () => setTheme(b.dataset.theme));
    });
    win.querySelectorAll('[data-switch]').forEach((sw) => {
      sw.addEventListener('click', () => {
        const on = !sw.classList.contains('on');
        sw.classList.toggle('on', on);
        if (sw.dataset.switch === 'mag') {
          state.mag = on;
          if (!on) resetMagnify();
        }
        if (sw.dataset.switch === 'anim') setAnim(on);
      });
    });
    const about = win.querySelector('[data-open-about]');
    if (about) about.addEventListener('click', () => openAbout());
  }
  if (id === 'notas') {
    win.querySelectorAll('.note-item').forEach((n) => {
      n.addEventListener('click', () => {
        win.querySelectorAll('.note-item').forEach((x) => x.classList.remove('on'));
        n.classList.add('on');
      });
    });
  }
}

function openAbout() {
  const id = 'acerca';
  if (state.open.has(id)) return focusWin(id);
  const win = document.createElement('section');
  win.className = 'window';
  win.dataset.app = id;
  win.style.width = '420px';
  win.style.height = '400px';
  win.style.left = 'calc(50% - 210px)';
  win.style.top = '12vh';
  win.innerHTML = `
    <header class="window-head">
      <div class="traffic">
        <button class="dot close" aria-label="Cerrar"></button>
        <button class="dot min" aria-label="Minimizar"></button>
        <button class="dot max" aria-label="Maximizar"></button>
      </div>
      <div class="win-title">Acerca de LiquidOS</div>
      <div></div>
    </header>
    <div class="win-body">${viewAbout()}</div>`;
  windowsLayer.appendChild(win);
  state.open.set(id, { el: win, min: false, rect: null });
  focusWin(id);
  win.querySelector('.dot.close').addEventListener('click', () => closeWin(id));
  win.querySelector('.dot.min').addEventListener('click', () => animateMinimize(id));
  win.querySelector('.dot.max').addEventListener('click', () => toggleMax(id));
  win.querySelector('.window-head').addEventListener('pointerdown', (e) => startDrag(e, win, id));
  win.addEventListener('pointerdown', () => focusWin(id), true);
}

function setAnim(on) {
  state.anim = on;
  document.body.classList.toggle('no-anim', !on);
}

/* ---------------------------- Tema ---------------------------- */

function setTheme(mode) {
  state.theme = mode;
  document.body.classList.toggle('light', mode === 'light');
  document.body.classList.toggle('dark', mode === 'dark');

  const label = $('#appearanceLabel');
  if (label) label.textContent = mode === 'dark' ? 'Oscuro' : 'Claro';

  const tile = $('#ccThemeTile');
  if (tile) tile.dataset.on = 'true';

  document.querySelectorAll('.seg button, .seg2 button').forEach((b) => {
    b.classList.toggle('on', b.dataset.theme === mode);
  });
}

/* ---------------------------- Spotlight ---------------------------- */

const spot = $('#spotlight');
const spotInput = $('#spotInput');
const spotResults = $('#spotResults');
let spotIndex = 0;
let spotList = [];

function searchTargets() {
  const extra = [
    { id: 'acerca', name: 'Acerca de LiquidOS', glyph: 'doc', c1: '#7cc3ff', c2: '#3b6fd8', hint: 'Sistema' },
    { id: 'ajustes', name: 'Ajustes · Apariencia', glyph: 'settings', c1: '#c9d1e0', c2: '#7d8798', hint: 'Ajustes' },
    { id: 'ajustes', name: 'Ajustes · Wi-Fi', glyph: 'wifi', c1: '#c9d1e0', c2: '#7d8798', hint: 'Ajustes' }
  ];
  return [...APPS, ...extra];
}

function openSpotlight() {
  $('#menuPop').hidden = true;
  $('#controlCenter').hidden = true;
  spot.hidden = false;
  spotInput.value = '';
  renderSpotResults('');
  setTimeout(() => spotInput.focus(), 20);
}

function closeSpotlight() {
  spot.hidden = true;
}

function renderSpotResults(q) {
  const query = q.trim().toLowerCase();
  spotList = searchTargets().filter((t) => !query || t.name.toLowerCase().includes(query));
  spotIndex = 0;

  if (!spotList.length) {
    spotResults.innerHTML = '<li class="spot-empty">Sin resultados para “' + escapeHtml(q) + '”</li>';
    return;
  }

  spotResults.innerHTML = spotList.map((t, i) => `
    <li data-i="${i}" class="${i === 0 ? 'sel' : ''}">
      <span class="mini app-icon" style="--c1:${t.c1};--c2:${t.c2}">${svg(t.glyph)}</span>
      <span>${t.name}</span>
      <small>${t.hint || 'Aplicación'}</small>
    </li>`).join('');

  spotResults.querySelectorAll('li[data-i]').forEach((li) => {
    li.addEventListener('click', () => launchSpot(Number(li.dataset.i)));
  });
}

function launchSpot(i) {
  const t = spotList[i];
  if (!t) return;
  closeSpotlight();
  if (t.id === 'acerca') return openAbout();
  openApp(t.id);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function moveSpot(dir) {
  if (!spotList.length) return;
  spotIndex = (spotIndex + dir + spotList.length) % spotList.length;
  [...spotResults.children].forEach((li, i) => li.classList.toggle('sel', i === spotIndex));
}

/* ---------------------------- Centro de control ---------------------------- */

function setupControlCenter() {
  const cc = $('#controlCenter');

  $('#controlBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    cc.hidden = !cc.hidden;
    $('#menuPop').hidden = true;
  });

  cc.addEventListener('click', (e) => e.stopPropagation());

  cc.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const on = btn.dataset.on !== 'true';
      btn.dataset.on = String(on);
      const small = btn.querySelector('small');
      const key = btn.dataset.toggle;
      if (small) {
        small.textContent = key === 'wifi' ? (on ? 'liquido-5G' : 'Desactivado')
          : key === 'bt' ? (on ? 'Conectado' : 'Apagado')
          : (on ? 'Activado' : 'Desactivado');
      }
      const titles = { wifi: 'Wi-Fi', bt: 'Bluetooth', dnd: 'No molestar' };
      toast(`${titles[key]}: ${on ? 'activado' : 'desactivado'}`);
    });
  });

  cc.querySelectorAll('[data-theme]').forEach((b) => {
    b.addEventListener('click', () => setTheme(b.dataset.theme));
  });

  const themeTile = $('#ccThemeTile');
  if (themeTile) {
    themeTile.addEventListener('click', () => {
      setTheme(state.theme === 'dark' ? 'light' : 'dark');
      toast(`Apariencia: ${state.theme === 'dark' ? 'Oscura' : 'Clara'}`);
    });
  }

  const paintRange = (input) => {
    const min = Number(input.min) || 0;
    const max = Number(input.max) || 100;
    const pct = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--fill', pct.toFixed(1) + '%');
  };

  ['#brightness', '#volume'].forEach((sel) => {
    const input = $(sel);
    if (!input) return;
    paintRange(input);
    input.addEventListener('input', () => paintRange(input));
  });

  const vol = $('#volume');
  vol.addEventListener('input', () => toast(`Volumen ${vol.value}%`));

  const bright = $('#brightness');
  const dim = document.createElement('div');
  dim.className = 'dim-layer';
  dim.style.cssText = 'position:absolute;inset:0;background:#000;pointer-events:none;z-index:890;transition:opacity .15s linear;opacity:0';
  document.body.appendChild(dim);
  const applyBright = () => {
    const v = Number(bright.value);
    dim.style.opacity = String(Math.max(0, (100 - v) / 100) * 0.55);
  };
  bright.addEventListener('input', applyBright);
  applyBright();
}

/* ---------------------------- Menú superior ---------------------------- */

const APPLE_MENU = [
  ['Acerca de LiquidOS', () => openAbout(), ''],
  ['Ajustes del Sistema…', () => openApp('ajustes'), ''],
  ['—', null, ''],
  ['Suspender', () => toast('Suspender no está disponible en la demo'), ''],
  ['Reiniciar…', () => toast('Reiniciar: demo'), ''],
  ['Apagar…', () => toast('Apagar: demo'), '']
];

const GENERIC_MENU = {
  Archivo: [['Nueva ventana', () => openApp('archivos'), '⌘N'], ['Cerrar ventana', () => closeFocused(), '⌘W'], ['—'], ['Imprimir…', null, '⌘P']],
  Editar: [['Deshacer', null, '⌘Z'], ['Rehacer', null, '⇧⌘Z'], ['—'], ['Cortar', null, '⌘X'], ['Copiar', null, '⌘C'], ['Pegar', null, '⌘V']],
  Ver: [['Vista previa del escritorio', null, ''], ['Pantalla completa', null, '⌃⌘F'], ['—'], ['Mostrar barra de menús', null, '']],
  Ventana: [['Minimizar', () => closeFocused(true), '⌘M'], ['Zoom', null, ''], ['—'], ['Traer todo al frente', null, '']],
  Ayuda: [['Manual de LiquidOS', () => toast('Manual disponible en docs/'), ''], ['Atajos de teclado', () => toast('Ctrl+Espacio · Esc · ⌘W'), ''], ['—'], ['Acerca de LiquidOS', () => openAbout(), '']]
};

function closeFocused(minimize = false) {
  const focused = [...state.open.entries()].find(([, v]) => v.el.classList.contains('focused'));
  if (!focused) return;
  if (minimize) animateMinimize(focused[0]);
  else closeWin(focused[0]);
}

function showMenu(x, y, items) {
  const pop = $('#menuPop');
  pop.innerHTML = items.map(([label, fn, hint]) => {
    if (label === '—') return '<hr>';
    return `<button data-item>${label}<span>${hint || ''}</span></button>`;
  }).join('');

  pop.hidden = false;
  pop.style.left = Math.min(x, window.innerWidth - 250) + 'px';
  pop.style.top = y + 'px';

  const buttons = [...pop.querySelectorAll('button[data-item]')];
  const real = items.filter((i) => i[0] !== '—');
  buttons.forEach((b, i) => {
    b.addEventListener('click', () => {
      pop.hidden = true;
      const fn = real[i] && real[i][1];
      if (fn) fn();
    });
  });
}

function setupMenus() {
  $('#appleBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    showMenu(r.left - 6, 36, APPLE_MENU);
    $('#controlCenter').hidden = true;
  });

  document.querySelectorAll('.menus button').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = e.currentTarget.getBoundingClientRect();
      showMenu(r.left, 34, GENERIC_MENU[b.dataset.menu] || []);
      $('#controlCenter').hidden = true;
    });
  });

  $('#searchBtn').addEventListener('click', openSpotlight);

  // Menú contextual del escritorio
  desktop.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.window, .menubar, .dock, .spotlight, .control-center, .menu-pop')) return;
    e.preventDefault();
    showMenu(e.clientX - 14, e.clientY - 8, [
      ['Nueva carpeta', () => toast('Carpeta creada en el Escritorio'), '⇧⌘N'],
      ['Cambiar fondo de pantalla', () => {
        setTheme(state.theme === 'dark' ? 'light' : 'dark');
        toast('Fondo actualizado');
      }, ''],
      ['—', null, ''],
      ['Ajustes del Sistema…', () => openApp('ajustes'), ''],
      ['Mostrar Spotlight', () => openSpotlight(), '⌃Space'],
      ['—', null, ''],
      ['Ordenar iconos', () => toast('Iconos ordenados por nombre'), '']
    ]);
  });

  document.addEventListener('click', () => {
    $('#menuPop').hidden = true;
    $('#controlCenter').hidden = true;
  });

  window.addEventListener('keydown', (e) => {
    const spotOpen = !spot.hidden;

    if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
      e.preventDefault();
      spotOpen ? closeSpotlight() : openSpotlight();
      return;
    }
    if (spotOpen) {
      if (e.key === 'Escape') { e.preventDefault(); closeSpotlight(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); moveSpot(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSpot(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); launchSpot(spotIndex); }
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      closeFocused();
    }
    if (e.key === 'Escape') {
      $('#menuPop').hidden = true;
      $('#controlCenter').hidden = true;
    }
  });

  spot.addEventListener('click', (e) => {
    if (e.target === spot) closeSpotlight();
  });
  spotInput.addEventListener('input', () => renderSpotResults(spotInput.value));
}

/* ---------------------------- Reloj ---------------------------- */

function setupClock() {
  const el = $('#clock');
  const tick = () => {
    const now = new Date();
    const date = new Intl.DateTimeFormat('es-ES', {
      weekday: 'short', day: 'numeric', month: 'short'
    }).format(now).replace(',', '');
    const time = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(now);
    el.textContent = `${date} ${time}`;
    el.title = now.toLocaleString('es-ES');
  };
  tick();
  setInterval(tick, 15000);
}

/* ---------------------------- Arranque ---------------------------- */

const BOOT_STAGES = [
  [0.00, 'Comprobando el hardware…'],
  [0.16, 'Montando el sistema de archivos…'],
  [0.34, 'Iniciando servicios del sistema…'],
  [0.54, 'Cargando el entorno gráfico…'],
  [0.74, 'Aplicando tu apariencia…'],
  [0.90, 'Preparando tu espacio de trabajo…']
];

function setupBoot() {
  const boot = $('#boot');
  const bar = $('#bootBar');
  const status = $('#bootStatus');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reduce ? 900 : 2600;
  let started = null;
  let stage = -1;
  let finished = false;

  const setStatus = (text) => {
    if (!status || status.textContent === text) return;
    status.style.opacity = '0';
    setTimeout(() => { status.textContent = text; status.style.opacity = ''; }, 120);
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    if (bar) bar.style.width = '100%';
    setTimeout(() => {
      boot.classList.add('gone');
      document.body.classList.add('ready');
      state.booted = true;
      setTimeout(() => {
        if (!state.open.size) openApp('archivos');
      }, 420);
    }, reduce ? 60 : 320);
  };

  const step = (now) => {
    if (started === null) started = now;
    const t = Math.min(1, (now - started) / duration);

    // Curva de progreso: rápida al inicio, se asienta al final.
    const eased = t < 0.85 ? 1 - Math.pow(1 - t / 0.85, 1.7) : 1;
    if (bar) bar.style.width = (eased * 100).toFixed(1) + '%';

    for (let i = BOOT_STAGES.length - 1; i >= 0; i--) {
      if (t >= BOOT_STAGES[i][0]) {
        if (stage !== i) { stage = i; setStatus(BOOT_STAGES[i][1]); }
        break;
      }
    }

    if (t < 1) requestAnimationFrame(step);
    else finish();
  };

  requestAnimationFrame(step);
  boot.addEventListener('click', finish);
  window.addEventListener('keydown', function skip(e) {
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
      finish();
      window.removeEventListener('keydown', skip);
    }
  });
}

/* ---------------------------- Init ---------------------------- */

buildDock();
setupMenus();
setupControlCenter();
setupClock();
setupBoot();
setTheme('dark');
renderSpotResults('');
