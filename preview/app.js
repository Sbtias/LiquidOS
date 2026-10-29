/* ============================================================
   LiquidOS — escritorio de demostración (vista previa web)
   Simula el shell de LiquidOS: barra de menús, Dock, ventanas,
   Spotlight, Centro de control y todas las apps de muestra.
   Todos los controles están conectados a una acción real.
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

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
  wifi: '<path d="M2 6.4a15 15 0 0 1 20 0M5.4 9.8a10 10 0 0 1 13.2 0M8.7 13.2a5.5 5.5 0 0 1 6.6 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="16.2" r="1.4" fill="currentColor"/>',
  back: '<path d="M14.6 5.4 8 12l6.6 6.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  forward: '<path d="M9.4 5.4 16 12l-6.6 6.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  reload: '<path d="M19.4 12a7.4 7.4 0 1 1-2.3-5.3M19.4 5.2v4.4h-4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  play: '<path d="M8.4 5.4v13.2L19 12z" fill="currentColor"/>',
  pause: '<rect x="7" y="5.4" width="3.6" height="13.2" rx="1.1" fill="currentColor"/><rect x="13.4" y="5.4" width="3.6" height="13.2" rx="1.1" fill="currentColor"/>',
  prev: '<path d="M6.6 5.4v13.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M18.4 6.2v11.6L8.8 12z" fill="currentColor"/>',
  next: '<path d="M17.4 5.4v13.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M5.6 6.2v11.6L15.2 12z" fill="currentColor"/>',
  volume: '<path d="M4 9.4h3.2L12 5.6v12.8L7.2 14.6H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M15.2 9.2a4 4 0 0 1 0 5.6M17.6 6.8a7.4 7.4 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  lock: '<rect x="5.4" y="10.4" width="13.2" height="9.4" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  check: '<path d="m5 12.6 4.4 4.4L19 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  send: '<path d="M4 12 20 4l-4 16-4.4-6.4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  reply: '<path d="M9.6 6 4 11.4 9.6 17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 11.4h8.4a6 6 0 0 1 6 6v1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  moon: '<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.6 8.6 0 1 0 20.5 14.2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  bell: '<path d="M6 16V10a6 6 0 0 1 12 0v6l2 2H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  plus: '<path d="M12 5.4v13.2M5.4 12h13.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  power: '<path d="M12 3.6v8M7.2 6.4a7 7 0 1 0 9.6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  grid: '<rect x="4" y="4" width="6.4" height="6.4" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="13.6" y="4" width="6.4" height="6.4" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="13.6" width="6.4" height="6.4" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  firefox: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M15.8 6.4c-3.7-.7-7 1.4-7.8 4.4-.7 2.5.6 4.6 2.7 5.4 2.3.9 4.8-.3 5.6-2.4.7-1.9-.2-3.7-1.9-4.4-1.7-.6-3.4.2-4 1.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  bird: '<path d="M4.2 16.2c3.2-1 4.8-3.6 5.2-6.9.2-1.7 1.5-3 3.2-3 1.9 0 3.4 1.5 3.4 3.4 0 .7-.2 1.3-.5 1.8 1.7.2 3 1.3 3.5 2.7-2.1.4-3.8 1.5-5 3.2-1.3 1.8-3.2 2.8-5.4 2.8-1.7 0-3.3-.6-4.4-1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  store: '<path d="M5 8.4h14l-1 11.2a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.6 8.4V6.6a3.4 3.4 0 0 1 6.8 0v1.8" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  palette: '<path d="M12 3.4a8.6 8.6 0 1 0 0 17.2c1.4 0 2-1 2-1.9 0-.6-.3-1.1-.3-1.7 0-1 .8-1.7 1.8-1.7h1.6a3.5 3.5 0 0 0 3.5-3.5c0-4.4-3.9-8.4-8.6-8.4z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8.6" cy="9.2" r="1.1" fill="currentColor"/><circle cx="12.4" cy="7.4" r="1.1" fill="currentColor"/><circle cx="16" cy="9.6" r="1.1" fill="currentColor"/>',
  info: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 10.6v6M12 7.4v.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  downloadCloud: '<path d="M7.4 17.6h9.2a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6-1.2 3.8 3.8 0 0 0 0 8.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10.4v5.2M9.8 13.4 12 15.6l2.2-2.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
};

const svg = (name, extra = '') =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${GLYPHS[name] || ''}</svg>`;

const icons = (name) => svg(name);

/* ---------------------------- Apps ---------------------------- */

const APPS = [
  { id: 'archivos',  name: 'Archivos',  glyph: 'folder',   c1: '#6fc0ff', c2: '#1a6fe0', w: 830, h: 520 },
  { id: 'navegador', name: 'Firefox',   glyph: 'firefox',  c1: '#ff9d5c', c2: '#cf3316', w: 920, h: 600 },
  { id: 'correo',    name: 'Thunderbird', glyph: 'bird',   c1: '#7fc4ff', c2: '#17509f', w: 800, h: 520 },
  { id: 'software',  name: 'Centro de software', glyph: 'store', c1: '#8fd4ff', c2: '#3b6fd8', w: 880, h: 580 },
  { id: 'notas',     name: 'Notas',     glyph: 'notes',    c1: '#ffe27a', c2: '#f0a51e', w: 720, h: 470 },
  { id: 'musica',    name: 'Música',    glyph: 'music',    c1: '#ff8fb1', c2: '#c2185b', w: 680, h: 470 },
  { id: 'terminal',  name: 'Terminal',  glyph: 'terminal', c1: '#4b5262', c2: '#171a22', w: 720, h: 450 },
  { id: 'ajustes',   name: 'Ajustes',   glyph: 'settings', c1: '#c9d1e0', c2: '#7d8798', w: 800, h: 580 }
];

const byId = Object.fromEntries(APPS.map((a) => [a.id, a]));

/* -------------------- Sistema de archivos (demo) -------------------- */

const FS = {
  inicio: {
    label: 'Inicio',
    items: [
      { name: 'Documentos', type: 'folder', to: 'documentos', cls: 'folder-doc' },
      { name: 'Imágenes', type: 'folder', to: 'imagenes', cls: 'folder-img' },
      { name: 'Música', type: 'folder', to: 'musica', cls: 'folder-mus' },
      { name: 'Descargas', type: 'folder', to: 'descargas' },
      { name: 'Proyectos', type: 'folder', to: 'proyectos', cls: 'folder-doc' },
      { name: 'Capturas', type: 'folder', to: 'capturas', cls: 'folder-img' },
      { name: 'Escritorio', type: 'folder', to: 'escritorio' },
      { name: 'Vídeos', type: 'folder', to: 'videos', cls: 'folder-img' },
      { name: 'bienvenida.txt', type: 'doc', meta: '2 KB' }
    ]
  },
  documentos: {
    label: 'Documentos',
    items: [
      { name: 'notas-reunion.md', type: 'doc', meta: '6 KB', important: true },
      { name: 'manual-liquidos.pdf', type: 'pkg', meta: '1,8 MB' },
      { name: 'presupuesto.ods', type: 'pkg', meta: '48 KB' },
      { name: 'capturas', type: 'folder', to: 'capturas', cls: 'folder-img' }
    ]
  },
  imagenes: {
    label: 'Imágenes',
    items: [
      { name: 'fondo-oscuro.png', type: 'img', meta: '1,2 MB' },
      { name: 'fondo-claro.png', type: 'img', meta: '1,1 MB' },
      { name: 'captura-escritorio.png', type: 'img', meta: '820 KB', important: true },
      { name: 'detalle-dock.png', type: 'img', meta: '410 KB' }
    ]
  },
  musica: {
    label: 'Música',
    items: [
      { name: 'oceano-de-datos.mp3', type: 'aud', meta: '3:42' },
      { name: 'vidrio-templado.mp3', type: 'aud', meta: '4:10' },
      { name: 'marea-lenta.mp3', type: 'aud', meta: '2:58' }
    ]
  },
  descargas: {
    label: 'Descargas',
    items: [
      { name: 'LiquidOS-1.0-amd64.iso', type: 'pkg', meta: '2,4 GB', important: true },
      { name: 'liquidos-1.0-amd64.iso.sha256', type: 'doc', meta: '96 B' },
      { name: 'build.log', type: 'doc', meta: '312 KB' },
      { name: 'captura-arranque.png', type: 'img', meta: '300 KB' }
    ]
  },
  proyectos: {
    label: 'Proyectos',
    items: [
      { name: 'liquidos', type: 'folder', to: 'liquidos', cls: 'folder-doc' },
      { name: 'ideas.md', type: 'doc', meta: '4 KB', important: true },
      { name: 'paleta.svg', type: 'img', meta: '12 KB' }
    ]
  },
  liquidos: {
    label: 'Proyectos / liquidos',
    items: [
      { name: 'README.md', type: 'doc', meta: '8 KB' },
      { name: 'preview', type: 'folder', to: 'inicio', cls: 'folder-doc' },
      { name: 'docs', type: 'folder', to: 'proyectos', cls: 'folder-doc' }
    ]
  },
  capturas: {
    label: 'Capturas',
    items: [
      { name: 'escritorio-oscuro.png', type: 'img', meta: '293 KB' },
      { name: 'escritorio-claro.png', type: 'img', meta: '438 KB' },
      { name: 'spotlight.png', type: 'img', meta: '245 KB' },
      { name: 'arranque.png', type: 'img', meta: '307 KB' }
    ]
  },
  escritorio: { label: 'Escritorio', items: [] },
  videos: { label: 'Vídeos', items: [] },
  importante: {
    label: 'Importante',
    items: [
      { name: 'notas-reunion.md', type: 'doc', meta: '6 KB' },
      { name: 'captura-escritorio.png', type: 'img', meta: '820 KB' },
      { name: 'LiquidOS-1.0-amd64.iso', type: 'pkg', meta: '2,4 GB' },
      { name: 'ideas.md', type: 'doc', meta: '4 KB' }
    ]
  }
};

/* ---------------------------- Música ---------------------------- */

const MUSIC_TRACKS = [
  { title: 'Océano de datos', artist: 'Liquid Sound', album: 'Ambiente', dur: '3:42', sec: 222 },
  { title: 'Vidrio templado', artist: 'Liquid Sound', album: 'Ambiente', dur: '4:10', sec: 250 },
  { title: 'Marea lenta', artist: 'Nocturno', album: 'Nocturno', dur: '2:58', sec: 178 },
  { title: 'Azul profundo', artist: 'Nocturno', album: 'Nocturno', dur: '5:06', sec: 306 },
  { title: 'Destello', artist: 'Liquid Sound', album: 'Destello', dur: '3:21', sec: 201 }
];

/* ---------------------------- Redes ---------------------------- */

const NETWORKS = [
  { name: 'liquido-5G', lock: true, signal: 3, known: true },
  { name: 'Casa-2.4', lock: true, signal: 2, known: true },
  { name: 'Vecino_5G', lock: true, signal: 2, known: false },
  { name: 'LiquidOS-Invitados', lock: false, signal: 3, known: false }
];

/* ---------------------------- Correo ---------------------------- */

const MAILBOXES = {
  inbox: [
    { id: 'm1', from: 'Equipo LiquidOS', subject: 'Bienvenido a la beta de Torrente', when: 'Hoy', unread: true, body: 'Hola:\n\nGracias por probar LiquidOS 1.0 «Torrente». Esta compilación incluye el nuevo splash de arranque, el Dock con magnificación y el Centro de control renovado.\n\nSi encuentras algún fallo, adjunta el resultado de `liquidos-report` en el repositorio.\n\n— El equipo de LiquidOS' },
    { id: 'm2', from: 'Actualizaciones', subject: 'Tu sistema está al día', when: 'Ayer', unread: false, body: 'Se han instalado 12 actualizaciones de seguridad.\n\nKernel 6.1.0-liquidos-amd64 · GNOME 43 · WhiteSur 2026-10.\nNo es necesario reiniciar.' },
    { id: 'm3', from: 'Diseño', subject: 'Nueva paleta para el Dock', when: 'Ayer', unread: false, body: 'Probamos una versión con menos saturación en el cristal del Dock y un indicador de app abierta más discreto.\n\nEl contraste en modo claro sube un 8 %. ¿Lo dejamos así para la 1.0?' },
    { id: 'm4', from: 'GNOME', subject: 'Notas de la versión 46', when: 'Lun', unread: false, body: 'GNOME 43 llega con mejoras en Nautilus, búsqueda global más rápida y escalado fraccional experimental.\n\nLiquidOS activa `scale-monitor-framebuffer` por defecto.' },
    { id: 'm5', from: 'Comunidad', subject: 'Reporte mensual de la distro', when: 'Vie', unread: false, body: 'Este mes: 1 240 descargas de la ISO, 38 incidencias cerradas y 6 nuevas traducciones.\n\nGracias por hacer crecer el proyecto.' }
  ],
  sent: [
    { id: 's1', from: 'Yo', subject: 'Re: Nueva paleta para el Dock', when: 'Ayer', unread: false, body: 'Me gusta la dirección. Mantengamos el indicador discreto y subamos un poco el contraste en claro.\n\n— Sebastián' }
  ],
  archive: [
    { id: 'a1', from: 'Infraestructura', subject: 'Compilación nocturna completada', when: 'Hace 3 días', unread: false, body: 'La ISO nightly se generó correctamente y pasó las comprobaciones de arranque en BIOS y UEFI.' }
  ]
};

/* ------------------------ Personalización ------------------------ */

const WALLS = [
  { id: 'torrente', name: 'Torrente' },
  { id: 'aurora', name: 'Aurora' },
  { id: 'oceano', name: 'Océano' },
  { id: 'bosque', name: 'Bosque' },
  { id: 'atardecer', name: 'Atardecer' },
  { id: 'grafito', name: 'Grafito' }
];

const ACCENTS = [
  { id: 'azul', name: 'Azul', color: '#5aa9ff' },
  { id: 'purpura', name: 'Púrpura', color: '#a78bfa' },
  { id: 'rosa', name: 'Rosa', color: '#ff8fb1' },
  { id: 'rojo', name: 'Rojo', color: '#ff6b6b' },
  { id: 'naranja', name: 'Naranja', color: '#ffa657' },
  { id: 'verde', name: 'Verde', color: '#4ade80' },
  { id: 'turquesa', name: 'Turquesa', color: '#2fd1c5' },
  { id: 'grafito', name: 'Grafito', color: '#9aa6bd' }
];

/* ---------------------- Centro de software ---------------------- */

const CATALOG = [
  { id: 'firefox', name: 'Firefox', summary: 'Navegador web rápido y privado', cat: 'Internet', size: '78 MB', rating: 4.8, glyph: 'firefox', c1: '#ff9d5c', c2: '#cf3316', app: 'navegador', core: true },
  { id: 'thunderbird', name: 'Thunderbird', summary: 'Correo, calendario y contactos', cat: 'Internet', size: '64 MB', rating: 4.6, glyph: 'bird', c1: '#7fc4ff', c2: '#17509f', app: 'correo', core: true },
  { id: 'terminal', name: 'Terminal', summary: 'Consola del sistema con zsh', cat: 'Sistema', size: '12 MB', rating: 4.7, glyph: 'terminal', c1: '#4b5262', c2: '#171a22', app: 'terminal', core: true },
  { id: 'vlc', name: 'VLC', summary: 'Reproduce cualquier vídeo o audio', cat: 'Multimedia', size: '112 MB', rating: 4.7, glyph: 'play', c1: '#ffb347', c2: '#e05a00' },
  { id: 'gimp', name: 'GIMP', summary: 'Edición de imágenes profesional', cat: 'Diseño', size: '148 MB', rating: 4.5, glyph: 'image', c1: '#a7a7a7', c2: '#4b4b4b' },
  { id: 'libreoffice', name: 'LibreOffice', summary: 'Documentos, hojas de cálculo y más', cat: 'Productividad', size: '320 MB', rating: 4.4, glyph: 'doc', c1: '#9ad0ff', c2: '#2f6fb8' },
  { id: 'obs', name: 'OBS Studio', summary: 'Grabación y transmisión en directo', cat: 'Multimedia', size: '190 MB', rating: 4.6, glyph: 'desktop', c1: '#8f9bb3', c2: '#2b3346' },
  { id: 'spotify', name: 'Spotify', summary: 'Música en streaming', cat: 'Multimedia', size: '210 MB', rating: 4.3, glyph: 'music', c1: '#63e6a8', c2: '#0f7a4a' },
  { id: 'telegram', name: 'Telegram', summary: 'Mensajería instantánea', cat: 'Internet', size: '86 MB', rating: 4.5, glyph: 'send', c1: '#7cd4ff', c2: '#1f7fc4' },
  { id: 'discord', name: 'Discord', summary: 'Chat de voz y comunidades', cat: 'Internet', size: '165 MB', rating: 4.2, glyph: 'grid', c1: '#9aa6ff', c2: '#4752c4' },
  { id: 'vscode', name: 'Visual Studio Code', summary: 'Editor de código con extensiones', cat: 'Desarrollo', size: '310 MB', rating: 4.7, glyph: 'terminal', c1: '#6fb8ff', c2: '#1e5f9e' },
  { id: 'blender', name: 'Blender', summary: 'Modelado 3D, animación y render', cat: 'Diseño', size: '480 MB', rating: 4.8, glyph: 'grid', c1: '#ffb27a', c2: '#d4611c' },
  { id: 'krita', name: 'Krita', summary: 'Pintura digital e ilustración', cat: 'Diseño', size: '260 MB', rating: 4.6, glyph: 'palette', c1: '#ff9ec4', c2: '#a3175c' },
  { id: 'inkscape', name: 'Inkscape', summary: 'Diseño vectorial y SVG', cat: 'Diseño', size: '180 MB', rating: 4.4, glyph: 'tag', c1: '#b8c6db', c2: '#5b6a83' },
  { id: 'transmission', name: 'Transmission', summary: 'Descargas BitTorrent ligeras', cat: 'Internet', size: '18 MB', rating: 4.3, glyph: 'download', c1: '#ff8f8f', c2: '#b62b2b' },
  { id: 'keepassxc', name: 'KeePassXC', summary: 'Gestor de contraseñas local', cat: 'Utilidades', size: '62 MB', rating: 4.7, glyph: 'lock', c1: '#9ad0a0', c2: '#2f7a45' },
  { id: 'steam', name: 'Steam', summary: 'Tienda y biblioteca de juegos', cat: 'Juegos', size: '420 MB', rating: 4.1, glyph: 'grid', c1: '#88a9d8', c2: '#1b3b5f' },
  { id: 'calculator', name: 'Calculadora', summary: 'Cálculos rápidos y conversiones', cat: 'Utilidades', size: '6 MB', rating: 4.2, glyph: 'plus', c1: '#c9d1e0', c2: '#7d8798' }
];

const SOFTWARE_CATS = ['todas', 'Internet', 'Productividad', 'Multimedia', 'Diseño', 'Desarrollo', 'Utilidades', 'Juegos', 'Sistema'];


const state = {
  open: new Map(),          // id -> { el, min, rect }
  z: 10,
  cascade: 0,
  theme: 'dark',
  mag: true,
  anim: true,
  booted: false,
  menubarHidden: false,
  prefs: {
    accent: '#5aa9ff',
    wall: 'torrente',
    dockPos: 'bottom',
    blur: true,
    buttons: 'left',
    deskSize: 48,
    radius: 14
  },
  software: {
    tab: 'descubrir',
    query: '',
    cat: 'todas',
    progress: {},
    installed: ['firefox', 'thunderbird', 'terminal'],
    updates: ['vlc', 'gimp'],
    status: null,
    statusLoading: false,
    real: [],
    realQuery: '',
    realLoading: false,
    realError: '',
    installedReal: null,
    installedLoading: false,
    installedError: '',
    updatesReal: null,
    updatesLoading: false,
    updatesError: '',
    jobs: {},
    notice: null,
    searchTimer: null
  },
  web: {
    pages: {},
    loading: {},
    errors: {}
  },
  system: {
    wifi: true,
    wifiNetwork: 'liquido-5G',
    bt: false,
    dnd: false,
    snd: true,
    autoDark: false,
    dockAuto: false,
    dockSize: 52,
    brightness: 88,
    volume: 45,
    mute: false,
    night: false,
    lowPower: false,
    output: 'Altavoces internos',
    resolution: '1920 × 1080'
  },
  views: {
    archivos: { path: 'inicio', stack: ['inicio'], selected: null, query: '' },
    navegador: { tabs: [{ stack: ['inicio'], index: 0 }], active: 0, query: '', favs: ['inicio'], history: ['inicio'] },
    correo: { box: 'inbox', selected: null, compose: null, query: '' },
    terminal: { cwd: '/home/sebas' },
    notas: {
      index: 0,
      notes: [
        {
          title: 'Bienvenido',
          preview: 'LiquidOS es una distro basada en Debian…',
          html: '<h2>Bienvenido a LiquidOS</h2><div class="date">28 de octubre de 2026 · 09:41</div><p>Este es el escritorio de <b>LiquidOS</b>, una distribución de Linux basada en Debian que toma la calma visual de macOS y la combina con la libertad del software libre.</p><ul><li>Barra de menús translúcida con blur real.</li><li>Dock con magnificación y ventanas arrastrables.</li><li>Spotlight con <b>Ctrl + Espacio</b>.</li><li>Centro de control con modo claro y oscuro.</li></ul><p style="color:var(--text-dim)">Puedes escribir aquí: esta nota es editable.</p>'
        },
        {
          title: 'Ideas',
          preview: 'Dock con magnificación, Spotlight…',
          html: '<h2>Ideas para la próxima versión</h2><div class="date">27 de octubre de 2026</div><p>Cosas que quiero probar en LiquidOS 1.1:</p><ul><li>Ventanas con esquinas más suaves y sombra en dos capas.</li><li>Un modo «enfoque» para el Dock.</li><li>Sonidos de interfaz discretos al abrir y cerrar.</li></ul>'
        },
        {
          title: 'Compilar',
          preview: 'make iso · make look · make preview',
          html: '<h2>Compilar y probar</h2><div class="date">26 de octubre de 2026</div><p>Atajos del repositorio:</p><ul><li><b>make preview</b> — abre esta demo.</li><li><b>make iso</b> — construye la ISO con Docker.</li><li><b>make native</b> — compila en Debian con sudo.</li><li><b>make look</b> — aplica el aspecto a un Debian existente.</li></ul>'
        }
      ]
    },
    musica: { index: 0, playing: false, progress: 0, filter: 'todas' },
    ajustes: { section: 'apariencia' }
  },
  desktopIcons: []
};

const desktop = $('#desktop');
const windowsLayer = $('#windows');
const dock = $('#dock');
const desktopIconsEl = $('#desktopIcons');

const AUX_TITLES = {};

/* Capas de sistema: brillo, luz nocturna y panel emergente */
const dimLayer = document.createElement('div');
dimLayer.className = 'dim-layer';
desktop.appendChild(dimLayer);

const nightLayer = document.createElement('div');
nightLayer.className = 'night-layer';
desktop.appendChild(nightLayer);

const flyout = document.createElement('div');
flyout.className = 'flyout';
flyout.id = 'flyout';
flyout.hidden = true;
desktop.appendChild(flyout);

/* ---------------------------- Utilidades ---------------------------- */

let toastTimer;
function toast(msg, ms = 2200) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, ms);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Llamadas a la API local de la vista previa (navegador y tienda). */
async function api(path, opts = {}) {
  const init = { method: opts.method || 'GET', headers: {} };
  if (opts.body !== undefined) {
    init.headers['content-type'] = 'application/json';
    init.body = JSON.stringify(opts.body);
  }
  const res = await fetch(path, init);
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Respuesta no válida del servidor (HTTP ${res.status})`);
  }
  if (!res.ok && data.ok !== false) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

function paintRange(input) {
  const min = Number(input.min) || 0;
  const max = Number(input.max) || 100;
  const pct = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty('--fill', pct.toFixed(1) + '%');
}

let audioCtx;
function beep(freq = 880) {
  if (!state.system.snd) { toast('Los sonidos del sistema están desactivados'); return; }
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const vol = state.system.mute ? 0 : Math.max(0.01, state.system.volume / 100) * 0.06;
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch {
    toast('El navegador bloqueó el audio');
  }
}

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
      trash.addEventListener('click', () => toast('La papelera está vacía · 0 elementos'));
      dock.appendChild(trash);
    }
  });

  dock.addEventListener('pointermove', magnify);
  dock.addEventListener('pointerleave', resetMagnify);
}

function magnify(e) {
  if (!state.mag) return;
  const items = $$('.dock-item', dock);
  const vertical = document.body.classList.contains('dock-left') || document.body.classList.contains('dock-right');
  const sigma = vertical ? 70 : 78;
  items.forEach((el) => {
    const r = el.getBoundingClientRect();
    const d = vertical
      ? e.clientY - (r.top + r.height / 2)
      : e.clientX - (r.left + r.width / 2);
    const s = 1 + 0.34 * Math.exp(-(d * d) / (2 * sigma * sigma));
    el.style.setProperty('--s', s.toFixed(3));
    el.style.transform = vertical
      ? `scale(${s.toFixed(3)})`
      : `translateY(${(-(s - 1) * 16).toFixed(2)}px) scale(${s.toFixed(3)})`;
  });
}

function resetMagnify() {
  $$('.dock-item', dock).forEach((el) => {
    el.style.setProperty('--s', '1');
    el.style.transform = '';
  });
}

/* ---------------------------- Ventanas ---------------------------- */

function onDockClick(id) {
  const entry = state.open.get(id);
  if (!entry) return openApp(id);
  if (entry.min) return restoreWin(id);
  if (entry.el.classList.contains('focused')) animateMinimize(id);
  else focusWin(id);
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
  $('.app-name').textContent = byId[id] ? byId[id].name : (AUX_TITLES[id] || 'Escritorio');
}

function openApp(id, opts = {}) {
  if (id === 'acerca') return openAbout();
  const app = byId[id];
  if (!app) return;

  if (id === 'ajustes' && opts.section) state.views.ajustes.section = opts.section;
  if (id === 'archivos' && opts.path && FS[opts.path]) {
    state.views.archivos.path = opts.path;
    state.views.archivos.stack = [opts.path];
    state.views.archivos.selected = null;
    state.views.archivos.query = '';
  }

  const entry = state.open.get(id);
  if (entry) {
    if (entry.min) restoreWin(id);
    else { focusWin(id); bounce(id); }
    if (opts.section || opts.path) rerenderWindow(id);
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
  wireWindowChrome(win, id);
  wireWindow(id, win);

  const dockItem = dock.querySelector(`[data-app="${id}"]`);
  if (dockItem) dockItem.classList.add('running');
}

function cssEscape(value) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (c) => '\\' + c);
}

/* Selector estable para devolver el foco a un campo tras repintar la ventana.
 * Sin esto, escribir en un buscador mientras llegan resultados hace que el
 * foco se pierda y solo se pueda teclear una letra cada vez. */
function focusSelector(el) {
  for (const attr of el.attributes) {
    if (!attr.name.startsWith('data-') || attr.name === 'data-web-frame') continue;
    return attr.value
      ? `[${attr.name}="${cssEscape(attr.value)}"]`
      : `[${attr.name}]`;
  }
  if (el.id) return '#' + cssEscape(el.id);
  return null;
}

function rerenderWindow(id) {
  const entry = state.open.get(id);
  if (!entry) return;
  const body = entry.el.querySelector('.win-body');
  const active = document.activeElement;
  const inside = active && active !== document.body && body.contains(active);
  const editable = inside && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
  const selector = editable ? focusSelector(active) : null;
  const caret = editable && typeof active.selectionStart === 'number'
    ? [active.selectionStart, active.selectionEnd]
    : null;
  const scroll = body.scrollTop;

  body.innerHTML = render(id);
  wireWindow(id, entry.el);

  if (selector) {
    const next = body.querySelector(selector);
    if (next) {
      next.focus({ preventScroll: true });
      if (caret) {
        try { next.setSelectionRange(caret[0], caret[1]); } catch { /* sin selección */ }
      }
    }
  }
  body.scrollTop = scroll;
}

function closeWin(id) {
  const entry = state.open.get(id);
  if (!entry) return;
  const el = entry.el;
  el.classList.add('closed');
  setTimeout(() => el.remove(), 160);
  state.open.delete(id);

  const dockItem = dock.querySelector(`[data-app="${id}"]`);
  if (dockItem) dockItem.classList.remove('running');

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

function wireWindowChrome(win, id) {
  win.querySelector('.dot.close').addEventListener('click', () => closeWin(id));
  win.querySelector('.dot.min').addEventListener('click', () => animateMinimize(id));
  win.querySelector('.dot.max').addEventListener('click', () => toggleMax(id));
  win.addEventListener('pointerdown', () => focusWin(id), true);
  const head = win.querySelector('.window-head');
  head.addEventListener('pointerdown', (e) => startDrag(e, win, id));
  head.addEventListener('dblclick', (e) => {
    if (!e.target.closest('.dot')) toggleMax(id);
  });
}

/* ---------------------------- Apariencia ---------------------------- */

function setAnim(on) {
  state.anim = on;
  document.body.classList.toggle('no-anim', !on);
}

function setTheme(mode) {
  state.theme = mode === 'light' ? 'light' : 'dark';
  document.body.classList.toggle('light', state.theme === 'light');
  document.body.classList.toggle('dark', state.theme === 'dark');

  const label = $('#appearanceLabel');
  if (label) label.textContent = state.theme === 'dark' ? 'Oscuro' : 'Claro';

  const tile = $('#ccThemeTile');
  if (tile) tile.dataset.on = 'true';

  $$('.seg button, .seg2 button').forEach((b) => {
    b.classList.toggle('on', b.dataset.theme === state.theme);
  });

  savePrefs();

  if (state.open.has('ajustes')) {
    const active = document.activeElement;
    const editing = active && active.closest('#windows');
    if (!editing) rerenderWindow('ajustes');
  }
}

/* ------------------------ Personalización ------------------------ */

function savePrefs() {
  try {
    const data = {
      theme: state.theme,
      prefs: state.prefs,
      system: { dockAuto: state.system.dockAuto, dockSize: state.system.dockSize, night: state.system.night }
    };
    localStorage.setItem('liquidos.prefs', JSON.stringify(data));
  } catch { /* almacenamiento bloqueado */ }
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem('liquidos.prefs');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.theme === 'light' || data.theme === 'dark') state.theme = data.theme;
    if (data.prefs) Object.assign(state.prefs, data.prefs);
    if (data.system) {
      if (typeof data.system.dockAuto === 'boolean') state.system.dockAuto = data.system.dockAuto;
      if (Number(data.system.dockSize)) state.system.dockSize = Number(data.system.dockSize);
      if (typeof data.system.night === 'boolean') state.system.night = data.system.night;
    }
  } catch { /* datos corruptos: se ignoran */ }
}

function setPref(key, value, announce) {
  state.prefs[key] = value;
  applyPrefs();
  savePrefs();
  if (announce) toast(announce);
  if (state.open.has('ajustes')) rerenderWindow('ajustes');
}

function applyPrefs() {
  const p = state.prefs;
  const root = document.documentElement;
  root.style.setProperty('--accent', p.accent);
  root.style.setProperty('--radius-win', p.radius + 'px');
  root.style.setProperty('--desk-size', p.deskSize + 'px');

  document.body.dataset.wall = p.wall;
  document.body.classList.toggle('dock-left', p.dockPos === 'left');
  document.body.classList.toggle('dock-right', p.dockPos === 'right');
  document.body.classList.toggle('no-blur', !p.blur);
  document.body.classList.toggle('buttons-right', p.buttons === 'right');
}

function resetPrefs() {
  state.prefs = { accent: '#5aa9ff', wall: 'torrente', dockPos: 'bottom', blur: true, buttons: 'left', deskSize: 48, radius: 14 };
  applyPrefs();
  savePrefs();
  if (state.open.has('ajustes')) rerenderWindow('ajustes');
  toast('Apariencia restablecida');
}

/* ---------------------------- Contenidos ---------------------------- */

function render(id) {
  switch (id) {
    case 'archivos': return viewFinder();
    case 'navegador': return viewBrowser();
    case 'correo': return viewMail();
    case 'software': return viewSoftware();
    case 'notas': return viewNotes();
    case 'musica': return viewMusic();
    case 'terminal': return viewTerminal();
    case 'ajustes': return viewSettings();
    default: return '';
  }
}

/* ---------------------------- Archivos ---------------------------- */

function fileIconClass(item) {
  if (item.type === 'folder') return item.cls || '';
  return { doc: 'doc', img: 'img', aud: 'aud', pkg: 'pkg' }[item.type] || '';
}

function finderVisibleItems() {
  const v = state.views.archivos;
  const dir = FS[v.path] || FS.inicio;
  const q = v.query.trim().toLowerCase();
  return dir.items.filter((it) => !q || it.name.toLowerCase().includes(q));
}

function viewFinder() {
  const v = state.views.archivos;
  const dir = FS[v.path] || FS.inicio;
  const items = finderVisibleItems();
  const crumb = v.stack
    .map((p) => (FS[p] ? FS[p].label.split(' / ').pop() : p))
    .join(' / ');

  const places = [
    ['escritorio', 'Escritorio'], ['inicio', 'Inicio'], ['documentos', 'Documentos'],
    ['descargas', 'Descargas'], ['imagenes', 'Imágenes'], ['musica', 'Música']
  ];

  return `
  <div class="finder">
    <aside class="sidebar">
      <h4>Favoritos</h4>
      ${places.map(([path, label]) => `
        <button data-place="${path}" class="${v.path === path ? 'on' : ''}">${icons(path === 'escritorio' ? 'desktop' : path === 'inicio' ? 'home' : path === 'documentos' ? 'doc' : path === 'descargas' ? 'download' : path === 'imagenes' ? 'image' : 'music')}<span>${label}</span></button>`).join('')}
      <h4>Etiquetas</h4>
      <button data-place="importante" class="${v.path === 'importante' ? 'on' : ''}">${icons('tag')}<span>Importante</span></button>
      <button data-place="proyectos" class="${v.path === 'proyectos' ? 'on' : ''}">${icons('tag')}<span>Proyectos</span></button>
    </aside>
    <div class="finder-main">
      <div class="finder-bar">
        <button class="finder-back" data-finder-back title="Atrás" ${v.stack.length < 2 ? 'disabled' : ''}>${icons('back')}</button>
        <span class="pill">${crumb}</span>
        <span data-finder-count>${items.length} elementos · 42,3 GB disponibles</span>
        <input class="finder-search" data-finder-search placeholder="Buscar" value="${escapeHtml(v.query)}" aria-label="Buscar archivos">
      </div>
      <div class="grid">
        ${items.map((it) => `
          <button class="file ${v.selected === it.name ? 'on' : ''}" data-name="${escapeHtml(it.name)}" data-kind="${it.type}" title="${escapeHtml(it.name)}${it.meta ? ' · ' + it.meta : ''}">
            <span class="file-icon ${fileIconClass(it)}"></span>
            <span>${escapeHtml(it.name)}</span>
          </button>`).join('')}
        <div class="finder-empty" data-finder-empty ${items.length ? 'hidden' : ''}>No hay elementos que coincidan.</div>
      </div>
    </div>
  </div>`;
}

function updateFinderStatus(win) {
  const v = state.views.archivos;
  const count = $$('.file', win).filter((f) => !f.hidden).length;
  const el = $('[data-finder-count]', win);
  if (el) {
    el.textContent = `${count} elemento${count === 1 ? '' : 's'} · 42,3 GB disponibles` +
      (v.selected ? ' · 1 seleccionado' : '');
  }
}

function filterFinder(win) {
  const v = state.views.archivos;
  const q = v.query.trim().toLowerCase();
  let visible = 0;
  $$('.file', win).forEach((f) => {
    const match = !q || f.dataset.name.toLowerCase().includes(q);
    f.hidden = !match;
    if (match) visible++;
  });
  const empty = $('[data-finder-empty]', win);
  if (empty) empty.hidden = visible > 0;
  updateFinderStatus(win);
}

function navigateFinder(path) {
  if (!FS[path]) return;
  const v = state.views.archivos;
  v.path = path;
  v.stack.push(path);
  v.query = '';
  v.selected = null;
  rerenderWindow('archivos');
}

function openFinderItem(name) {
  const v = state.views.archivos;
  const dir = FS[v.path] || FS.inicio;
  const item = dir.items.find((it) => it.name === name);
  if (!item) return;

  if (item.type === 'folder') {
    navigateFinder(item.to || 'escritorio');
    return;
  }
  switch (item.type) {
    case 'doc':
      openApp('notas');
      toast(`Abriendo «${item.name}» en Notas`);
      break;
    case 'aud':
      openApp('musica');
      toast(`Abriendo «${item.name}» en Música`);
      break;
    case 'img':
      openImagePreview(item);
      break;
    case 'pkg':
      openApp('navegador');
      browserGo('descargas');
      toast(`«${item.name}» · ${item.meta || 'archivo'} · descarga simulada`);
      break;
    default:
      toast(`«${item.name}» · ${item.meta || 'archivo'}`);
  }
}

function openImagePreview(item) {
  const id = `vista-${item.name}`;
  openAux(id, item.name, `
    <div class="preview-box">
      <div class="preview-img"><span>${icons('image')}</span></div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>Vista previa de demostración · ${escapeHtml(item.meta || 'imagen')}</p>
      <div class="mail-actions">
        <button class="btn primary" data-open-app="archivos">Ver en Archivos</button>
        <button class="btn" data-open-app="ajustes">Ajustes</button>
      </div>
    </div>`, 480, 460);
}

function wireFinder(win) {
  const body = win.querySelector('.win-body');
  const v = state.views.archivos;

  $$('[data-place]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      const path = btn.dataset.place;
      if (!FS[path]) return;
      v.path = path;
      v.stack = [path];
      v.query = '';
      v.selected = null;
      rerenderWindow('archivos');
    });
  });

  const back = $('[data-finder-back]', body);
  if (back) {
    back.addEventListener('click', () => {
      if (v.stack.length < 2) return;
      v.stack.pop();
      v.path = v.stack[v.stack.length - 1];
      v.query = '';
      v.selected = null;
      rerenderWindow('archivos');
    });
  }

  const search = $('[data-finder-search]', body);
  if (search) {
    search.addEventListener('input', () => {
      v.query = search.value;
      filterFinder(win);
    });
  }

  $$('.file', body).forEach((file) => {
    file.addEventListener('click', () => {
      v.selected = v.selected === file.dataset.name ? null : file.dataset.name;
      $$('.file', body).forEach((f) => f.classList.toggle('on', f.dataset.name === v.selected));
      updateFinderStatus(win);
    });
    file.addEventListener('dblclick', () => openFinderItem(file.dataset.name));
  });
}

/* ---------------------------- Navegador ---------------------------- */

const SITE_URL = {
  nueva: 'liquidos.local/nueva',
  inicio: 'liquidos.local/inicio',
  favoritos: 'liquidos.local/favoritos',
  historial: 'liquidos.local/historial',
  descargas: 'liquidos.local/descargas'
};

/* Una entrada del navegador es una página interna («inicio») o una
 * dirección real guardada como «u:https://…». */
function isWebEntry(entry) {
  return typeof entry === 'string' && entry.startsWith('u:');
}

function webUrl(entry) {
  return isWebEntry(entry) ? entry.slice(2) : '';
}

function webHost(entry) {
  try {
    return new URL(webUrl(entry)).hostname.replace(/^www\./, '');
  } catch {
    return 'la web';
  }
}

function webPage(entry) {
  return state.web.pages[entry] || null;
}

function entryUrl(entry) {
  if (isWebEntry(entry)) return webUrl(entry);
  if (entry === 'buscar') {
    return `liquidos.local/buscar?q=${encodeURIComponent(state.views.navegador.query || '')}`;
  }
  return SITE_URL[entry] || SITE_URL.inicio;
}

function sitePageTitle(id) {
  if (isWebEntry(id)) {
    const page = webPage(id);
    return (page && page.title) || webHost(id);
  }
  return {
    nueva: 'Nueva pestaña',
    inicio: 'Inicio',
    favoritos: 'Favoritos',
    historial: 'Historial',
    descargas: 'Descargas',
    buscar: 'Buscar en la web'
  }[id] || 'Inicio';
}

function webStateHtml(entry) {
  const error = state.web.errors[entry];
  const page = webPage(entry);
  if (page) return '';
  if (error) {
    return `
      <div class="web-error">
        <b>No se pudo abrir esta página</b>
        <p>${escapeHtml(error)}</p>
        <div class="web-error-actions">
          <button class="btn primary" data-nav="reload">Reintentar</button>
          <button class="btn" data-quick="https://html.duckduckgo.com/html/?q=${encodeURIComponent(webUrl(entry))}">Buscar en DuckDuckGo</button>
        </div>
      </div>`;
  }
  return `<div class="web-spinner"></div><p>Conectando con <b>${escapeHtml(webHost(entry))}</b>…</p>`;
}

function browserPageHtml(id, b) {
  if (isWebEntry(id)) {
    return `
    <div class="web-wrap">
      <iframe class="web-frame" data-web-frame data-web-entry="${escapeHtml(id)}"
        title="${escapeHtml(sitePageTitle(id))}" sandbox="allow-scripts allow-forms allow-popups"
        referrerpolicy="no-referrer"></iframe>
      <div class="web-state" data-web-state ${webPage(id) ? 'hidden' : ''}>${webStateHtml(id)}</div>
    </div>`;
  }

  if (id === 'buscar') {
    const q = b.query || '';
    return `
    <div class="page start-page">
      <svg class="mark" viewBox="0 0 100 120"><path d="M50 4c14 22 34 44 34 66a34 34 0 1 1-68 0C16 48 36 26 50 4z" fill="#5aa9ff"/></svg>
      <h2>Buscar en la web</h2>
      <p>«${escapeHtml(q)}» se enviará a DuckDuckGo, que devolverá resultados reales.</p>
      <form class="web-search" data-web-form>
        <input data-web-q value="${escapeHtml(q)}" placeholder="Busca en la web" aria-label="Buscar en la web">
        <button class="btn primary" type="submit">Buscar</button>
      </form>
    </div>`;
  }

  if (id === 'nueva') {
    return `
    <div class="page start-page">
      <svg class="mark" viewBox="0 0 100 120"><path d="M50 4c14 22 34 44 34 66a34 34 0 1 1-68 0C16 48 36 26 50 4z" fill="#5aa9ff"/></svg>
      <h2>Nueva pestaña</h2>
      <p>Escribe una dirección o busca en Internet de verdad.</p>
      <form class="web-search" data-web-form>
        <input data-web-q placeholder="Busca en la web o escribe una dirección" aria-label="Buscar en la web">
        <button class="btn primary" type="submit">Buscar</button>
      </form>
      <div class="tiles">
        <button class="tile" data-quick="https://es.wikipedia.org/"><b>W</b>Wikipedia</button>
        <button class="tile" data-quick="https://html.duckduckgo.com/html/?q=noticias"><b>⌕</b>Noticias</button>
        <button class="tile" data-quick="https://flathub.org/"><b>⌂</b>Flathub</button>
        <button class="tile" data-page="favoritos"><b>★</b>Favoritos</button>
      </div>
    </div>`;
  }

  if (id === 'favoritos') {
    const favs = b.favs.filter((f) => f !== 'nueva');
    return `
    <div class="page">
      <h2>Favoritos</h2>
      <p class="lead">Los sitios que guardaste en este equipo.</p>
      ${favs.length ? favs.map((f) => `
        <button class="list-row" ${isWebEntry(f) ? `data-quick="${escapeHtml(webUrl(f))}"` : `data-page="${f}"`}>
          <span class="mini app-icon" style="--c1:#6fc0ff;--c2:#1a6fe0">${icons(f === 'descargas' ? 'download' : f === 'historial' ? 'clock' : 'globe')}</span>
          <span><b>${escapeHtml(sitePageTitle(f))}</b><small>${escapeHtml(entryUrl(f))}</small></span>
          <span class="meta">Guardado</span>
        </button>`).join('') : '<div class="finder-empty">Aún no has guardado ningún favorito. Abre una web y usa la estrella de la barra.</div>'}
    </div>`;
  }

  if (id === 'historial') {
    const seen = [...new Set(b.history)].filter((h) => h !== 'nueva');
    return `
    <div class="page">
      <h2>Historial</h2>
      <p class="lead">Páginas visitadas en esta sesión, incluidas las webs reales.</p>
      ${seen.length ? seen.map((h, i) => `
        <button class="list-row" ${isWebEntry(h) ? `data-quick="${escapeHtml(webUrl(h))}"` : `data-page="${h}"`}>
          <span class="mini app-icon" style="--c1:#6fc0ff;--c2:#1a6fe0">${icons(h === 'descargas' ? 'download' : h === 'favoritos' ? 'tag' : 'globe')}</span>
          <span><b>${escapeHtml(sitePageTitle(h))}</b><small>${escapeHtml(entryUrl(h))}</small></span>
          <span class="meta">${i === 0 ? 'Ahora' : i < 4 ? 'Hoy' : 'Esta sesión'}</span>
        </button>`).join('') : '<div class="finder-empty">Todavía no hay historial.</div>'}
    </div>`;
  }

  if (id === 'descargas') {
    return `
    <div class="page">
      <h2>Descargas</h2>
      <p class="lead">Archivos disponibles en este equipo.</p>
      <button class="list-row" data-dl="LiquidOS-1.0-amd64.iso"><span class="mini app-icon" style="--c1:#b8c6db;--c2:#7d8ba1">${icons('doc')}</span><span><b>LiquidOS-1.0-amd64.iso</b><small>Imagen híbrida BIOS + UEFI</small></span><span class="meta">2,4 GB</span></button>
      <button class="list-row" data-dl="liquidos-1.0-amd64.iso.sha256"><span class="mini app-icon" style="--c1:#c9d1e0;--c2:#7d8798">${icons('doc')}</span><span><b>liquidos-1.0-amd64.iso.sha256</b><small>Suma de verificación</small></span><span class="meta">96 B</span></button>
      <button class="list-row" data-dl="build.log"><span class="mini app-icon" style="--c1:#c9d1e0;--c2:#7d8798">${icons('doc')}</span><span><b>build.log</b><small>Registro de compilación</small></span><span class="meta">312 KB</span></button>
    </div>`;
  }

  return `
  <div class="page start-page">
    <svg class="mark" viewBox="0 0 100 120"><path d="M50 4c14 22 34 44 34 66a34 34 0 1 1-68 0C16 48 36 26 50 4z" fill="#5aa9ff"/></svg>
    <h2>Bienvenido a LiquidOS</h2>
    <p>Tu escritorio, fluido y silencioso. El navegador carga páginas reales: escribe una dirección arriba.</p>
    <div class="tiles">
      <button class="tile" data-quick="https://es.wikipedia.org/"><b>W</b>Wikipedia</button>
      <button class="tile" data-quick="https://html.duckduckgo.com/html/?q=debian"><b>⌕</b>Buscar</button>
      <button class="tile" data-page="favoritos"><b>★</b>Favoritos</button>
      <button class="tile" data-page="historial"><b>↺</b>Historial</button>
    </div>
  </div>`;
}

function curTab() {
  const b = state.views.navegador;
  return b.tabs[b.active] || b.tabs[0];
}

function viewBrowser() {
  const b = state.views.navegador;
  const tab = curTab();
  const id = tab.stack[tab.index] || 'inicio';
  const url = entryUrl(id);
  const fav = b.favs.includes(id);

  return `
  <div class="browser ff">
    <div class="ff-tabs">
      ${b.tabs.map((t, i) => {
        const tid = t.stack[t.index] || 'inicio';
        return `
        <button class="ff-tab ${i === b.active ? 'on' : ''}" data-tab="${i}" title="${escapeHtml(sitePageTitle(tid))}">
          <span class="ff-tab-ico">${icons(isWebEntry(tid) ? 'globe' : 'globe')}</span>
          <span class="ff-tab-title">${escapeHtml(sitePageTitle(tid))}</span>
          <span class="ff-tab-x" data-tab-close="${i}" role="button" title="Cerrar pestaña">×</span>
        </button>`;
      }).join('')}
      <button class="ff-new" data-tab-new="1" title="Nueva pestaña" aria-label="Nueva pestaña">+</button>
    </div>
    <div class="browser-bar">
      <button class="nav" data-nav="back" title="Atrás" ${tab.index === 0 ? 'disabled' : ''}>${icons('back')}</button>
      <button class="nav" data-nav="forward" title="Adelante" ${tab.index >= tab.stack.length - 1 ? 'disabled' : ''}>${icons('forward')}</button>
      <button class="nav" data-nav="reload" title="Recargar">${icons('reload')}</button>
      <button class="nav" data-nav="home" title="Inicio">${icons('home')}</button>
      <div class="url">${icons('globe')}<input data-url value="${escapeHtml(url)}" spellcheck="false" aria-label="Dirección"></div>
      <button class="nav fav ${fav ? 'on' : ''}" data-fav="1" title="${fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}">${icons('tag')}</button>
      <button class="nav" data-nav="search" title="Editar la dirección">${icons('search')}</button>
    </div>
    ${browserPageHtml(id, b)}
  </div>`;
}

function browserGo(id) {
  const b = state.views.navegador;
  const tab = curTab();
  if (!tab) return;
  if (id === 'buscar' && !b.query) id = 'inicio';
  if (tab.stack[tab.index] === id) {
    rerenderWindow('navegador');
    if (isWebEntry(id)) ensureWebPage(id);
    return;
  }
  tab.stack = tab.stack.slice(0, tab.index + 1);
  tab.stack.push(id);
  if (tab.stack.length > 30) tab.stack.shift();
  tab.index = tab.stack.length - 1;
  b.history = [id, ...b.history.filter((h) => h !== id)].slice(0, 30);
  rerenderWindow('navegador');
  if (isWebEntry(id)) ensureWebPage(id);
}

function browserNewTab() {
  const b = state.views.navegador;
  b.tabs.push({ stack: ['nueva'], index: 0 });
  b.active = b.tabs.length - 1;
  b.history = ['nueva', ...b.history.filter((h) => h !== 'nueva')];
  rerenderWindow('navegador');
}

function browserCloseTab(index) {
  const b = state.views.navegador;
  if (b.tabs.length === 1) {
    b.tabs = [{ stack: ['nueva'], index: 0 }];
    b.active = 0;
    rerenderWindow('navegador');
    return;
  }
  b.tabs.splice(index, 1);
  b.active = Math.max(0, Math.min(b.active, b.tabs.length - 1));
  rerenderWindow('navegador');
  ensureCurrentWeb();
}

function browserSelectTab(index) {
  const b = state.views.navegador;
  if (!b.tabs[index]) return;
  b.active = index;
  rerenderWindow('navegador');
  ensureCurrentWeb();
}

function browserToggleFav() {
  const b = state.views.navegador;
  const tab = curTab();
  const id = tab.stack[tab.index];
  if (!id || id === 'nueva' || id === 'buscar') { toast('Esta página no se puede guardar'); return; }
  if (b.favs.includes(id)) {
    b.favs = b.favs.filter((f) => f !== id);
    toast('Página quitada de favoritos');
  } else {
    b.favs.push(id);
    toast('Página guardada en favoritos');
  }
  rerenderWindow('navegador');
}

function browserReload() {
  const tab = curTab();
  const id = tab && tab.stack[tab.index];
  if (isWebEntry(id)) {
    delete state.web.pages[id];
    delete state.web.errors[id];
    delete state.web.loading[id];
    rerenderWindow('navegador');
    ensureWebPage(id);
  } else {
    rerenderWindow('navegador');
  }
  toast('Recargando…', 900);
}

function normalizeAddress(value) {
  const raw = value.trim();
  if (!raw) return '';

  // Direcciones internas de la demo (con o sin esquema).
  const internal = /^(?:https?:\/\/)?liquidos\.local\/?([^?#]*)/i.exec(raw);
  if (internal) {
    const path = (internal[1] || '').replace(/\/+$/, '').toLowerCase();
    return { internal: SITE_URL[path] ? path : 'inicio' };
  }

  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) return 'https:' + raw;

  if (/\s/.test(raw)) {
    return 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(raw);
  }
  // Un dominio con punto (o con puerto) se abre tal cual.
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/|$|\?|#)/i.test(raw)) {
    return 'https://' + raw;
  }
  return 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(raw);
}

function browserNavigate(raw) {
  const value = raw.trim();
  if (!value) return;
  const target = normalizeAddress(value);
  if (!target) return;
  if (typeof target === 'object' && target.internal) return browserGo(target.internal);
  browserGo('u:' + target);
}

async function ensureWebPage(entry) {
  if (!isWebEntry(entry)) return;
  if (state.web.pages[entry] || state.web.loading[entry]) return;
  state.web.loading[entry] = true;
  try {
    const data = await api('/api/web?url=' + encodeURIComponent(webUrl(entry)));
    if (data.ok && data.html) {
      state.web.pages[entry] = {
        html: data.html,
        title: data.title || webHost(entry),
        url: data.url || webUrl(entry),
        at: Date.now()
      };
      const keys = Object.keys(state.web.pages);
      if (keys.length > 16) delete state.web.pages[keys[0]];
      delete state.web.errors[entry];
    } else {
      state.web.errors[entry] = data.error || 'No se pudo cargar la página.';
    }
  } catch (err) {
    state.web.errors[entry] = err.message || 'No se pudo contactar con el servidor de la vista previa.';
  } finally {
    delete state.web.loading[entry];
    const current = curTab();
    if (state.open.has('navegador') && current && current.stack[current.index] === entry) {
      rerenderWindow('navegador');
    }
  }
}

function ensureCurrentWeb() {
  const tab = curTab();
  const id = tab && tab.stack[tab.index];
  if (isWebEntry(id)) ensureWebPage(id);
}

function wireBrowser(win) {
  const body = win.querySelector('.win-body');
  const b = state.views.navegador;
  const tab = curTab();

  $$('[data-nav]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.nav;
      if (action === 'back' && tab.index > 0) {
        tab.index--;
        rerenderWindow('navegador');
        ensureCurrentWeb();
      } else if (action === 'forward' && tab.index < tab.stack.length - 1) {
        tab.index++;
        rerenderWindow('navegador');
        ensureCurrentWeb();
      } else if (action === 'reload') {
        browserReload();
      } else if (action === 'home') {
        browserGo('inicio');
      } else if (action === 'search') {
        const input = $('[data-url]', body);
        if (input) { input.focus(); input.select(); }
      }
    });
  });

  $$('[data-page]', body).forEach((btn) => {
    btn.addEventListener('click', () => browserGo(btn.dataset.page));
  });

  $$('[data-quick]', body).forEach((btn) => {
    btn.addEventListener('click', () => browserGo('u:' + btn.dataset.quick));
  });

  $$('[data-web-form]', body).forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('[data-web-q]', form);
      browserNavigate(input ? input.value : '');
    });
  });

  $$('[data-tab]', body).forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-tab-close]')) return;
      browserSelectTab(Number(el.dataset.tab));
    });
  });

  $$('[data-tab-close]', body).forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      browserCloseTab(Number(el.dataset.tabClose));
    });
  });

  const newTab = $('[data-tab-new]', body);
  if (newTab) newTab.addEventListener('click', () => browserNewTab());

  const fav = $('[data-fav]', body);
  if (fav) fav.addEventListener('click', () => browserToggleFav());

  const url = $('[data-url]', body);
  if (url) {
    url.addEventListener('focus', () => url.select());
    url.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); browserNavigate(url.value); }
    });
  }

  $$('[data-dl]', body).forEach((btn) => {
    btn.addEventListener('click', () => toast(`«${btn.dataset.dl}» · descarga simulada`));
  });

  const frame = $('[data-web-frame]', body);
  if (frame) {
    const entry = frame.dataset.webEntry;
    const page = webPage(entry);
    const stateEl = $('[data-web-state]', body);
    if (page) {
      frame.srcdoc = page.html;
      frame.addEventListener('load', () => { if (stateEl) stateEl.hidden = true; });
    } else {
      if (stateEl) stateEl.hidden = false;
      ensureWebPage(entry);
    }
  }

  const title = win.querySelector('.win-title');
  if (title) title.textContent = `Firefox — ${sitePageTitle(tab.stack[tab.index])}`;
}

/* Puente de navegación de las webs reales (iframe aislado). */
window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  const frame = [...document.querySelectorAll('iframe[data-web-frame]')]
    .find((f) => f.contentWindow === event.source);
  if (!frame) return;
  const entry = frame.dataset.webEntry;

  if (data.type === 'liquidos:navigate' && typeof data.url === 'string') {
    const target = data.url.slice(0, 4096);
    if (!/^https?:\/\//i.test(target)) return;
    browserGo('u:' + target);
    return;
  }

  if (data.type === 'liquidos:title' && typeof data.title === 'string') {
    const page = state.web.pages[entry];
    const clean = data.title.replace(/\s+/g, ' ').trim().slice(0, 160);
    if (page && clean && clean !== page.title) {
      page.title = clean;
      const activeTab = $('.ff-tab.on .ff-tab-title', $('#windows'));
      if (activeTab) activeTab.textContent = clean;
      const winTitle = $('.window[data-app="navegador"] .win-title', $('#windows'));
      if (winTitle) winTitle.textContent = `Firefox — ${clean}`;
    }
  }

  if (data.type === 'liquidos:notice' && typeof data.text === 'string') {
    toast(data.text.slice(0, 220));
  }
});

/* ---------------------------- Correo ---------------------------- */

function mailFind(id) {
  for (const box of Object.keys(MAILBOXES)) {
    const msg = MAILBOXES[box].find((m) => m.id === id);
    if (msg) return { msg, box };
  }
  return null;
}

function mailBodyHtml(body) {
  return body.split('\n\n').map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
}

function viewMail() {
  const v = state.views.correo;

  if (v.compose) {
    return `
    <div class="notes">
      <aside class="notes-list">
        ${mailSidebar()}
      </aside>
      <div class="mail-panel compose">
        <h2>Nuevo mensaje</h2>
        <input data-compose-to placeholder="Para" value="${escapeHtml(v.compose.to || '')}" aria-label="Para">
        <input data-compose-subject placeholder="Asunto" value="${escapeHtml(v.compose.subject || '')}" aria-label="Asunto">
        <textarea data-compose-body placeholder="Escribe tu mensaje…" aria-label="Mensaje">${escapeHtml(v.compose.body || '')}</textarea>
        <div class="mail-actions">
          <button class="btn primary" data-mail-act="send">${icons('send')} Enviar</button>
          <button class="btn" data-mail-act="cancel">Cancelar</button>
        </div>
      </div>
    </div>`;
  }

  if (v.selected) {
    const found = mailFind(v.selected);
    if (found) {
      const { msg } = found;
      return `
      <div class="notes">
        <aside class="notes-list">
          ${mailSidebar()}
        </aside>
        <div class="mail-panel mail-read">
          <button class="btn" data-mail-act="back">${icons('back')} Volver al buzón</button>
          <h2>${escapeHtml(msg.subject)}</h2>
          <div class="mail-meta">De <b>${escapeHtml(msg.from)}</b> · ${msg.when}</div>
          <div class="mail-body">${mailBodyHtml(msg.body)}</div>
          <div class="mail-actions">
            <button class="btn primary" data-mail-act="reply">${icons('reply')} Responder</button>
            <button class="btn" data-mail-act="archive">Archivar</button>
            <button class="btn danger" data-mail-act="delete">Eliminar</button>
          </div>
        </div>
      </div>`;
    }
    v.selected = null;
  }

  const list = MAILBOXES[v.box];
  return `
  <div class="notes">
    <aside class="notes-list">
      ${mailSidebar()}
    </aside>
    <div class="mail-panel">
      <div class="mail-toolbar">
        <b>${v.box === 'inbox' ? 'Bandeja de entrada' : v.box === 'sent' ? 'Enviados' : 'Archivo'}</b>
        <input class="finder-search mail-search" data-mail-search placeholder="Buscar mensajes" value="${escapeHtml(v.query || '')}" aria-label="Buscar mensajes">
        <span data-mail-count>${list.length} mensaje${list.length === 1 ? '' : 's'}</span>
      </div>
      ${list.length ? list.map((m) => `
        <button class="mail-row" data-msg="${m.id}" data-mail-text="${escapeHtml((m.from + ' ' + m.subject + ' ' + m.body).toLowerCase())}">
          <span class="mail-dot ${m.unread ? 'on' : ''}"></span>
          <span class="mail-text"><b>${escapeHtml(m.from)}</b><small>${escapeHtml(m.subject)}</small></span>
          <span class="mail-when">${m.when}</span>
        </button>`).join('') : '<div class="mail-empty">No hay mensajes en este buzón.</div>'}
      <div class="mail-empty" data-mail-empty hidden>Ningún mensaje coincide con la búsqueda.</div>
    </div>
  </div>`;
}

function mailSidebar() {
  const v = state.views.correo;
  const unread = MAILBOXES.inbox.filter((m) => m.unread).length;
  return `
    <h4>Buzones</h4>
    <button class="note-item ${v.box === 'inbox' ? 'on' : ''}" data-box="inbox"><b>Bandeja de entrada</b>${unread} sin leer</button>
    <button class="note-item ${v.box === 'sent' ? 'on' : ''}" data-box="sent"><b>Enviados</b>${MAILBOXES.sent.length} mensajes</button>
    <button class="note-item ${v.box === 'archive' ? 'on' : ''}" data-box="archive"><b>Archivo</b>${MAILBOXES.archive.length} mensajes</button>
    <div class="mail-actions" style="margin-top:14px">
      <button class="btn primary" data-mail-act="new">${icons('plus')} Nuevo mensaje</button>
    </div>`;
}

function wireMail(win) {
  const body = win.querySelector('.win-body');
  const v = state.views.correo;

  $$('[data-box]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      v.box = btn.dataset.box;
      v.selected = null;
      v.compose = null;
      rerenderWindow('correo');
    });
  });

  $$('[data-msg]', body).forEach((row) => {
    row.addEventListener('click', () => {
      const found = mailFind(row.dataset.msg);
      if (!found) return;
      found.msg.unread = false;
      v.selected = row.dataset.msg;
      rerenderWindow('correo');
    });
  });

  const search = $('[data-mail-search]', body);
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      v.query = search.value;
      let visible = 0;
      $$('.mail-row', body).forEach((row) => {
        const match = !q || (row.dataset.mailText || '').includes(q);
        row.hidden = !match;
        if (match) visible++;
      });
      const empty = $('[data-mail-empty]', body);
      if (empty) empty.hidden = visible > 0 || !$$('.mail-row', body).length;
      const count = $('[data-mail-count]', body);
      if (count) count.textContent = `${visible} mensaje${visible === 1 ? '' : 's'}`;
    });
  }

  $$('[data-mail-act]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.mailAct;
      const found = v.selected ? mailFind(v.selected) : null;

      if (act === 'back') {
        v.selected = null;
        rerenderWindow('correo');
      } else if (act === 'new') {
        v.compose = { to: '', subject: '', body: '' };
        v.selected = null;
        rerenderWindow('correo');
      } else if (act === 'cancel') {
        v.compose = null;
        rerenderWindow('correo');
      } else if (act === 'reply' && found) {
        v.compose = { to: found.msg.from, subject: `Re: ${found.msg.subject}`, body: '' };
        v.selected = null;
        rerenderWindow('correo');
      } else if (act === 'archive' && found) {
        MAILBOXES[found.box] = MAILBOXES[found.box].filter((m) => m.id !== found.msg.id);
        MAILBOXES.archive.unshift(found.msg);
        v.selected = null;
        rerenderWindow('correo');
        toast('Mensaje archivado');
      } else if (act === 'delete' && found) {
        MAILBOXES[found.box] = MAILBOXES[found.box].filter((m) => m.id !== found.msg.id);
        v.selected = null;
        rerenderWindow('correo');
        toast('Mensaje eliminado');
      } else if (act === 'send') {
        const to = $('[data-compose-to]', body)?.value.trim();
        const subject = $('[data-compose-subject]', body)?.value.trim() || '(sin asunto)';
        const text = $('[data-compose-body]', body)?.value.trim() || '';
        if (!to) { toast('Escribe un destinatario'); return; }
        MAILBOXES.sent.unshift({
          id: `s${Date.now()}`,
          from: 'Yo',
          subject,
          when: 'Ahora',
          unread: false,
          body: `Para: ${to}\n\n${text || '(mensaje vacío)'}`
        });
        v.compose = null;
        v.box = 'sent';
        v.selected = null;
        rerenderWindow('correo');
        toast('Mensaje enviado');
      }
    });
  });
}

/* ---------------------- Centro de software ---------------------- */

function swItem(id) {
  return CATALOG.find((c) => c.id === id);
}

function swInstalled(id) {
  return state.software.installed.includes(id);
}

function swInstalled(id) {
  return state.software.installed.includes(id);
}

/* ------------------- Tienda real: estado y utilidades ------------------- */

function realInstalled(id) {
  const list = state.software.installedReal;
  return Array.isArray(list) && list.some((a) => a.id === id);
}

function lastLine(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const line = lines.length ? lines[lines.length - 1] : '';
  return line.length > 150 ? line.slice(0, 150) + '…' : line;
}

function letterIcon(name) {
  const ch = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return `<span class="app-icon sw-ico sw-letter" aria-hidden="true">${escapeHtml(ch)}</span>`;
}

function jobHtml(appId, job, label) {
  if (job.state === 'fallback') {
    return `<button class="btn primary" data-sw-real-fallback="${escapeHtml(appId)}">Cómo instalar</button>`;
  }
  const running = job.state === 'running' || job.state === 'starting';
  const text = running ? (label || 'Instalando…') : job.state === 'done' ? 'Completado' : 'Con errores';
  return `
  <div class="sw-job" data-sw-job="${escapeHtml(appId)}">
    <div class="sw-job-head">
      <span class="sw-job-label">${escapeHtml(text)}</span>
      <span>${Math.round(job.progress || 0)}%</span>
    </div>
    <div class="sw-progress"><span style="width:${Math.round(job.progress || 0)}%"></span></div>
    <small class="sw-job-out">${escapeHtml(lastLine(job.output) || '')}</small>
  </div>`;
}

function storeStatusHtml(sw) {
  if (!sw.status) {
    return `<div class="sw-status"><span class="sw-dot wait"></span> Conectando con Flathub…</div>`;
  }
  if (sw.status.mode === 'real') {
    return `<div class="sw-status real"><span class="sw-dot"></span>
      Flathub conectado · las instalaciones se hacen de verdad con Flatpak${sw.status.flathub ? '' : ' (remoto pendiente)'}</div>`;
  }
  return `<div class="sw-status demo"><span class="sw-dot"></span>
    Catálogo y búsquedas reales de Flathub · este equipo no tiene Flatpak, así que no puede instalar</div>`;
}

function storeNoticeHtml(notice) {
  return `
  <div class="sw-notice">
    <div class="sw-notice-head">${icons('downloadCloud')} <b>${escapeHtml(notice.title || 'No se pudo completar la operación')}</b></div>
    <p>${escapeHtml(notice.text || '')}</p>
    ${notice.command ? `<code>${escapeHtml(notice.command)}</code>` : ''}
    <div class="sw-notice-actions">
      ${notice.command ? `<button class="btn" data-copy="${escapeHtml(notice.command)}">Copiar comando</button>` : ''}
      ${notice.url ? `<a class="btn" href="${escapeHtml(notice.url)}" target="_blank" rel="noreferrer">Ver en Flathub</a>` : ''}
      <button class="btn" data-sw-dismiss="1">Cerrar</button>
    </div>
  </div>`;
}

function localCard(it) {
  const sw = state.software;
  const installed = swInstalled(it.id);
  const prog = sw.progress[it.id];
  return `
  <article class="sw-card" data-sw-app="${it.id}" data-sw-name="${escapeHtml(it.name.toLowerCase())}" data-sw-summary="${escapeHtml(it.summary.toLowerCase())}">
    <span class="app-icon sw-ico" style="--c1:${it.c1};--c2:${it.c2}">${svg(it.glyph)}</span>
    <div class="sw-info">
      <b>${escapeHtml(it.name)}</b>
      <small>${escapeHtml(it.summary)}</small>
      <span class="sw-meta">${escapeHtml(it.cat)} · ${it.size} · ★ ${it.rating.toFixed(1)}</span>
    </div>
    <div class="sw-actions">
      ${prog !== undefined
        ? `<div class="sw-progress" data-sw-progress="${it.id}"><span style="width:${Math.round(prog)}%"></span></div>`
        : installed
          ? `${it.app ? `<button class="btn primary" data-sw-open="${it.id}">Abrir</button>` : ''}
             ${sw.updates.includes(it.id) ? `<button class="btn" data-sw-update="${it.id}">Actualizar</button>` : ''}
             ${it.core ? '' : `<button class="btn" data-sw-remove="${it.id}">Quitar</button>`}`
          : `<button class="btn primary" data-sw-install="${it.id}">Instalar</button>`}
    </div>
  </article>`;
}

function realCard(it) {
  const sw = state.software;
  const installed = realInstalled(it.id);
  const job = sw.jobs[it.id];
  const letter = escapeHtml((it.name || '?').trim().charAt(0).toUpperCase() || '?');
  return `
  <article class="sw-card" data-sw-app="${escapeHtml(it.id)}" data-sw-name="${escapeHtml(it.name.toLowerCase())}" data-sw-summary="${escapeHtml((it.summary || '').toLowerCase())}">
    <span class="app-icon sw-ico sw-real-ico">
      <span class="sw-letter-fallback">${letter}</span>
      ${it.icon ? `<img src="${escapeHtml(it.icon)}" alt="" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}
    </span>
    <div class="sw-info">
      <b>${escapeHtml(it.name)}${it.verified ? ' <span class="sw-verified" title="Verificada por Flathub">✔</span>' : ''}</b>
      <small>${escapeHtml(it.summary || '')}</small>
      <span class="sw-meta">${escapeHtml(it.developer || 'Flathub')} · ${escapeHtml(it.category || 'Utilidades')} · ${escapeHtml(it.id)}</span>
    </div>
    <div class="sw-actions">
      ${job
        ? jobHtml(it.id, job)
        : installed
          ? `<span class="sw-installed-tag">Instalada</span><button class="btn" data-sw-real-remove="${escapeHtml(it.id)}">Quitar</button>`
          : `<button class="btn primary" data-sw-real-install="${escapeHtml(it.id)}" data-sw-name="${escapeHtml(it.name)}">Instalar</button>`}
    </div>
  </article>`;
}

function activeJob(job) {
  return job && (job.state === 'running' || job.state === 'starting') ? job : null;
}

function installedRealCard(app) {
  const job = activeJob(state.software.jobs[app.id]);
  return `
  <article class="sw-card" data-sw-name="${escapeHtml((app.name || '').toLowerCase())}" data-sw-summary="${escapeHtml((app.id || '').toLowerCase())}">
    ${letterIcon(app.name)}
    <div class="sw-info">
      <b>${escapeHtml(app.name || app.id)}</b>
      <small>${escapeHtml(app.id)}</small>
      <span class="sw-meta">${app.version ? `Versión ${escapeHtml(app.version)} · ` : ''}${escapeHtml(app.origin || 'Flathub')}${app.size ? ` · ${escapeHtml(app.size)}` : ''}</span>
    </div>
    <div class="sw-actions">
      ${job
        ? jobHtml(app.id, job, 'Quitando…')
        : `<button class="btn" data-copy="flatpak run ${escapeHtml(app.id)}">Copiar «flatpak run»</button>
           <button class="btn danger" data-sw-real-remove="${escapeHtml(app.id)}">Quitar</button>`}
    </div>
  </article>`;
}

function localResultsHtml(sw) {
  let items = CATALOG.slice();
  if (sw.cat !== 'todas') items = items.filter((it) => it.cat === sw.cat);
  const q = sw.query.trim().toLowerCase();
  if (q) items = items.filter((it) => it.name.toLowerCase().includes(q) || it.summary.toLowerCase().includes(q));
  return `
  <div class="sw-list" data-sw-list>
    ${items.map(localCard).join('')}
    <div class="sw-empty" ${items.length ? 'hidden' : ''}>No hay aplicaciones que coincidan con «${escapeHtml(sw.query)}»${sw.cat !== 'todas' ? ' en ' + escapeHtml(sw.cat) : ''}.</div>
  </div>`;
}

function realResultsHtml(sw) {
  if (sw.realLoading && !sw.real.length) {
    const skeletons = Array.from({ length: 5 }, () => `
      <div class="sw-skel"><span></span><div><i></i><i></i></div></div>`).join('');
    return `<div class="sw-list" data-sw-list>${skeletons}</div>`;
  }
  if (sw.realError) {
    return `
    <div class="sw-list" data-sw-list>
      <div class="sw-empty">No se pudo consultar Flathub: ${escapeHtml(sw.realError)}.
        <div><button class="btn" data-sw-clear="1">Volver al catálogo local</button></div>
      </div>
    </div>`;
  }
  return `
  <div class="sw-section-label">
    Resultados reales de Flathub · ${sw.real.length}${sw.realLoading ? ' · actualizando…' : ''}
    <button class="sw-link" data-sw-clear="1">Limpiar</button>
  </div>
  <div class="sw-list" data-sw-list>
    ${sw.real.map(realCard).join('')}
    <div class="sw-empty" ${sw.real.length ? 'hidden' : ''}>No hay resultados para «${escapeHtml(sw.realQuery)}» en Flathub.</div>
  </div>`;
}

function localInstalledHtml(sw) {
  const items = CATALOG.filter((it) => swInstalled(it.id));
  return `
  <div class="sw-list" data-sw-list>
    ${items.map(localCard).join('')}
    <div class="sw-empty" ${items.length ? 'hidden' : ''}>No hay aplicaciones instaladas en la demo.</div>
  </div>`;
}

function installedRealHtml(sw) {
  if (sw.installedLoading && sw.installedReal === null) {
    return `<div class="sw-list" data-sw-list><div class="sw-loading">Leyendo las aplicaciones instaladas con Flatpak…</div></div>`;
  }
  if (sw.installedError) {
    return `<div class="sw-list" data-sw-list><div class="sw-empty">${escapeHtml(sw.installedError)}
      <div><button class="btn" data-sw-check-installed="1">Reintentar</button></div></div></div>`;
  }
  const apps = sw.installedReal || [];
  return `
  <div class="sw-section-label">Instaladas con Flatpak · ${apps.length}
    <button class="sw-link" data-sw-check-installed="1">Actualizar lista</button>
  </div>
  <div class="sw-list" data-sw-list>
    ${apps.map(installedRealCard).join('')}
    <div class="sw-empty" ${apps.length ? 'hidden' : ''}>Todavía no hay aplicaciones Flatpak instaladas. Busca una en «Descubrir» e instálala.</div>
  </div>`;
}

function localUpdatesHtml(sw) {
  const items = CATALOG.filter((it) => sw.updates.includes(it.id));
  return `
  ${items.length ? `
    <div class="sw-banner">
      <span>${icons('downloadCloud')} Hay ${items.length} actualizaciones disponibles</span>
      <button class="btn primary" data-sw-update-all="1">Actualizar todo</button>
    </div>` : ''}
  <div class="sw-list" data-sw-list>
    ${items.map(localCard).join('')}
    <div class="sw-empty" ${items.length ? 'hidden' : ''}>Todo está al día.</div>
  </div>`;
}

function updatesRealHtml(sw) {
  const allJob = activeJob(sw.jobs['__all__']);
  const apps = sw.updatesReal || [];
  let body;
  if (sw.updatesLoading && sw.updatesReal === null) {
    body = `<div class="sw-loading">Buscando actualizaciones en Flathub…</div>`;
  } else if (sw.updatesError) {
    body = `<div class="sw-empty">${escapeHtml(sw.updatesError)}
      <div><button class="btn" data-sw-check-updates="1">Reintentar</button></div></div>`;
  } else if (sw.updatesReal === null) {
    body = `<div class="sw-empty">Pulsa «Buscar actualizaciones» para consultar Flatpak.
      <div><button class="btn primary" data-sw-check-updates="1">Buscar actualizaciones</button></div></div>`;
  } else if (!apps.length) {
    body = `<div class="sw-empty">Todo está al día.
      <div><button class="btn" data-sw-check-updates="1">Volver a comprobar</button></div></div>`;
  } else {
    body = apps.map((app) => {
      const job = activeJob(sw.jobs[app.id]);
      return `
      <article class="sw-card" data-sw-name="${escapeHtml((app.name || '').toLowerCase())}" data-sw-summary="${escapeHtml((app.id || '').toLowerCase())}">
        ${letterIcon(app.name)}
        <div class="sw-info">
          <b>${escapeHtml(app.name || app.id)}</b>
          <small>${escapeHtml(app.id)}</small>
          <span class="sw-meta">${app.version ? `Versión ${escapeHtml(app.version)} · ` : ''}${escapeHtml(app.origin || 'Flathub')}</span>
        </div>
        <div class="sw-actions">
          ${job ? jobHtml(app.id, job, 'Actualizando…')
            : `<button class="btn primary" data-sw-real-update="${escapeHtml(app.id)}">Actualizar</button>`}
        </div>
      </article>`;
    }).join('');
  }

  return `
  ${apps.length ? `
    <div class="sw-banner">
      <span>${icons('downloadCloud')} ${apps.length} actualizaciones disponibles en Flathub</span>
      ${allJob ? jobHtml('__all__', allJob, 'Actualizando todo…')
        : `<button class="btn primary" data-sw-real-update-all="1">Actualizar todo</button>`}
    </div>` : ''}
  <div class="sw-list" data-sw-list>${body}</div>`;
}

function viewSoftware() {
  const sw = state.software;
  const realMode = Boolean(sw.status && sw.status.mode === 'real');
  const searching = sw.tab === 'descubrir' && sw.query.trim().length >= 2;
  const installedCount = realMode
    ? (sw.installedReal ? sw.installedReal.length : 0)
    : sw.installed.length;
  const updatesCount = realMode
    ? (sw.updatesReal ? sw.updatesReal.length : 0)
    : sw.updates.length;

  let content;
  if (sw.tab === 'descubrir') {
    content = searching ? realResultsHtml(sw) : localResultsHtml(sw);
  } else if (sw.tab === 'instalados') {
    content = realMode ? installedRealHtml(sw) : localInstalledHtml(sw);
  } else {
    content = realMode ? updatesRealHtml(sw) : localUpdatesHtml(sw);
  }

  return `
  <div class="software">
    <div class="sw-head">
      <div class="seg2 sw-tabs">
        <button data-sw-tab="descubrir" class="${sw.tab === 'descubrir' ? 'on' : ''}">Descubrir</button>
        <button data-sw-tab="instalados" class="${sw.tab === 'instalados' ? 'on' : ''}">Instalados · ${installedCount}</button>
        <button data-sw-tab="actualizaciones" class="${sw.tab === 'actualizaciones' ? 'on' : ''}">Actualizaciones · ${updatesCount}</button>
      </div>
      <input class="finder-search" data-sw-search placeholder="Buscar en Flathub" value="${escapeHtml(sw.query)}" aria-label="Buscar aplicaciones">
    </div>

    ${storeStatusHtml(sw)}
    ${sw.notice ? storeNoticeHtml(sw.notice) : ''}

    ${sw.tab === 'descubrir' && !searching ? `
      <div class="sw-cats">
        ${SOFTWARE_CATS.map((c) => `<button class="sw-chip ${sw.cat === c ? 'on' : ''}" data-sw-cat="${c}">${c === 'todas' ? 'Todas' : c}</button>`).join('')}
      </div>` : ''}

    ${content}

    <div class="sw-foot">
      <span>${realMode
        ? (sw.status && sw.status.flathub ? 'Flathub conectado' : 'Flathub sin remoto') + ' · instalación real'
        : 'Catálogo real de Flathub'}</span>
      <span>${realMode
        ? `${installedCount} aplicaciones Flatpak instaladas`
        : 'Modo demostración · sin Flatpak en este equipo'}</span>
    </div>
  </div>`;
}

/* ------------------- Tienda real: operaciones asíncronas ------------------- */

async function ensureStoreStatus() {
  const sw = state.software;
  if (sw.status || sw.statusLoading) return;
  sw.statusLoading = true;
  try {
    sw.status = await api('/api/store/status');
  } catch {
    sw.status = { ok: false, mode: 'demo', flatpak: { available: false }, error: 'Sin conexión con el servidor de la vista previa' };
  }
  sw.statusLoading = false;
  if (state.open.has('software')) rerenderWindow('software');
}

async function ensureInstalledReal(force = false) {
  const sw = state.software;
  if (!sw.status || sw.status.mode !== 'real') return;
  if (sw.installedLoading) return;
  if (sw.installedReal !== null && !force) return;
  sw.installedLoading = true;
  sw.installedError = '';
  try {
    const data = await api('/api/store/installed');
    sw.installedReal = data.ok ? (data.apps || []) : [];
    if (!data.ok) sw.installedError = data.error || 'No se pudo leer la lista de aplicaciones.';
  } catch {
    sw.installedReal = [];
    sw.installedError = 'No se pudo contactar con el servidor de la vista previa.';
  }
  sw.installedLoading = false;
  if (state.open.has('software')) rerenderWindow('software');
}

async function ensureUpdatesReal(force = false) {
  const sw = state.software;
  if (!sw.status || sw.status.mode !== 'real') return;
  if (sw.updatesLoading) return;
  if (sw.updatesReal !== null && !force) return;
  sw.updatesLoading = true;
  sw.updatesError = '';
  try {
    const data = await api('/api/store/updates');
    sw.updatesReal = data.ok ? (data.apps || []) : [];
    if (!data.ok) sw.updatesError = data.error || 'No se pudieron consultar las actualizaciones.';
  } catch {
    sw.updatesReal = [];
    sw.updatesError = 'No se pudo contactar con el servidor de la vista previa.';
  }
  sw.updatesLoading = false;
  if (state.open.has('software')) rerenderWindow('software');
}

function rerenderSoftwareKeepFocus() {
  // El repintado genérico ya conserva el foco y el cursor del buscador.
  rerenderWindow('software');
}

async function runStoreSearch(query) {
  const sw = state.software;
  sw.realLoading = true;
  sw.realQuery = query;
  sw.realError = '';
  rerenderSoftwareKeepFocus();
  try {
    const data = await api('/api/store/search?q=' + encodeURIComponent(query));
    if (sw.realQuery !== query) return;
    if (data.ok) {
      sw.real = data.hits || [];
    } else {
      sw.real = [];
      sw.realError = data.error || 'Flathub no respondió';
    }
  } catch {
    if (sw.realQuery !== query) return;
    sw.real = [];
    sw.realError = 'No se pudo contactar con el servidor de la vista previa.';
  }
  sw.realLoading = false;
  if (state.open.has('software')) rerenderSoftwareKeepFocus();
}

function updateSoftwareJob(appId, force = false) {
  const sw = state.software;
  const job = sw.jobs[appId];
  if (!job) return;
  if (force) {
    if (state.open.has('software')) rerenderWindow('software');
    return;
  }
  const el = [...document.querySelectorAll('[data-sw-job]')].find((e) => e.dataset.swJob === appId);
  if (!el) return;
  const bar = el.querySelector('.sw-progress span');
  if (bar) bar.style.width = Math.round(job.progress || 0) + '%';
  const out = el.querySelector('.sw-job-out');
  if (out) out.textContent = lastLine(job.output) || '';
  const label = el.querySelector('.sw-job-label');
  if (label) label.textContent = job.label || 'Instalando…';
}

function pollJob(appId, jobId, kind) {
  const sw = state.software;
  const tick = async () => {
    const job = sw.jobs[appId];
    if (!job || job.id !== jobId) return;
    let data = null;
    try {
      data = await api('/api/store/job/' + jobId);
    } catch { /* se reintenta abajo */ }
    if (!data || !data.ok) {
      job.state = 'error';
      job.output = (job.output || '') + '\nNo se pudo consultar el estado del trabajo.';
      updateSoftwareJob(appId, true);
      return;
    }
    job.state = data.state;
    job.output = data.output || '';
    job.command = data.command || job.command;
    if (data.state === 'running') {
      job.progress = Math.min(92, (job.progress || 8) + 5 + Math.random() * 6);
      updateSoftwareJob(appId);
      setTimeout(tick, 900);
      return;
    }
    job.progress = 100;
    updateSoftwareJob(appId, true);
    if (data.state === 'done') {
      toast(kind === 'install' ? 'Aplicación instalada' : kind === 'remove' ? 'Aplicación desinstalada' : 'Actualización completada');
      beep(760);
      setTimeout(() => {
        delete sw.jobs[appId];
        if (kind === 'install' || kind === 'remove') ensureInstalledReal(true);
        if (kind === 'update') { ensureInstalledReal(true); ensureUpdatesReal(true); }
        if (state.open.has('software')) rerenderWindow('software');
      }, 900);
    } else {
      toast('La operación terminó con errores', 3200);
      beep(240);
    }
  };
  tick();
}

async function softwareInstallReal(appId, name) {
  const sw = state.software;
  if (sw.jobs[appId] && sw.jobs[appId].state === 'running') return;
  sw.jobs[appId] = { state: 'starting', progress: 4, output: '', command: '', label: 'Preparando…' };
  updateSoftwareJob(appId, true);
  let data;
  try {
    data = await api('/api/store/install', { method: 'POST', body: { appId } });
  } catch {
    data = { ok: false, error: 'No se pudo contactar con el servidor de la vista previa.' };
  }
  if (!data.ok) {
    sw.jobs[appId] = {
      state: 'fallback',
      progress: 0,
      output: '',
      command: data.command || `flatpak install flathub ${appId}`,
      url: data.url || `https://flathub.org/apps/${appId}`,
      error: data.error || 'No se pudo iniciar la instalación.'
    };
    sw.notice = {
      title: `No se pudo instalar ${name || appId}`,
      text: data.error || 'No se pudo iniciar la instalación.',
      command: sw.jobs[appId].command,
      url: sw.jobs[appId].url
    };
    if (state.open.has('software')) rerenderWindow('software');
    toast(data.error || 'No se pudo instalar', 3200);
    return;
  }
  sw.jobs[appId] = {
    id: data.job,
    state: 'running',
    progress: 8,
    output: '',
    command: data.command || '',
    label: 'Instalando…'
  };
  if (state.open.has('software')) rerenderWindow('software');
  toast(`Instalando ${name || appId}…`, 1600);
  pollJob(appId, data.job, 'install');
}

async function softwareRemoveReal(appId) {
  const sw = state.software;
  if (sw.jobs[appId] && sw.jobs[appId].state === 'running') return;
  sw.jobs[appId] = { state: 'starting', progress: 6, output: '', command: '', label: 'Quitando…' };
  updateSoftwareJob(appId, true);
  let data;
  try {
    data = await api('/api/store/remove', { method: 'POST', body: { appId } });
  } catch {
    data = { ok: false, error: 'No se pudo contactar con el servidor de la vista previa.' };
  }
  if (!data.ok) {
    sw.jobs[appId] = {
      state: 'fallback',
      progress: 0,
      output: '',
      command: data.command || `flatpak uninstall ${appId}`,
      url: data.url || `https://flathub.org/apps/${appId}`,
      error: data.error || 'No se pudo iniciar la desinstalación.'
    };
    sw.notice = {
      title: `No se pudo quitar ${appId}`,
      text: sw.jobs[appId].error,
      command: sw.jobs[appId].command,
      url: sw.jobs[appId].url
    };
    if (state.open.has('software')) rerenderWindow('software');
    return;
  }
  sw.jobs[appId] = {
    id: data.job,
    state: 'running',
    progress: 10,
    output: '',
    command: data.command || '',
    label: 'Quitando…'
  };
  if (state.open.has('software')) rerenderWindow('software');
  pollJob(appId, data.job, 'remove');
}

async function softwareUpdateReal(appId) {
  const sw = state.software;
  const key = appId || '__all__';
  sw.jobs[key] = {
    state: 'starting',
    progress: 6,
    output: '',
    command: '',
    label: appId ? 'Actualizando…' : 'Actualizando todo…'
  };
  updateSoftwareJob(key, true);
  let data;
  try {
    data = await api('/api/store/update', { method: 'POST', body: appId ? { appId } : {} });
  } catch {
    data = { ok: false, error: 'No se pudo contactar con el servidor de la vista previa.' };
  }
  if (!data.ok) {
    sw.jobs[key] = {
      state: 'fallback',
      progress: 0,
      output: '',
      command: data.command || 'flatpak update',
      url: data.url || 'https://flathub.org/setup',
      error: data.error || 'No se pudo iniciar la actualización.'
    };
    sw.notice = {
      title: 'No se pudo actualizar',
      text: sw.jobs[key].error,
      command: sw.jobs[key].command,
      url: sw.jobs[key].url
    };
    if (state.open.has('software')) rerenderWindow('software');
    return;
  }
  sw.jobs[key] = {
    id: data.job,
    state: 'running',
    progress: 10,
    output: '',
    command: data.command || '',
    label: appId ? 'Actualizando…' : 'Actualizando todo…'
  };
  if (state.open.has('software')) rerenderWindow('software');
  pollJob(key, data.job, 'update');
}

/* ------------------- Tienda: acciones de la demo ------------------- */

function softwareInstall(id) {
  const sw = state.software;
  const it = swItem(id);
  if (!it || sw.progress[id] !== undefined) return;
  sw.progress[id] = 6;
  if (state.open.has('software')) {
    const card = $(`.sw-card[data-sw-app="${id}"] .sw-actions`, $('#windows'));
    if (card) card.innerHTML = `<div class="sw-progress" data-sw-progress="${id}"><span style="width:6%"></span></div>`;
  }
  toast(`Descargando ${it.name}…`, 1400);

  const timer = setInterval(() => {
    const cur = sw.progress[id] ?? 0;
    const next = Math.min(100, cur + 9 + Math.random() * 12);
    sw.progress[id] = next;

    const bar = $(`[data-sw-progress="${id}"] span`, $('#windows'));
    if (bar) bar.style.width = Math.round(next) + '%';

    if (next >= 100) {
      clearInterval(timer);
      delete sw.progress[id];
      if (!sw.installed.includes(id)) sw.installed.push(id);
      sw.updates = sw.updates.filter((x) => x !== id);
      if (state.open.has('software')) rerenderWindow('software');
      toast(`${it.name} instalado`);
      beep(720);
    }
  }, 140);
}

function softwareRemove(id) {
  const it = swItem(id);
  state.software.installed = state.software.installed.filter((x) => x !== id);
  if (state.open.has('software')) rerenderWindow('software');
  toast(`${it ? it.name : 'Aplicación'} desinstalado`);
}

function softwareOpen(id) {
  const it = swItem(id);
  if (!it) return;
  if (it.app) {
    openApp(it.app);
    toast(`Abriendo ${it.name}`);
  } else {
    toast(`${it.name} se ha añadido al menú de aplicaciones`);
  }
}

function softwareUpdateAll() {
  const sw = state.software;
  if (!sw.updates.length) { toast('No hay actualizaciones pendientes'); return; }
  const total = sw.updates.length;
  toast(`Actualizando ${total} aplicaciones…`, 1800);
  sw.updates.forEach((id) => {
    sw.progress[id] = 8;
  });
  if (state.open.has('software')) rerenderWindow('software');

  const timer = setInterval(() => {
    let done = true;
    sw.updates.forEach((id) => {
      const next = Math.min(100, (sw.progress[id] ?? 0) + 12);
      sw.progress[id] = next;
      const bar = $(`[data-sw-progress="${id}"] span`, $('#windows'));
      if (bar) bar.style.width = Math.round(next) + '%';
      if (next < 100) done = false;
    });
    if (done) {
      clearInterval(timer);
      sw.updates.forEach((id) => delete sw.progress[id]);
      sw.updates = [];
      if (state.open.has('software')) rerenderWindow('software');
      toast('Todo está al día');
      beep(660);
    }
  }, 120);
}

function filterSoftware(win) {
  const q = state.software.query.trim().toLowerCase();
  let count = 0;
  $$('.sw-card', win).forEach((card) => {
    const match = !q || card.dataset.swName.includes(q) || card.dataset.swSummary.includes(q);
    card.hidden = !match;
    if (match) count++;
  });
  const empty = $('.sw-empty', win);
  if (empty) empty.hidden = count > 0;
}

async function copyCommand(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Comando copiado al portapapeles');
  } catch {
    toast(text, 5000);
  }
}

function wireSoftware(win) {
  const body = win.querySelector('.win-body');
  const sw = state.software;

  ensureStoreStatus();

  $$('[data-sw-tab]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      sw.tab = btn.dataset.swTab;
      sw.query = '';
      sw.real = [];
      sw.realQuery = '';
      sw.realError = '';
      sw.notice = null;
      rerenderWindow('software');
    });
  });

  $$('[data-sw-cat]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      sw.cat = btn.dataset.swCat;
      rerenderWindow('software');
    });
  });

  $$('[data-sw-install]', body).forEach((btn) => {
    btn.addEventListener('click', () => softwareInstall(btn.dataset.swInstall));
  });
  $$('[data-sw-remove]', body).forEach((btn) => {
    btn.addEventListener('click', () => softwareRemove(btn.dataset.swRemove));
  });
  $$('[data-sw-open]', body).forEach((btn) => {
    btn.addEventListener('click', () => softwareOpen(btn.dataset.swOpen));
  });
  $$('[data-sw-update]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      sw.updates = sw.updates.filter((x) => x !== btn.dataset.swUpdate);
      if (state.open.has('software')) rerenderWindow('software');
      toast('Actualizado');
    });
  });
  const all = $('[data-sw-update-all]', body);
  if (all) all.addEventListener('click', softwareUpdateAll);

  /* Operaciones reales con Flatpak */
  $$('[data-sw-real-install]', body).forEach((btn) => {
    btn.addEventListener('click', () => softwareInstallReal(btn.dataset.swRealInstall, btn.dataset.swName));
  });
  $$('[data-sw-real-remove]', body).forEach((btn) => {
    btn.addEventListener('click', () => softwareRemoveReal(btn.dataset.swRealRemove));
  });
  $$('[data-sw-real-update]', body).forEach((btn) => {
    btn.addEventListener('click', () => softwareUpdateReal(btn.dataset.swRealUpdate));
  });
  const allReal = $('[data-sw-real-update-all]', body);
  if (allReal) allReal.addEventListener('click', () => softwareUpdateReal(''));

  $$('[data-sw-check-updates]', body).forEach((btn) => {
    btn.addEventListener('click', () => ensureUpdatesReal(true));
  });
  $$('[data-sw-check-installed]', body).forEach((btn) => {
    btn.addEventListener('click', () => ensureInstalledReal(true));
  });

  $$('[data-sw-real-fallback]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      const job = sw.jobs[btn.dataset.swRealFallback];
      if (!job) return;
      sw.notice = {
        title: 'Instalación real disponible en LiquidOS',
        text: job.error || 'Este equipo no puede instalar Flatpaks. En la ISO de LiquidOS funciona desde el Centro de software.',
        command: job.command,
        url: job.url
      };
      rerenderWindow('software');
    });
  });

  $$('[data-copy]', body).forEach((btn) => {
    btn.addEventListener('click', () => copyCommand(btn.dataset.copy));
  });

  $$('[data-sw-clear]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      sw.query = '';
      sw.real = [];
      sw.realQuery = '';
      sw.realError = '';
      sw.realLoading = false;
      clearTimeout(sw.searchTimer);
      rerenderSoftwareKeepFocus();
    });
  });

  $$('[data-sw-dismiss]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      sw.notice = null;
      rerenderWindow('software');
    });
  });

  if (sw.status && sw.status.mode === 'real') {
    ensureInstalledReal();
    if (sw.tab === 'actualizaciones') ensureUpdatesReal();
  }

  const search = $('[data-sw-search]', body);
  if (search) {
    search.addEventListener('input', () => {
      sw.query = search.value;
      const q = sw.query.trim();
      if (sw.tab !== 'descubrir') {
        filterSoftware(win);
        return;
      }
      if (q.length < 2) {
        const hadReal = Boolean(sw.realQuery || sw.real.length);
        clearTimeout(sw.searchTimer);
        sw.real = [];
        sw.realQuery = '';
        sw.realError = '';
        sw.realLoading = false;
        if (hadReal) rerenderSoftwareKeepFocus();
        else filterSoftware(win);
        return;
      }
      filterSoftware(win);
      clearTimeout(sw.searchTimer);
      sw.searchTimer = setTimeout(() => runStoreSearch(q), 420);
    });
  }
}

/* ---------------------------- Notas ---------------------------- */

function todayLabel() {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}

function viewNotes() {
  const v = state.views.notas;
  const note = v.notes[v.index];
  return `
  <div class="notes">
    <aside class="notes-list">
      <div class="notes-tools">
        <button data-note-act="new" title="Nueva nota" aria-label="Nueva nota">${icons('plus')}</button>
        <span class="spacer"></span>
        <button data-note-act="del" title="Eliminar nota" aria-label="Eliminar nota">${icons('trash')}</button>
      </div>
      ${v.notes.map((n, i) => `
        <button class="note-item ${i === v.index ? 'on' : ''}" data-note="${i}">
          <b>${escapeHtml(n.title)}</b>
          <span class="note-prev">${escapeHtml(n.preview)}</span>
        </button>`).join('')}
    </aside>
    <div class="note-edit" contenteditable="true" spellcheck="false" data-note-body>${note.html}</div>
  </div>`;
}

function wireNotes(win) {
  const body = win.querySelector('.win-body');
  const v = state.views.notas;
  const editor = $('[data-note-body]', body);

  const save = () => {
    if (!editor) return;
    const note = v.notes[v.index];
    if (!note) return;
    note.html = editor.innerHTML;
    note.title = (editor.querySelector('h2')?.textContent || 'Nota').trim() || 'Nota';
    note.preview = (editor.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 46) || 'Sin contenido';
    const item = win.querySelector(`[data-note="${v.index}"]`);
    if (item) {
      const b = item.querySelector('b');
      const p = item.querySelector('.note-prev');
      if (b) b.textContent = note.title;
      if (p) p.textContent = note.preview;
    }
  };

  if (editor) {
    editor.addEventListener('input', save);
    editor.addEventListener('focusout', () => { save(); toast('Nota guardada', 1200); });
  }

  $$('[data-note]', body).forEach((item) => {
    item.addEventListener('click', () => {
      save();
      v.index = Number(item.dataset.note);
      rerenderWindow('notas');
    });
  });

  $$('[data-note-act]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      save();
      if (btn.dataset.noteAct === 'new') {
        v.notes.push({
          title: 'Nueva nota',
          preview: 'Empieza a escribir…',
          html: `<h2>Nueva nota</h2><div class="date">${todayLabel()}</div><p>Empieza a escribir…</p>`
        });
        v.index = v.notes.length - 1;
        rerenderWindow('notas');
        const ed = $('#windows .window[data-app="notas"] [data-note-body]');
        if (ed) { ed.focus(); ed.scrollTop = 0; }
        toast('Nota creada');
      } else {
        if (v.notes.length === 1) { toast('No puedes borrar la última nota'); return; }
        v.notes.splice(v.index, 1);
        v.index = Math.min(v.index, v.notes.length - 1);
        rerenderWindow('notas');
        toast('Nota eliminada');
      }
    });
  });
}

/* ---------------------------- Música ---------------------------- */

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function musicOrder() {
  const v = state.views.musica;
  const order = MUSIC_TRACKS.map((_, i) => i);
  if (v.filter === 'recientes') return order.reverse();
  if (v.filter === 'albumes') return order.sort((a, b) => MUSIC_TRACKS[a].artist.localeCompare(MUSIC_TRACKS[b].artist));
  return order;
}

function viewMusic() {
  const v = state.views.musica;
  const track = MUSIC_TRACKS[v.index];
  const pct = (v.progress / track.sec) * 100;
  const vol = state.system.mute ? 0 : state.system.volume;

  return `
  <div class="music">
    <aside class="sidebar">
      <h4>Biblioteca</h4>
      <button data-filter="todas" class="${v.filter === 'todas' ? 'on' : ''}">${icons('music')}<span>Reproduciendo</span></button>
      <button data-filter="albumes" class="${v.filter === 'albumes' ? 'on' : ''}">${icons('folder')}<span>Álbumes</span></button>
      <button data-filter="recientes" class="${v.filter === 'recientes' ? 'on' : ''}">${icons('clock')}<span>Recientes</span></button>
    </aside>
    <div class="music-meta">
      <div class="cover ${v.playing ? 'spin' : ''}">♪</div>
      <h3 data-track-title>${escapeHtml(track.title)}</h3>
      <p data-track-meta>${escapeHtml(track.artist)} · ${escapeHtml(track.album)}</p>
      <div class="bars ${v.playing ? '' : 'paused'}"><i></i><i></i><i></i><i></i><i></i></div>

      <div class="transport">
        <button data-music="prev" title="Anterior" aria-label="Anterior">${icons('prev')}</button>
        <button class="play" data-music="play" title="${v.playing ? 'Pausa' : 'Reproducir'}" aria-label="${v.playing ? 'Pausa' : 'Reproducir'}">${icons(v.playing ? 'pause' : 'play')}</button>
        <button data-music="next" title="Siguiente" aria-label="Siguiente">${icons('next')}</button>
      </div>

      <div class="seek-row">
        <span data-current>${fmtTime(v.progress)}</span>
        <input type="range" min="0" max="${track.sec}" value="${v.progress}" data-seek style="--fill:${pct.toFixed(1)}%" aria-label="Progreso">
        <span>${track.dur}</span>
      </div>

      <div class="volume-row">
        ${icons('volume')}
        <input type="range" min="0" max="100" value="${vol}" data-music-volume aria-label="Volumen">
        <span>${vol}%</span>
      </div>

      <ul class="tracklist">
        ${musicOrder().map((i) => `
          <li>
            <button data-track="${i}" class="${i === v.index ? 'on' : ''}">
              <span><span class="tnum">${i + 1}</span>${escapeHtml(MUSIC_TRACKS[i].title)} <small>· ${escapeHtml(MUSIC_TRACKS[i].artist)}</small></span>
              <span>${MUSIC_TRACKS[i].dur}</span>
            </button>
          </li>`).join('')}
      </ul>
    </div>
  </div>`;
}

function updateSeekUI(win) {
  const v = state.views.musica;
  const track = MUSIC_TRACKS[v.index];
  const seek = $('[data-seek]', win);
  if (seek) {
    seek.max = track.sec;
    seek.value = v.progress;
    paintRange(seek);
  }
  const cur = $('[data-current]', win);
  if (cur) cur.textContent = fmtTime(v.progress);
}

function wireMusic(win) {
  const body = win.querySelector('.win-body');
  const v = state.views.musica;

  $$('[data-music]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.music;
      if (act === 'play') v.playing = !v.playing;
      if (act === 'next') { v.index = (v.index + 1) % MUSIC_TRACKS.length; v.progress = 0; }
      if (act === 'prev') { v.index = (v.index - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length; v.progress = 0; }
      rerenderWindow('musica');
    });
  });

  $$('[data-track]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      v.index = Number(btn.dataset.track);
      v.progress = 0;
      v.playing = true;
      rerenderWindow('musica');
    });
  });

  $$('[data-filter]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      v.filter = btn.dataset.filter;
      rerenderWindow('musica');
    });
  });

  const seek = $('[data-seek]', body);
  if (seek) {
    seek.addEventListener('input', () => {
      v.progress = Number(seek.value);
      paintRange(seek);
      const cur = $('[data-current]', body);
      if (cur) cur.textContent = fmtTime(v.progress);
    });
  }

  const vol = $('[data-music-volume]', body);
  if (vol) {
    vol.addEventListener('input', () => {
      state.system.volume = Number(vol.value);
      state.system.mute = state.system.volume === 0;
      paintRange(vol);
      const label = vol.parentElement.querySelector('span');
      if (label) label.textContent = `${vol.value}%`;
      syncControlCenter();
    });
  }
}

function musicTick() {
  const v = state.views.musica;
  if (!v.playing) return;
  const track = MUSIC_TRACKS[v.index];
  v.progress += 1;
  if (v.progress >= track.sec) {
    v.index = (v.index + 1) % MUSIC_TRACKS.length;
    v.progress = 0;
    if (state.open.has('musica')) rerenderWindow('musica');
    return;
  }
  const win = state.open.get('musica')?.el;
  if (win) updateSeekUI(win);
}

/* ---------------------------- Terminal ---------------------------- */

const NEOFETCH_BLOCK = `
  <pre class="neo"><span style="color:#5aa9ff">      ▄▄▄▄▄▄▄      </span>  <span class="c">sebas</span>@<span class="c">liquidos</span>
<span style="color:#5aa9ff">    ▄█▀     ▀█▄    </span>  ----------------------
<span style="color:#7b5cff">    ██   ▄▄▄   ██   </span>  <span class="w">OS</span>: LiquidOS 1.0 "Torrente" x86_64
<span style="color:#7b5cff">    ██  █████  ██   </span>  <span class="w">Kernel</span>: 6.1.0-liquidos-amd64
<span style="color:#2fd1c5">     ▀█▄  ▀▀▀  ▄█▀    </span>  <span class="w">Shell</span>: zsh 5.9
<span style="color:#2fd1c5">      ▀▀▀▀▀▀▀      </span>  <span class="w">DE</span>: GNOME (LiquidShell)
                        <span class="w">WM</span>: Mutter
                        <span class="w">Theme</span>: WhiteSur-Dark
                        <span class="w">Icons</span>: WhiteSur-dark
                        <span class="w">CPU</span>: AMD Ryzen 7 (16) @ 3.8GHz
                        <span class="w">Memory</span>: 2.4GiB / 16GiB</pre>`;

const TERM_USER = 'sebas';
const TERM_HOST = 'liquidos';

const OS_RELEASE_TEXT = `NAME="LiquidOS"
VERSION="1.0 (Torrente)"
VERSION_ID="1.0"
ID=liquidos
ID_LIKE=debian
PRETTY_NAME="LiquidOS 1.0 (Torrente)"
HOME_URL="https://liquidos.example"`;

const TERM_HELP = `Comandos disponibles:<br>
<span class="c">help</span> · <span class="c">neofetch</span> · <span class="c">liquidos help</span><br><br>
<b>Archivos</b><br>
<span class="c">pwd</span> · <span class="c">ls [-la]</span> · <span class="c">cd</span> · <span class="c">cat</span> · <span class="c">head</span> · <span class="c">tail</span><br>
<span class="c">touch</span> · <span class="c">mkdir</span> · <span class="c">rm</span> · <span class="c">cp</span> · <span class="c">mv</span> · <span class="c">find</span> · <span class="c">tree</span><br>
<span class="c">grep</span> · <span class="c">wc</span> · <span class="c">sort</span> · <span class="c">echo texto &gt; archivo</span> · <span class="c">cat archivo | grep algo</span><br><br>
<b>Sistema</b><br>
<span class="c">whoami</span> · <span class="c">hostname</span> · <span class="c">uname -a</span> · <span class="c">date</span> · <span class="c">uptime</span><br>
<span class="c">free -h</span> · <span class="c">df -h</span> · <span class="c">ps</span> · <span class="c">ping</span> · <span class="c">curl</span> · <span class="c">clear</span><br><br>
<b>Paquetes y ajustes</b><br>
<span class="c">sudo apt update</span> · <span class="c">sudo apt install vlc</span> · <span class="c">apt search foto</span><br>
<span class="c">flatpak search vlc</span> · <span class="c">flatpak install flathub org.gimp.GIMP</span> · <span class="c">liquidos doctor</span> · <span class="c">liquidos store</span><br>
<span class="c">theme light|dark</span> · <span class="c">accent azul</span> · <span class="c">wallpaper oceano</span><br>
<span class="c">open firefox|correo|software|ajustes</span> · <span class="c">history</span> · <span class="c">exit</span>`;

/* Sistema de archivos del terminal (independiente de la app Archivos) */

const TERM_FS = {
  '/': { dirs: ['etc', 'home', 'tmp', 'usr', 'var'], files: {} },
  '/home': { dirs: ['sebas'], files: {} },
  '/home/sebas': {
    dirs: ['Documentos', 'Descargas', 'Escritorio', 'Imágenes', 'Música', 'Proyectos'],
    files: {
      'bienvenida.txt': 'Bienvenido a LiquidOS 1.0 «Torrente».\nTodo lo que necesitas está instalado: Firefox, Thunderbird, el Centro de software y una terminal completa.\n\nPrueba: liquidos doctor',
      'notas.txt': 'Ideas para el escritorio\n- Probar el nuevo Centro de software\n- Cambiar el color de acento\n- Instalar VLC con apt',
      '.zshrc': 'PROMPT="%F{39}%n%f@%F{141}%m%f %F{244}%~%f %F{39}❯%f "\nalias actualizar="liquidos update"\nalias tienda="liquidos store"'
    }
  },
  '/home/sebas/Documentos': { dirs: [], files: { 'notas-reunion.md': '# Reunión del lunes\n- Revisar el Dock\n- Probar Firefox\n- Preparar la ISO', 'presupuesto.ods': '(documento de LibreOffice Calc)' } },
  '/home/sebas/Descargas': { dirs: [], files: { 'LiquidOS-1.0-amd64.iso': '(imagen de 2,4 GB)', 'captura-arranque.png': '(imagen PNG de 300 KB)' } },
  '/home/sebas/Escritorio': { dirs: [], files: {} },
  '/home/sebas/Imágenes': { dirs: [], files: { 'fondo-oscuro.png': '(imagen PNG de 1,2 MB)', 'captura-escritorio.png': '(imagen PNG de 820 KB)' } },
  '/home/sebas/Música': { dirs: [], files: { 'oceano-de-datos.mp3': '(audio MP3 de 3:42)' } },
  '/home/sebas/Proyectos': { dirs: ['liquidos'], files: {} },
  '/home/sebas/Proyectos/liquidos': { dirs: [], files: { 'README.md': '# LiquidOS\nUna distribución basada en Debian 12 con un escritorio inspirado en macOS.', 'Makefile': 'iso:\n\t./build/build-iso.sh' } },
  '/etc': { dirs: ['apt', 'skel'], files: { 'os-release': OS_RELEASE_TEXT, hostname: 'liquidos', shells: '/bin/sh\n/bin/bash\n/bin/zsh' } },
  '/etc/apt': { dirs: ['sources.list.d'], files: { 'sources.list': 'deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware\ndeb http://deb.debian.org/debian bookworm-updates main\ndeb http://security.debian.org bookworm-security main' } },
  '/etc/apt/sources.list.d': { dirs: [], files: { 'flathub.list': '# Flathub se gestiona con flatpak, no con apt' } },
  '/etc/skel': { dirs: [], files: { '.zshrc': 'PROMPT="%F{39}%n%f@%F{141}%m%f %F{244}%~%f %F{39}❯%f "' } },
  '/tmp': { dirs: [], files: {} },
  '/usr': { dirs: ['bin', 'share'], files: {} },
  '/usr/bin': { dirs: [], files: { firefox: '(binario)', thunderbird: '(binario)', 'gnome-terminal': '(binario)', liquidos: '(script del sistema)' } },
  '/usr/share': { dirs: ['applications'], files: {} },
  '/usr/share/applications': { dirs: [], files: { 'firefox-esr.desktop': '[Desktop Entry]\nName=Firefox\nExec=firefox-esr %u', 'thunderbird.desktop': '[Desktop Entry]\nName=Thunderbird' } },
  '/var': { dirs: ['log'], files: {} },
  '/var/log': { dirs: [], files: { syslog: 'Oct 28 09:41:02 liquidos systemd[1]: Started GNOME Session Manager.\nOct 28 09:41:04 liquidos NetworkManager[712]: <info> conectado a liquido-5G' } }
};

const TERM_COMMANDS = [
  'help', 'neofetch', 'pwd', 'ls', 'cd', 'cat', 'head', 'tail', 'touch', 'mkdir', 'rm', 'cp', 'mv',
  'find', 'tree', 'grep', 'wc', 'sort', 'uniq', 'echo', 'date', 'whoami', 'hostname', 'uname',
  'uptime', 'free', 'df', 'ps', 'ping', 'curl', 'clear', 'history', 'open', 'theme', 'accent',
  'wallpaper', 'apt', 'flatpak', 'liquidos', 'exit'
];

const termHistory = [];
let termHistIndex = 0;
let termCwd = '/home/sebas';
let termSudo = false;

function termNorm(path) {
  const parts = path.split('/').filter(Boolean);
  const out = [];
  parts.forEach((p) => {
    if (p === '.') return;
    if (p === '..') out.pop();
    else out.push(p);
  });
  return '/' + out.join('/');
}

function termAbs(path) {
  if (!path) return termCwd;
  let p = path;
  if (p === '~') p = '/home/sebas';
  else if (p.startsWith('~/')) p = '/home/sebas/' + p.slice(2);
  if (!p.startsWith('/')) p = termCwd + '/' + p;
  return termNorm(p);
}

function termDisplay(path = termCwd) {
  return path.replace(/^\/home\/sebas/, '~') || '/';
}

function termNode(path) {
  return TERM_FS[termNorm(path)] || null;
}

function termParent(path) {
  const norm = termNorm(path);
  return norm === '/' ? null : termNorm(norm.replace(/\/[^/]+$/, '') || '/');
}

function termIsDir(path) {
  return Boolean(termNode(path));
}

function termList(path) {
  const node = termNode(path);
  if (!node) return null;
  return [...node.dirs.map((d) => ({ name: d, dir: true })), ...Object.keys(node.files).map((f) => ({ name: f, dir: false }))];
}

function termRead(path) {
  const node = termNode(termParent(path));
  if (!node) return null;
  const name = termNorm(path).split('/').pop();
  return Object.prototype.hasOwnProperty.call(node.files, name) ? node.files[name] : null;
}

function termWrite(path, content, append = false) {
  const norm = termNorm(path);
  const parent = termNode(termParent(norm));
  if (!parent) return false;
  const name = norm.split('/').pop();
  parent.files[name] = append && parent.files[name] !== undefined ? parent.files[name] + content : content;
  return true;
}

function termRemove(path) {
  const norm = termNorm(path);
  const parent = termNode(termParent(norm));
  if (!parent) return false;
  const name = norm.split('/').pop();
  if (Object.prototype.hasOwnProperty.call(parent.files, name)) { delete parent.files[name]; return true; }
  const idx = parent.dirs.indexOf(name);
  if (idx >= 0) { parent.dirs.splice(idx, 1); delete TERM_FS[norm]; return true; }
  return false;
}

function termMakeDir(path) {
  const norm = termNorm(path);
  if (TERM_FS[norm]) return false;
  const parent = termNode(termParent(norm));
  if (!parent) return false;
  const name = norm.split('/').pop();
  parent.dirs.push(name);
  TERM_FS[norm] = { dirs: [], files: {} };
  return true;
}

function termPromptText() {
  return `${TERM_USER}@${TERM_HOST}:${termDisplay()}$`;
}

function termPromptHtml() {
  return `<span class="prompt">${TERM_USER}@${TERM_HOST}</span>:<span class="d">${escapeHtml(termDisplay())}</span>$`;
}

function viewTerminal() {
  return `
  <div class="term" data-term>
    <div class="term-scroll" data-term-out>
      ${NEOFETCH_BLOCK}
      <div class="term-line dim">Escribe <span class="c">help</span> para ver todos los comandos o <span class="c">liquidos doctor</span> para revisar el sistema.</div>
      <div class="term-line dim">Firefox, Thunderbird y el Centro de software ya vienen instalados.</div>
    </div>
    <div class="term-line term-input-row">
      <span data-term-prompt>${termPromptHtml()}</span>&nbsp;<input class="term-input" data-term-input autocomplete="off" spellcheck="false" aria-label="Comando" placeholder="">
    </div>
  </div>`;
}

function updateTermPrompt(win) {
  const el = win.querySelector('[data-term-prompt]');
  if (el) el.innerHTML = termPromptHtml();
}

function termPrint(out, html) {
  out.insertAdjacentHTML('beforeend', html);
  out.scrollTop = out.scrollHeight;
}

function termLine(html) {
  return `<div class="term-line">${html}</div>`;
}

function termText(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function termTokens(str) {
  const out = [];
  let cur = '';
  let quote = null;
  for (const ch of str) {
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (/\s/.test(ch)) {
      if (cur) { out.push(cur); cur = ''; }
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

function termWalk(path, depth = 0, acc = []) {
  const node = termNode(path);
  if (!node || depth > 4) return acc;
  acc.push({ path, node, depth });
  node.dirs.forEach((d) => termWalk(termNorm(path + '/' + d), depth + 1, acc));
  return acc;
}

function termGrep(input, pattern, ignoreCase) {
  const re = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), ignoreCase ? 'i' : '');
  return input.split('\n').filter((l) => re.test(l)).join('\n');
}

function termApt(args) {
  const action = (args[0] || '').toLowerCase();
  const pkgs = args.slice(1).filter((a) => !a.startsWith('-'));

  if (!action) return 'Uso: apt <update|install|remove|search|list> [paquete]';

  if (action === 'update') {
    return 'Leyendo listas de paquetes… Hecho\nConstruyendo árbol de dependencias… Hecho\nLeyendo información de estado… Hecho\n\n3 paquetes pueden actualizarse. Ejecuta «liquidos update» para hacerlo.';
  }

  if (action === 'list') {
    const installed = state.software.installed.map((id) => swItem(id)).filter(Boolean);
    return installed.map((it) => `${it.id}/now ${it.size} instalado`).join('\n') + '\n\n' + CATALOG.length + ' paquetes disponibles en el catálogo.';
  }

  if (action === 'search') {
    const q = pkgs.join(' ').toLowerCase();
    if (!q) return 'Uso: apt search <texto>';
    const sinTildes = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const needle = sinTildes(q);
    const hits = CATALOG.filter((it) => sinTildes(it.name).includes(needle) || sinTildes(it.summary).includes(needle));
    if (!hits.length) return `No se encontraron paquetes para «${q}».`;
    return hits.map((it) => `${it.id} — ${it.name} · ${it.summary}`).join('\n');
  }

  if (action === 'install' || action === 'remove' || action === 'purge') {
    if (!pkgs.length) return `Uso: sudo apt ${action} <paquete>`;
    if (action === 'install') {
      if (!termSudo) return 'E: No se pudo abrir el archivo de bloqueo /var/lib/dpkg/lock-frontend — ¿eres root? Prueba con sudo.';
      const lines = [];
      pkgs.forEach((p) => {
        const it = swItem(p) || CATALOG.find((c) => c.name.toLowerCase() === p.toLowerCase());
        if (!it) {
          lines.push(`Se instalará ${p} desde los repositorios de Debian`);
          lines.push(`Descomprimiendo ${p}…`);
          lines.push(`Configurando ${p}…`);
          return;
        }
        if (!state.software.installed.includes(it.id)) state.software.installed.push(it.id);
        state.software.updates = state.software.updates.filter((x) => x !== it.id);
        lines.push(`Se instalarán los siguientes paquetes: ${it.name} (${it.size})`);
        lines.push(`Descomprimiendo ${it.id}…`);
        lines.push(`Configurando ${it.name}…`);
      });
      if (state.open.has('software')) rerenderWindow('software');
      lines.push('Hecho. Las aplicaciones nuevas aparecen en el Centro de software.');
      toast('Paquetes instalados');
      return lines.join('\n');
    }
    const lines = [];
    pkgs.forEach((p) => {
      const it = swItem(p);
      if (!it) { lines.push(`Eliminando ${p}…`); return; }
      if (it.core) { lines.push(`E: ${it.name} es parte del sistema base de LiquidOS`); return; }
      state.software.installed = state.software.installed.filter((x) => x !== it.id);
      lines.push(`Eliminando ${it.name}…`);
    });
    if (state.open.has('software')) rerenderWindow('software');
    lines.push('Hecho.');
    return lines.join('\n');
  }

  return `E: Operación «${action}» no reconocida`;
}

function termLiquidos(args) {
  const sub = (args[0] || 'help').toLowerCase();

  if (sub === 'help' || sub === 'ayuda') {
    return `LiquidOS · utilidades del sistema

  liquidos info              Resumen del equipo
  liquidos apps              Aplicaciones instaladas
  liquidos search <texto>    Buscar paquetes
  liquidos install <paq>     Instalar paquetes
  liquidos remove <paq>      Desinstalar paquetes
  liquidos doctor            Comprobar el sistema
  liquidos update            Actualizar
  liquidos store             Abrir el Centro de software
  liquidos theme dark|light  Cambiar la apariencia
  liquidos wallpaper <id>    Cambiar el fondo
  liquidos report            Generar un informe de soporte`;
  }

  if (sub === 'info') {
    return `LiquidOS 1.0 «Torrente»
Sistema      Debian 12 (bookworm) · GNOME
Kernel       ${'6.1.0-liquidos-amd64'}
Navegador    Firefox (ESR)
Correo       Thunderbird
Memoria      2,4 GiB de 16 GiB
Disco        24 GiB de 64 GiB (38 % usado)`;
  }

  if (sub === 'apps') {
    return state.software.installed
      .map((id) => swItem(id))
      .filter(Boolean)
      .map((it) => `  · ${it.name} (${it.cat})`)
      .join('\n');
  }

  if (sub === 'doctor') {
    const s = state.system;
    const checks = [
      [true, 'Firefox instalado'],
      [true, 'Thunderbird instalado'],
      [state.software.installed.length > 0, 'Centro de software operativo'],
      [s.wifi, `Red ${s.wifi ? 'conectada a ' + s.wifiNetwork : 'desconectada'}`],
      [state.system.snd && !state.system.mute, 'Audio disponible'],
      [true, 'Flathub configurado'],
      [true, 'Espacio en disco suficiente (38 %)'],
      [true, 'Sesión gráfica activa (GNOME)']
    ];
    return checks.map(([ok, label]) => `  ${ok ? '✔' : '✘'} ${label}`).join('\n');
  }

  if (sub === 'theme') {
    if (args[1] === 'light' || args[1] === 'dark') { setTheme(args[1]); return `Tema cambiado a ${args[1]}`; }
    return 'Uso: liquidos theme dark|light';
  }

  if (sub === 'store') { openApp('software'); return 'Abriendo el Centro de software…'; }

  if (sub === 'install') {
    termSudo = true;
    return termApt(['install', ...args.slice(1)]);
  }

  if (sub === 'remove' || sub === 'uninstall') {
    termSudo = true;
    return termApt(['remove', ...args.slice(1)]);
  }

  if (sub === 'search' || sub === 'buscar') {
    return termApt(['search', ...args.slice(1)]);
  }

  if (sub === 'update') {
    return 'Leyendo listas de paquetes… Hecho\nCalculando la actualización… Hecho\n0 paquetes actualizados, 0 eliminados. Todo está al día.';
  }

  if (sub === 'report' || sub === 'reporte') {
    return 'Informe generado en /tmp/liquidos-report.txt\nIncluye versión del núcleo, estado de la red, audio y los últimos errores del sistema.';
  }

  if (sub === 'wallpaper') {
    const wall = WALLS.find((w) => w.id === args[1]);
    if (!wall) return 'Uso: liquidos wallpaper ' + WALLS.map((w) => w.id).join('|');
    setPref('wall', wall.id, `Fondo cambiado a ${wall.name}`);
    return `Fondo de pantalla: ${wall.name}`;
  }

  return `liquidos: orden desconocida «${sub}». Prueba «liquidos help».`;
}

function termStage(seg, input) {
  const tokens = termTokens(seg);
  if (!tokens.length) return { text: input || '' };

  let cmd = tokens.shift().toLowerCase();
  const args = tokens;
  if (cmd === 'sudo') {
    termSudo = true;
    cmd = (args.shift() || '').toLowerCase();
  } else {
    termSudo = false;
  }

  const argPath = (i = 0) => (args[i] ? termAbs(args[i]) : termCwd);

  switch (cmd) {
    case 'help': return { html: '<div class="term-line">' + TERM_HELP + '</div>' };
    case 'neofetch': return { html: NEOFETCH_BLOCK };

    case 'pwd': return { text: termCwd };

    case 'cd': {
      const target = args[0] ? termAbs(args[0]) : '/home/sebas';
      if (!termIsDir(target)) return { text: `cd: ${args[0]}: No existe el directorio` };
      termCwd = target;
      updateTermPrompt(state.open.get('terminal')?.el || document);
      return {};
    }

    case 'ls': {
      const showAll = args.some((a) => /^-[a-z]*a/.test(a));
      const long = args.some((a) => /^-[a-z]*l/.test(a));
      const target = args.find((a) => !a.startsWith('-'));
      const path = target ? termAbs(target) : termCwd;
      const items = termList(path);
      if (!items) {
        const file = termRead(path);
        if (file !== null) return { text: termNorm(path).split('/').pop() };
        return { text: `ls: no se puede acceder a «${target || path}»: No existe el archivo o directorio` };
      }
      let visible = items.filter((it) => showAll || !it.name.startsWith('.'));
      if (!visible.length) return { text: '' };
      if (long) {
        return {
          text: visible.map((it) => `${it.dir ? 'drwxr-xr-x' : '-rw-r--r--'}  sebas sebas  ${it.dir ? '4,0K' : '1,2K'}  ${it.name}${it.dir ? '/' : ''}`).join('\n')
        };
      }
      return { text: visible.map((it) => it.name + (it.dir ? '/' : '')).join('   ') };
    }

    case 'cat': {
      if (!args.length) return { text: input || '' };
      const parts = args.map((a) => {
        const path = termAbs(a);
        const text = termRead(path);
        if (text !== null) return text;
        if (termIsDir(path)) return `cat: ${a}: Es un directorio`;
        return `cat: ${a}: No existe el archivo o directorio`;
      });
      return { text: parts.join('\n') };
    }

    case 'head':
    case 'tail': {
      const nIdx = args.findIndex((a) => a === '-n');
      const n = nIdx >= 0 ? Number(args[nIdx + 1]) || 10 : 10;
      const file = args.find((a, i) => !a.startsWith('-') && !(nIdx >= 0 && i === nIdx + 1));
      const body = file ? termRead(termAbs(file)) : (input ?? '');
      if (body === null) return { text: `${cmd}: ${file}: No existe el archivo` };
      const lines = body.split('\n');
      return { text: (cmd === 'head' ? lines.slice(0, n) : lines.slice(-n)).join('\n') };
    }

    case 'touch': {
      if (!args.length) return { text: 'Uso: touch <archivo>' };
      const results = args.map((a) => {
        const path = termAbs(a);
        if (termRead(path) !== null) return null;
        const ok = termWrite(path, '');
        return ok ? null : `touch: no se puede crear «${a}»`;
      }).filter(Boolean);
      return { text: results.join('\n') };
    }

    case 'mkdir': {
      const dirs = args.filter((a) => !a.startsWith('-'));
      if (!dirs.length) return { text: 'Uso: mkdir <directorio>' };
      const res = dirs.map((d) => (termMakeDir(termAbs(d)) ? null : `mkdir: no se puede crear «${d}»`)).filter(Boolean);
      return { text: res.join('\n') };
    }

    case 'rm': {
      const recursive = args.some((a) => /^-[a-z]*r/.test(a));
      const files = args.filter((a) => !a.startsWith('-'));
      if (!files.length) return { text: 'Uso: rm <archivo>' };
      const res = files.map((f) => {
        const path = termAbs(f);
        if (termIsDir(path) && !recursive) return `rm: «${f}» es un directorio (usa -r)`;
        return termRemove(path) ? null : `rm: no se puede eliminar «${f}»: No existe`;
      }).filter(Boolean);
      return { text: res.join('\n') };
    }

    case 'cp':
    case 'mv': {
      if (args.length < 2) return { text: `Uso: ${cmd} <origen> <destino>` };
      const src = termAbs(args[0]);
      let dest = termAbs(args[1]);
      if (termIsDir(dest)) dest = termNorm(dest + '/' + termNorm(src).split('/').pop());
      const content = termRead(src);
      if (content === null) return { text: `${cmd}: ${args[0]}: No existe` };
      termWrite(dest, content);
      if (cmd === 'mv') termRemove(src);
      return {};
    }

    case 'find': {
      const startArg = args.find((a) => !a.startsWith('-') && !args[args.indexOf(a) - 1]?.startsWith('-name'));
      const start = startArg && !startArg.includes('*') ? termAbs(startArg) : termCwd;
      const nameIdx = args.findIndex((a) => a === '-name');
      const pattern = nameIdx >= 0 ? args[nameIdx + 1] : null;
      const entries = termWalk(start);
      const re = pattern ? new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$') : null;
      const res = entries
        .filter((e) => !re || re.test(e.path.split('/').pop()))
        .map((e) => e.path);
      return { text: res.join('\n') || 'Sin resultados' };
    }

    case 'tree': {
      const start = args[0] ? termAbs(args[0]) : termCwd;
      const lines = [termDisplay(start)];
      const walk = (path, prefix) => {
        const items = termList(path) || [];
        items.forEach((it, i) => {
          const last = i === items.length - 1;
          lines.push(prefix + (last ? '└── ' : '├── ') + it.name + (it.dir ? '/' : ''));
          if (it.dir) walk(termNorm(path + '/' + it.name), prefix + (last ? '    ' : '│   '));
        });
      };
      walk(start, '');
      return { text: lines.join('\n') };
    }

    case 'grep': {
      const ignoreCase = args.includes('-i');
      const clean = args.filter((a) => !a.startsWith('-'));
      const pattern = clean.shift();
      if (!pattern) return { text: 'Uso: grep <texto> [archivo]' };
      if (clean.length) {
        const path = termAbs(clean[0]);
        const body = termRead(path);
        if (body === null) return { text: `grep: ${clean[0]}: No existe` };
        const found = termGrep(body, pattern, ignoreCase);
        return { text: found ? found.split('\n').map((l) => `${clean[0]}:${l}`).join('\n') : '' };
      }
      return { text: termGrep(input ?? '', pattern, ignoreCase) };
    }

    case 'wc': {
      const body = input ?? termRead(termAbs(args[0] || '')) ?? '';
      const lines = body ? body.split('\n').length : 0;
      const words = body.trim() ? body.trim().split(/\s+/).length : 0;
      const chars = body.length;
      return { text: `${String(lines).padStart(6)} ${String(words).padStart(6)} ${String(chars).padStart(6)}` };
    }

    case 'sort': {
      return { text: (input ?? '').split('\n').filter(Boolean).sort().join('\n') };
    }

    case 'uniq': {
      return { text: (input ?? '').split('\n').filter((l, i, a) => l !== a[i - 1]).join('\n') };
    }

    case 'echo': {
      return { text: args.join(' ') };
    }

    case 'date':
      return { text: new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'medium' }).format(new Date()) };
    case 'whoami': return { text: TERM_USER };
    case 'hostname': return { text: TERM_HOST };
    case 'uname':
      return { text: args.includes('-a') ? 'Linux liquidos 6.1.0-liquidos-amd64 #1 SMP Debian 6.1.0 x86_64 GNU/Linux' : 'Linux' };
    case 'uptime':
      return { text: ' 09:41:00 up 12 min, 1 user, load average: 0,42, 0,31, 0,18' };
    case 'free':
      return { text: `               total        usado        libre\nMemoria:       15Gi         2,4Gi        12Gi\nSwap:          2,0Gi          0B       2,0Gi` };
    case 'df':
      return { text: `S.ficheros     Tamaño Usados  Disp Uso% Montado en\n/dev/vda2        64G    24G    38G  38% /\n/dev/vda1       512M   128M   384M  25% /boot` };
    case 'ps':
      return { text: `  PID TTY          TIME CMD\n 1421 tty1     00:00:02 gnome-shell\n 1530 pts/0    00:00:00 zsh\n 1534 pts/0    00:00:00 firefox-esr\n 1587 pts/0    00:00:00 thunderbird` };
    case 'ping':
      return { text: `Haciendo ping a ${args[0] || 'liquidos.local'}…\n64 bytes: icmp_seq=1 ttl=64 tiempo=0.412 ms\n64 bytes: icmp_seq=2 ttl=64 tiempo=0.388 ms\n64 bytes: icmp_seq=3 ttl=64 tiempo=0.401 ms\n\n3 paquetes transmitidos, 3 recibidos, 0 % perdidos` };
    case 'curl':
      if ((args[0] || '').includes('liquidos.local')) {
        return { text: '<!doctype html>\n<title>LiquidOS</title>\n<h1>Bienvenido a LiquidOS</h1>\n<p>Tu escritorio, fluido y silencioso.</p>' };
      }
      return { text: `curl: (6) no se pudo resolver el host «${args[0] || ''}»` };

    case 'history':
      return { text: termHistory.map((c, i) => `${String(i + 1).padStart(3)}  ${c}`).join('\n') || 'Sin comandos todavía' };

    case 'open': {
      const target = (args[0] || '').toLowerCase();
      const map = { archivos: 'archivos', firefox: 'navegador', navegador: 'navegador', thunderbird: 'correo', correo: 'correo', software: 'software', notas: 'notas', musica: 'musica', música: 'musica', terminal: 'terminal', ajustes: 'ajustes' };
      if (map[target]) { openApp(map[target]); return { text: `Abriendo ${target}…` }; }
      return { text: `open: ${target || ''}: aplicación desconocida` };
    }

    case 'theme':
      if (args[0] === 'light' || args[0] === 'dark') { setTheme(args[0]); return { text: `Tema cambiado a ${args[0]}` }; }
      return { text: 'Uso: theme light|dark' };

    case 'accent': {
      const acc = ACCENTS.find((a) => a.id === args[0] || a.color === args[0]);
      if (!acc) return { text: 'Uso: accent ' + ACCENTS.map((a) => a.id).join('|') };
      setPref('accent', acc.color, `Color de acento: ${acc.name}`);
      return { text: `Color de acento: ${acc.name}` };
    }

    case 'wallpaper': {
      const wall = WALLS.find((w) => w.id === args[0]);
      if (!wall) return { text: 'Uso: wallpaper ' + WALLS.map((w) => w.id).join('|') };
      setPref('wall', wall.id, `Fondo: ${wall.name}`);
      return { text: `Fondo de pantalla: ${wall.name}` };
    }

    case 'apt': return { text: termApt(args) };
    case 'liquidos': return { text: termLiquidos(args) };

    case 'flatpak': {
      const sub = (args[0] || '').toLowerCase();
      if (sub === 'remotes') return { text: 'flathub\thttps://dl.flathub.org/repo/\n  Sistema\n  Prioridad 1' };
      if (sub === 'search') {
        const q = args.slice(1).join(' ').trim().toLowerCase();
        if (!q) return { text: 'Uso: flatpak search <texto>' };
        const source = [...(state.software.real || []), ...CATALOG];
        const seen = new Set();
        const rows = [];
        for (const it of source) {
          if (!it || !it.id || seen.has(it.id)) continue;
          const hay = `${it.name || ''} ${it.id} ${it.summary || ''}`.toLowerCase();
          if (!hay.includes(q)) continue;
          seen.add(it.id);
          rows.push(`${it.name || it.id}\t${it.id}\t${(it.summary || '').slice(0, 60)}`);
        }
        return {
          text: rows.length
            ? rows.slice(0, 12).join('\n') + (rows.length > 12 ? `\n… y ${rows.length - 12} más. Ábrelo en el Centro de software.` : '')
            : `No se encontraron aplicaciones para «${q}» en Flathub.\nPrueba en el Centro de software, que consulta el catálogo completo.`
        };
      }
      if (sub === 'install') {
        const ref = args.slice(1).join(' ');
        const app = CATALOG.find((c) => ref.toLowerCase().includes(c.id) || ref.toLowerCase().includes(c.name.toLowerCase().replace(/\s/g, '')));
        if (app) {
          if (!state.software.installed.includes(app.id)) state.software.installed.push(app.id);
          if (state.open.has('software')) rerenderWindow('software');
          return { text: `Buscando coincidencias…\nInstalando ${app.id} desde flathub\n  ████████████████████ 100 %\nInstalación completa.` };
        }
        return { text: `error: No se encontró «${ref}» en Flathub` };
      }
      if (sub === 'uninstall' || sub === 'remove') {
        const ref = args.slice(1).join(' ');
        const app = CATALOG.find((c) => ref.toLowerCase().includes(c.id));
        if (!app) return { text: `error: ${ref || '(vacío)'} no está instalada` };
        state.software.installed = state.software.installed.filter((id) => id !== app.id);
        if (state.open.has('software')) rerenderWindow('software');
        return { text: `Desinstalando ${app.id}…\nDesinstalación completa.` };
      }
      if (sub === 'update') {
        return { text: 'Buscando actualizaciones…\nNada que actualizar.' };
      }
      if (sub === 'list') {
        return { text: state.software.installed.map((id) => (swItem(id) || {}).name).filter(Boolean).map((n) => `${n}\tstable`).join('\n') };
      }
      return { text: 'Uso: flatpak <search|install|uninstall|update|list|remotes> [ref]' };
    }

    case 'clear':
    case 'exit':
      return null;

    default:
      return { text: `zsh: no se encontró la orden: ${cmd}\nPrueba con «help» para ver los comandos disponibles.` };
  }
}

function termPipeline(seg) {
  let body = seg;
  let redirect = null;
  let append = false;

  const redir = seg.match(/^(.*?)\s*(>>?)\s*([^\s|]+)\s*$/);
  if (redir && !seg.includes('|')) {
    body = redir[1].trim();
    append = redir[2] === '>>';
    redirect = redir[3];
  }

  const stages = body.split('|').map((s) => s.trim()).filter(Boolean);
  let text = null;
  let html = null;

  for (const stage of stages) {
    const res = termStage(stage, text);
    if (res === null) return null;
    if (!res) continue;
    if (res.html) { html = res.html; text = ''; continue; }
    text = res.text ?? '';
    html = null;
  }

  if (redirect) {
    const path = termAbs(redirect);
    if (!termWrite(path, text ?? '', append)) {
      return { text: `zsh: no existe el directorio para «${redirect}»` };
    }
    toast(`Escrito en ${termDisplay(path)}`, 1200);
    return {};
  }

  if (html) return { html };
  return { text: text ?? '' };
}

function termRun(win, raw) {
  const out = win.querySelector('[data-term-out]');
  if (!out) return;

  termPrint(out, termLine(`${termPromptHtml()} ${escapeHtml(raw)}`));

  const line = raw.trim();
  if (!line) { updateTermPrompt(win); return; }

  if (termHistory[termHistory.length - 1] !== line) termHistory.push(line);
  termHistIndex = termHistory.length;

  const parts = line.split('&&').map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    if (part === 'exit' || part === 'logout') { closeWin('terminal'); return; }
    if (part === 'clear' || part === 'cls') { out.innerHTML = ''; return; }
    const res = termPipeline(part);
    if (res === null) return;
    if (!res) continue;
    if (res.html) termPrint(out, res.html);
    else if (res.text) termPrint(out, termLine(termText(res.text)));
  }

  updateTermPrompt(win);
}

function termComplete(input) {
  const parts = input.split(' ');
  const last = parts[parts.length - 1];
  let pool = [];

  if (parts.length === 1) {
    pool = TERM_COMMANDS;
  } else {
    const dir = last.includes('/') ? termAbs(last.slice(0, last.lastIndexOf('/') + 1)) : termCwd;
    const base = last.includes('/') ? last.slice(last.lastIndexOf('/') + 1) : last;
    pool = (termList(dir) || []).filter((it) => it.name.startsWith(base)).map((it) => it.name);
  }

  const hits = pool.filter((c) => c.startsWith(last));
  if (!hits.length) return input;
  if (hits.length === 1) {
    parts[parts.length - 1] = hits[0];
    return parts.join(' ') + ' ';
  }
  return input;
}

function wireTerminal(win) {
  const input = win.querySelector('[data-term-input]');
  const term = win.querySelector('[data-term]');
  if (!input || !term) return;

  updateTermPrompt(win);
  term.addEventListener('click', () => input.focus());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = input.value;
      input.value = '';
      termRun(win, value);
    } else if (e.key === 'ArrowUp') {
      if (!termHistory.length) return;
      e.preventDefault();
      termHistIndex = Math.max(0, termHistIndex - 1);
      input.value = termHistory[termHistIndex] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      termHistIndex = Math.min(termHistory.length, termHistIndex + 1);
      input.value = termHistory[termHistIndex] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      input.value = termComplete(input.value);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      const out = win.querySelector('[data-term-out]');
      if (out) out.innerHTML = '';
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      const out = win.querySelector('[data-term-out]');
      if (out) termPrint(out, termLine(`${termPromptHtml()} ${escapeHtml(input.value)}`));
      input.value = '';
    }
  });

  setTimeout(() => input.focus(), 80);
}

/* ---------------------------- Ajustes ---------------------------- */

const SETTINGS_SECTIONS = [
  { id: 'wifi', label: 'Wi-Fi', glyph: 'wifi' },
  { id: 'apariencia', label: 'Apariencia', glyph: 'settings' },
  { id: 'personalizacion', label: 'Personalización', glyph: 'palette' },
  { id: 'dock', label: 'Escritorio y Dock', glyph: 'desktop' },
  { id: 'sonido', label: 'Sonido', glyph: 'music' },
  { id: 'pantalla', label: 'Pantalla', glyph: 'clock' }
];

const OUTPUT_DEVICES = ['Altavoces internos', 'Auriculares', 'HDMI / Pantalla'];
const RESOLUTIONS = ['1920 × 1080', '2560 × 1440', '1366 × 768'];

function viewSettings() {
  const sec = state.views.ajustes.section;
  return `
  <div class="settings">
    <aside class="sidebar">
      <h4>Sistema</h4>
      ${SETTINGS_SECTIONS.map((s) => `
        <button data-section="${s.id}" class="${sec === s.id ? 'on' : ''}">${icons(s.glyph)}<span>${s.label}</span></button>`).join('')}
      <h4>Acerca de</h4>
      <button data-section="acerca" class="${sec === 'acerca' ? 'on' : ''}">${icons('doc')}<span>Información del sistema</span></button>
    </aside>
    <div class="set-body">${settingsPanel(sec)}</div>
  </div>`;
}

function settingsPanel(sec) {
  const s = state.system;

  if (sec === 'wifi') {
    return `
      <h3>Wi-Fi</h3>
      <p class="sub">Elige una red. La conexión es simulada, pero el estado se comparte con el Centro de control.</p>
      <div class="row">
        <div><b>Wi-Fi</b><small>${s.wifi ? `Conectado a ${escapeHtml(s.wifiNetwork)}` : 'Desactivado'}</small></div>
        <button class="switch ${s.wifi ? 'on' : ''}" data-sys="wifi" aria-label="Wi-Fi"></button>
      </div>
      <div class="net-list ${s.wifi ? '' : 'off'}">
        ${NETWORKS.map((n) => `
          <button class="net-row ${s.wifi && s.wifiNetwork === n.name ? 'on' : ''}" data-net="${escapeHtml(n.name)}">
            <span class="net-ico">${icons(n.lock ? 'lock' : 'wifi')}</span>
            <span class="nm">${escapeHtml(n.name)}${n.known ? '<small>Conocida</small>' : ''}</span>
            ${s.wifi && s.wifiNetwork === n.name ? `<span class="check">${icons('check')}</span>` : `<span class="net-sig">${icons('wifi')}</span>`}
          </button>`).join('')}
      </div>
      <p class="hint">Haz clic en una red para conectarte.</p>`;
  }

  if (sec === 'personalizacion') {
    const p = state.prefs;
    return `
      <h3>Personalización</h3>
      <p class="sub">Haz que LiquidOS se sienta tuyo. Los cambios se guardan en este navegador.</p>

      <h3 class="sub-title">Color de acento</h3>
      <div class="swatches">
        ${ACCENTS.map((a) => `
          <button class="swatch ${p.accent === a.color ? 'on' : ''}" data-accent="${a.color}" title="${a.name}" aria-label="${a.name}" style="--c:${a.color}"><span></span></button>`).join('')}
      </div>

      <h3 class="sub-title">Fondo de pantalla</h3>
      <div class="wall-grid">
        ${WALLS.map((w) => `
          <button class="wall-thumb ${p.wall === w.id ? 'on' : ''}" data-wall="${w.id}" title="${w.name}" data-wall-preview="${w.id}">
            <span></span><small>${w.name}</small>
          </button>`).join('')}
      </div>

      <h3 class="sub-title">Dock</h3>
      <div class="row">
        <div><b>Posición</b><small>Abajo, izquierda o derecha</small></div>
        <div class="seg2">
          <button data-dockpos="bottom" class="${p.dockPos === 'bottom' ? 'on' : ''}">Abajo</button>
          <button data-dockpos="left" class="${p.dockPos === 'left' ? 'on' : ''}">Izquierda</button>
          <button data-dockpos="right" class="${p.dockPos === 'right' ? 'on' : ''}">Derecha</button>
        </div>
      </div>
      <div class="range-row">
        <label>Tamaño de los iconos del escritorio <output>${p.deskSize} px</output></label>
        <input type="range" min="36" max="72" value="${p.deskSize}" data-range="deskSize" aria-label="Iconos del escritorio">
      </div>

      <h3 class="sub-title">Ventanas</h3>
      <div class="row">
        <div><b>Botones de ventana</b><small>A la izquierda, como macOS, o a la derecha</small></div>
        <div class="seg2">
          <button data-buttons="left" class="${p.buttons === 'left' ? 'on' : ''}">Izquierda</button>
          <button data-buttons="right" class="${p.buttons === 'right' ? 'on' : ''}">Derecha</button>
        </div>
      </div>
      <div class="range-row">
        <label>Radio de las esquinas <output>${p.radius} px</output></label>
        <input type="range" min="0" max="24" value="${p.radius}" data-range="radius" aria-label="Radio de las esquinas">
      </div>

      <h3 class="sub-title">Efectos</h3>
      <div class="row">
        <div><b>Transparencia</b><small>Desenfoque del Dock, los menús y las ventanas</small></div>
        <button class="switch ${p.blur ? 'on' : ''}" data-sys="blur" aria-label="Transparencia"></button>
      </div>

      <div class="mail-actions">
        <button class="btn" data-reset-look="1">Restablecer apariencia</button>
      </div>
      <p class="hint">Consejo: también puedes cambiar el acento desde la terminal con <b>accent verde</b>.</p>`;
  }

  if (sec === 'dock') {
    return `
      <h3>Escritorio y Dock</h3>
      <p class="sub">Ajusta el tamaño del Dock y su comportamiento.</p>
      <div class="row">
        <div><b>Ocultar el Dock automáticamente</b><small>Aparece al acercar el cursor al borde inferior</small></div>
        <button class="switch ${s.dockAuto ? 'on' : ''}" data-sys="dockAuto" aria-label="Dock automático"></button>
      </div>
      <div class="row">
        <div><b>Magnificación</b><small>Amplía los iconos al pasar el cursor</small></div>
        <button class="switch ${state.mag ? 'on' : ''}" data-sys="mag" aria-label="Magnificación"></button>
      </div>
      <div class="row">
        <div><b>Animaciones</b><small>Transiciones de ventanas y Dock</small></div>
        <button class="switch ${state.anim ? 'on' : ''}" data-sys="anim" aria-label="Animaciones"></button>
      </div>
      <div class="range-row">
        <label>Tamaño de los iconos <output>${s.dockSize} px</output></label>
        <input type="range" min="36" max="72" value="${s.dockSize}" data-range="dockSize" aria-label="Tamaño del Dock">
      </div>
      <p class="hint">Con el Dock oculto, mueve el cursor al borde inferior para mostrarlo.</p>`;
  }

  if (sec === 'sonido') {
    return `
      <h3>Sonido</h3>
      <p class="sub">Volumen de salida y efectos del sistema.</p>
      <div class="range-row">
        <label>Volumen <output>${s.mute ? 0 : s.volume} %</output></label>
        <input type="range" min="0" max="100" value="${s.mute ? 0 : s.volume}" data-range="volume" aria-label="Volumen">
      </div>
      <div class="row">
        <div><b>Silencio</b><small>Desactiva todo el audio de la demo</small></div>
        <button class="switch ${s.mute ? 'on' : ''}" data-sys="mute" aria-label="Silencio"></button>
      </div>
      <div class="row">
        <div><b>Sonidos del sistema</b><small>Efectos al probar el audio</small></div>
        <button class="switch ${s.snd ? 'on' : ''}" data-sys="snd" aria-label="Sonidos del sistema"></button>
      </div>
      <h3 class="sub-title">Salida</h3>
      <div class="device-list">
        ${OUTPUT_DEVICES.map((d) => `
          <button class="device-btn ${s.output === d ? 'on' : ''}" data-device="${escapeHtml(d)}">
            ${icons('volume')}<span>${escapeHtml(d)}</span>
            ${s.output === d ? `<span class="check">${icons('check')}</span>` : ''}
          </button>`).join('')}
      </div>
      <div class="mail-actions">
        <button class="btn" data-test-sound="1">${icons('volume')} Probar sonido</button>
      </div>`;
  }

  if (sec === 'pantalla') {
    return `
      <h3>Pantalla</h3>
      <p class="sub">Brillo, resolución y luz nocturna.</p>
      <div class="range-row">
        <label>Brillo <output>${s.brightness} %</output></label>
        <input type="range" min="30" max="100" value="${s.brightness}" data-range="brightness" aria-label="Brillo">
      </div>
      <div class="row">
        <div><b>Luz nocturna</b><small>Reduce la luz azul por la noche</small></div>
        <button class="switch ${s.night ? 'on' : ''}" data-sys="night" aria-label="Luz nocturna"></button>
      </div>
      <h3 class="sub-title">Resolución</h3>
      <div class="device-list">
        ${RESOLUTIONS.map((r) => `
          <button class="device-btn ${s.resolution === r ? 'on' : ''}" data-resolution="${r}">
            ${icons('desktop')}<span>${r}</span>
            ${s.resolution === r ? `<span class="check">${icons('check')}</span>` : ''}
          </button>`).join('')}
      </div>`;
  }

  if (sec === 'acerca') {
    return `
      <h3>Acerca de LiquidOS</h3>
      <p class="sub">Información de esta compilación.</p>
      <div class="about-inline">
        <svg class="mark" viewBox="0 0 100 120"><path d="M50 4c14 22 34 44 34 66a34 34 0 1 1-68 0C16 48 36 26 50 4z" fill="#5aa9ff"/></svg>
        <h2>LiquidOS</h2>
        <div class="ver">Versión 1.0 “Torrente” · edición de desarrollo</div>
        <dl>
          <dt>Base</dt><dd>Debian 12 (bookworm)</dd>
          <dt>Escritorio</dt><dd>GNOME 43 · LiquidShell</dd>
          <dt>Kernel</dt><dd>6.1 amd64</dd>
          <dt>Licencia</dt><dd>GPL / MIT</dd>
        </dl>
      </div>
      <div class="mail-actions">
        <button class="btn primary" data-open-about="1">Abrir ventana</button>
        <button class="btn" data-copy-info="1">Copiar información</button>
        <button class="btn" data-shortcuts="1">Atajos</button>
      </div>`;
  }

  return `
    <h3>Apariencia</h3>
    <p class="sub">Elige cómo se ve LiquidOS en este equipo.</p>
    <div class="row">
      <div><b>Tema</b><small>Claro u oscuro para todo el sistema</small></div>
      <div class="seg2">
        <button data-theme="light" class="${state.theme === 'light' ? 'on' : ''}">Claro</button>
        <button data-theme="dark" class="${state.theme === 'dark' ? 'on' : ''}">Oscuro</button>
      </div>
    </div>
    <div class="row">
      <div><b>Modo oscuro automático</b><small>Según la hora del día</small></div>
      <button class="switch ${s.autoDark ? 'on' : ''}" data-sys="autoDark" aria-label="Modo automático"></button>
    </div>
    <div class="row">
      <div><b>Animaciones</b><small>Transiciones y movimiento del sistema</small></div>
      <button class="switch ${state.anim ? 'on' : ''}" data-sys="anim" aria-label="Animaciones"></button>
    </div>
    <div class="row">
      <div><b>Sonidos del sistema</b><small>Efectos de interfaz</small></div>
      <button class="switch ${s.snd ? 'on' : ''}" data-sys="snd" aria-label="Sonidos"></button>
    </div>
    <div class="row">
      <div><b>Botones de ventana</b><small>cerrar · minimizar · maximizar</small></div>
      <span class="traffic-demo">
        <span class="dot close"></span><span class="dot min"></span><span class="dot max"></span>
      </span>
    </div>
    <p class="hint">Los botones se muestran a la izquierda, como en macOS.</p>`;
}

function wireSettings(win) {
  const body = win.querySelector('.win-body');
  const s = state.system;

  $$('[data-section]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      state.views.ajustes.section = btn.dataset.section;
      rerenderWindow('ajustes');
    });
  });

  $$('[data-theme]', body).forEach((btn) => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });

  $$('[data-sys]', body).forEach((sw) => {
    sw.addEventListener('click', () => toggleSystem(sw.dataset.sys));
  });

  $$('[data-range]', body).forEach((range) => {
    paintRange(range);
    range.addEventListener('input', () => {
      const key = range.dataset.range;
      const val = Number(range.value);
      if (key === 'volume') {
        s.volume = val;
        s.mute = val === 0;
      }
      if (key === 'brightness') {
        s.brightness = val;
        applyBrightness();
      }
      if (key === 'dockSize') {
        s.dockSize = val;
        applyDockSize();
        savePrefs();
      }
      if (key === 'deskSize') {
        state.prefs.deskSize = val;
        applyPrefs();
        savePrefs();
      }
      if (key === 'radius') {
        state.prefs.radius = val;
        applyPrefs();
        savePrefs();
      }
      paintRange(range);
      const out = range.closest('.range-row')?.querySelector('output');
      if (out) out.textContent = key === 'dockSize' || key === 'deskSize' || key === 'radius' ? `${val} px` : `${val} %`;
      syncControlCenter();
    });
  });

  $$('[data-net]', body).forEach((btn) => {
    btn.addEventListener('click', () => connectNetwork(btn.dataset.net));
  });

  $$('[data-device]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      s.output = btn.dataset.device;
      rerenderWindow('ajustes');
      toast(`Salida de audio: ${s.output}`);
    });
  });

  $$('[data-resolution]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      s.resolution = btn.dataset.resolution;
      rerenderWindow('ajustes');
      toast(`Resolución: ${s.resolution} (simulada)`);
    });
  });

  $$('[data-open-about]', body).forEach((btn) => {
    btn.addEventListener('click', () => openAbout());
  });

  const copy = $('[data-copy-info]', body);
  if (copy) {
    copy.addEventListener('click', async () => {
      const info = 'LiquidOS 1.0 «Torrente» · Debian 12 · GNOME 43 · kernel 6.1 amd64';
      try {
        await navigator.clipboard.writeText(info);
        toast('Información copiada al portapapeles');
      } catch {
        toast('El navegador bloqueó el portapapeles');
      }
    });
  }

  const shortcuts = $('[data-shortcuts]', body);
  if (shortcuts) shortcuts.addEventListener('click', () => openShortcuts());

  const test = $('[data-test-sound]', body);
  if (test) test.addEventListener('click', () => beep(660));

  $$('[data-accent]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      const acc = ACCENTS.find((a) => a.color === btn.dataset.accent);
      setPref('accent', btn.dataset.accent, `Color de acento: ${acc ? acc.name : 'personalizado'}`);
      beep(620);
    });
  });

  $$('[data-wall]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      const wall = WALLS.find((w) => w.id === btn.dataset.wall);
      setPref('wall', btn.dataset.wall, `Fondo: ${wall ? wall.name : btn.dataset.wall}`);
    });
  });

  $$('[data-dockpos]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      const names = { bottom: 'abajo', left: 'a la izquierda', right: 'a la derecha' };
      setPref('dockPos', btn.dataset.dockpos, `Dock ${names[btn.dataset.dockpos]}`);
    });
  });

  $$('[data-buttons]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      setPref('buttons', btn.dataset.buttons, btn.dataset.buttons === 'left' ? 'Botones a la izquierda' : 'Botones a la derecha');
    });
  });

  const reset = $('[data-reset-look]', body);
  if (reset) reset.addEventListener('click', () => resetPrefs());
}

/* ------------------------ Estado del sistema ------------------------ */

function applyDockSize() {
  const size = state.system.dockSize;
  document.documentElement.style.setProperty('--dock-size', `${size}px`);
  document.documentElement.style.setProperty('--dock-h', `${size + 16}px`);
}

function applyBrightness() {
  const opacity = Math.max(0, (100 - state.system.brightness) / 100) * 0.6;
  dimLayer.style.opacity = opacity.toFixed(3);
}

function applySystemClasses() {
  const s = state.system;
  document.body.classList.toggle('dock-auto', s.dockAuto);
  document.body.classList.toggle('night', s.night);
  document.body.classList.toggle('no-menubar', state.menubarHidden);
  applyDockSize();
  applyBrightness();
}

function syncControlCenter() {
  const cc = $('#controlCenter');
  if (!cc) return;
  const s = state.system;

  const tile = (key, on, text) => {
    const btn = cc.querySelector(`[data-toggle="${key}"]`);
    if (!btn) return;
    btn.dataset.on = String(on);
    const small = btn.querySelector('small');
    if (small) small.textContent = text;
  };

  tile('wifi', s.wifi, s.wifi ? s.wifiNetwork : 'Desactivado');
  tile('bt', s.bt, s.bt ? 'Conectado' : 'Apagado');
  tile('dnd', s.dnd, s.dnd ? 'Activado' : 'Desactivado');

  const label = $('#appearanceLabel');
  if (label) label.textContent = state.theme === 'dark' ? 'Oscuro' : 'Claro';

  const bright = $('#brightness');
  if (bright) { bright.value = s.brightness; paintRange(bright); }
  const vol = $('#volume');
  if (vol) { vol.value = s.mute ? 0 : s.volume; paintRange(vol); }

  const wifiBtn = $('#wifiBtn');
  if (wifiBtn) {
    wifiBtn.classList.toggle('off', !s.wifi);
    wifiBtn.title = s.wifi ? `Wi-Fi: ${s.wifiNetwork}` : 'Wi-Fi desactivado';
  }
}

function syncSettingsIfOpen() {
  if (state.open.has('ajustes')) rerenderWindow('ajustes');
}

function toggleSystem(key) {
  const s = state.system;
  switch (key) {
    case 'wifi':
      s.wifi = !s.wifi;
      toast(`Wi-Fi ${s.wifi ? 'activado' : 'desactivado'}`);
      break;
    case 'bt':
      s.bt = !s.bt;
      toast(`Bluetooth ${s.bt ? 'activado' : 'desactivado'}`);
      break;
    case 'dnd':
      s.dnd = !s.dnd;
      toast(`No molestar ${s.dnd ? 'activado' : 'desactivado'}`);
      break;
    case 'snd':
      s.snd = !s.snd;
      toast(`Sonidos del sistema ${s.snd ? 'activados' : 'desactivados'}`);
      break;
    case 'autoDark':
      s.autoDark = !s.autoDark;
      if (s.autoDark) {
        const h = new Date().getHours();
        setTheme(h >= 19 || h < 7 ? 'dark' : 'light');
        toast('Apariencia automática activada');
      } else {
        toast('Apariencia automática desactivada');
      }
      break;
    case 'dockAuto':
      s.dockAuto = !s.dockAuto;
      toast(s.dockAuto ? 'El Dock se ocultará solo' : 'Dock siempre visible');
      break;
    case 'mute':
      s.mute = !s.mute;
      if (s.mute) {
        s.prevVolume = s.volume || 45;
        s.volume = 0;
      } else {
        s.volume = s.prevVolume || 45;
      }
      toast(s.mute ? 'Silencio activado' : 'Sonido activado');
      break;
    case 'night':
      s.night = !s.night;
      toast(`Luz nocturna ${s.night ? 'activada' : 'desactivada'}`);
      break;
    case 'lowPower':
      s.lowPower = !s.lowPower;
      if (s.lowPower) s.brightness = Math.min(s.brightness, 60);
      toast(`Bajo consumo ${s.lowPower ? 'activado' : 'desactivado'}`);
      break;
    case 'blur':
      state.prefs.blur = !state.prefs.blur;
      applyPrefs();
      savePrefs();
      toast(`Transparencia ${state.prefs.blur ? 'activada' : 'desactivada'}`);
      break;
    case 'mag':
      state.mag = !state.mag;
      if (!state.mag) resetMagnify();
      toast(`Magnificación ${state.mag ? 'activada' : 'desactivada'}`);
      break;
    case 'anim':
      setAnim(!state.anim);
      toast(`Animaciones ${state.anim ? 'activadas' : 'desactivadas'}`);
      break;
  }

  applySystemClasses();
  syncControlCenter();
  syncSettingsIfOpen();
  refreshFlyout();
}

function connectNetwork(name) {
  const s = state.system;
  if (!NETWORKS.some((n) => n.name === name)) return;
  s.wifi = true;
  s.wifiNetwork = name;
  applySystemClasses();
  syncControlCenter();
  refreshFlyout();
  if (state.open.has('ajustes')) rerenderWindow('ajustes');
  toast(`Conectado a ${name}`);
}

/* ---------------------- Ventanas auxiliares ---------------------- */

AUX_TITLES.acerca = 'Acerca de LiquidOS';
AUX_TITLES.ayuda = 'Atajos de teclado';
AUX_TITLES.manual = 'Manual de LiquidOS';

function openAux(id, title, html, w = 470, h = 540) {
  AUX_TITLES[id] = title;
  if (state.open.has(id)) {
    const entry = state.open.get(id);
    if (entry.min) restoreWin(id);
    else focusWin(id);
    return;
  }

  const win = document.createElement('section');
  win.className = 'window aux';
  win.dataset.app = id;
  win.style.width = Math.min(w, window.innerWidth - 40) + 'px';
  win.style.height = Math.min(h, window.innerHeight - 120) + 'px';
  win.style.left = 'calc(50% - ' + Math.min(w, window.innerWidth - 40) / 2 + 'px)';
  win.style.top = '10vh';
  win.innerHTML = `
    <header class="window-head">
      <div class="traffic">
        <button class="dot close" title="Cerrar" aria-label="Cerrar"></button>
        <button class="dot min" title="Minimizar" aria-label="Minimizar"></button>
        <button class="dot max" title="Maximizar" aria-label="Maximizar"></button>
      </div>
      <div class="win-title">${title}</div>
      <div></div>
    </header>
    <div class="win-body">${html}</div>`;

  windowsLayer.appendChild(win);
  state.open.set(id, { el: win, min: false, rect: null });
  focusWin(id);
  wireWindowChrome(win, id);
  wireWindow(id, win);
  return win;
}

function viewAbout() {
  return `
  <div class="about">
    <svg class="mark" viewBox="0 0 100 120"><path d="M50 4c14 22 34 44 34 66a34 34 0 1 1-68 0C16 48 36 26 50 4z" fill="#5aa9ff"/></svg>
    <h2>LiquidOS</h2>
    <div class="ver">Versión 1.0 “Torrente” · edición de desarrollo</div>
    <dl>
      <dt>Base</dt><dd>Debian 12 (bookworm)</dd>
      <dt>Escritorio</dt><dd>GNOME 43 · LiquidShell</dd>
      <dt>Kernel</dt><dd>6.1 amd64</dd>
      <dt>Paquetes</dt><dd>~1 850</dd>
      <dt>Licencia</dt><dd>GPL / MIT</dd>
    </dl>
    <div class="mail-actions">
      <button class="btn primary" data-open-app="manual">Abrir manual</button>
      <button class="btn" data-shortcuts="1">Atajos</button>
      <button class="btn" data-copy-info="1">Copiar información</button>
    </div>
  </div>`;
}

const SHORTCUTS = [
  ['Ctrl + Espacio', 'Abrir o cerrar Spotlight'],
  ['↑ / ↓', 'Moverse por los resultados de Spotlight'],
  ['Enter', 'Abrir el resultado seleccionado'],
  ['Esc', 'Cerrar Spotlight, menús y paneles'],
  ['Ctrl + W', 'Cerrar la ventana activa'],
  ['Ctrl + M', 'Minimizar la ventana activa'],
  ['Doble clic en la barra', 'Maximizar o restaurar la ventana'],
  ['Arrastrar la barra', 'Mover la ventana'],
  ['Clic derecho en el escritorio', 'Menú contextual'],
  ['Clic en el reloj', 'Abrir el calendario'],
  ['Clic en el Wi-Fi', 'Ver las redes disponibles']
];

function viewShortcuts() {
  return `
  <div class="doc-view">
    <h2>Atajos de teclado</h2>
    <p class="lead">Todo lo que puedes hacer sin levantar las manos del teclado.</p>
    <ul class="shortcut-list">
      ${SHORTCUTS.map(([key, what]) => `<li><kbd>${key}</kbd><span>${what}</span></li>`).join('')}
    </ul>
    <div class="mail-actions">
      <button class="btn primary" data-open-app="manual">Abrir manual</button>
      <button class="btn" data-open-app="ajustes">Ajustes del sistema</button>
    </div>
  </div>`;
}

function viewManual() {
  return `
  <div class="doc-view">
    <h2>Manual de LiquidOS</h2>
    <p class="lead">Guía rápida de esta demostración interactiva.</p>

    <h3>El escritorio</h3>
    <p>La barra superior reúne el menú de LiquidOS, el nombre de la app activa, los indicadores del sistema y el reloj. El Dock muestra las aplicaciones: un punto indica que están abiertas y al hacer clic se abren o se restauran.</p>

    <h3>Ventanas</h3>
    <p>Arrastra la barra de título para mover una ventana, haz doble clic para maximizarla y usa los tres botones de la izquierda para cerrar, minimizar y maximizar. Minimizar reproduce el efecto genio hacia el Dock.</p>

    <h3>Spotlight</h3>
    <p>Pulsa <b>Ctrl + Espacio</b> (o el icono de la lupa) para buscar aplicaciones, secciones de Ajustes y archivos. Los resultados se abren con <b>Enter</b>.</p>

    <h3>Apariencia</h3>
    <p>El Centro de control cambia entre modo claro y oscuro, ajusta el brillo y el volumen y activa Wi-Fi, Bluetooth o No molestar. En <b>Ajustes → Escritorio y Dock</b> puedes cambiar el tamaño del Dock y ocultarlo automáticamente.</p>

    <h3>Uso diario</h3>
    <p><b>Firefox</b> y <b>Thunderbird</b> ya vienen instalados: no hay que descargar nada para navegar o leer el correo. En esta vista previa, Firefox <b>carga páginas reales</b>: escribe <b>example.com</b> o una búsqueda en la barra de direcciones. Funcionan las pestañas (+), la estrella de favoritos, el historial y atrás/adelante con URLs reales. En Thunderbird, el buscador filtra los mensajes al escribir.</p>

    <h3>Centro de software</h3>
    <p>Abre el <b>Centro de software</b> desde el Dock y busca en el catálogo real de <b>Flathub</b>. Si el equipo donde corre la demo tiene Flatpak, instalar, quitar y actualizar se ejecuta de verdad y verás la salida del comando. Si no lo tiene, la demo te da el comando exacto y el enlace a Flathub; en la ISO de LiquidOS Flatpak y Flathub vienen listos.</p>

    <h3>Terminal</h3>
    <p>La terminal funciona de verdad dentro de la demo: prueba <b>ls -la</b>, <b>cd Documentos</b>, <b>cat notas-reunion.md</b>, <b>echo hola &gt; saludo.txt</b>, <b>cat saludo.txt | grep hola</b>, <b>sudo apt install vlc</b> o <b>liquidos doctor</b>. Las flechas recorren el historial, <b>Tab</b> completa comandos y <b>Ctrl + L</b> limpia la pantalla.</p>

    <h3>Personalización</h3>
    <p><b>Ajustes → Personalización</b> reúne el color de acento, seis fondos, la posición del Dock, el tamaño de los iconos del escritorio, el lado de los botones de ventana, las esquinas y la transparencia. Los cambios se guardan en este navegador, así que siguen ahí al recargar.</p>

    <h3>Compilar la ISO</h3>
    <p>La imagen se construye con live-build sobre Debian 12. Ejecuta <b>make iso</b> en Linux o usa el flujo de GitHub Actions incluido en el repositorio. El resultado aparece en <b>dist/LiquidOS-1.0-amd64.iso</b>.</p>

    <div class="mail-actions">
      <button class="btn primary" data-open-app="archivos">Explorar archivos</button>
      <button class="btn" data-open-app="ajustes">Ajustes del sistema</button>
      <button class="btn" data-shortcuts="1">Ver atajos</button>
    </div>
  </div>`;
}

function openAbout() { return openAux('acerca', 'Acerca de LiquidOS', viewAbout(), 460, 600); }
function openShortcuts() { return openAux('ayuda', 'Atajos de teclado', viewShortcuts(), 520, 560); }
function openManual() { return openAux('manual', 'Manual de LiquidOS', viewManual(), 600, 600); }

function wireAux(win) {
  const body = win.querySelector('.win-body');
  $$('[data-open-app]', body).forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.openApp;
      if (target === 'manual') return openManual();
      if (target === 'ayuda') return openShortcuts();
      if (target === 'acerca') return openAbout();
      openApp(target);
    });
  });
  $$('[data-shortcuts]', body).forEach((btn) => {
    btn.addEventListener('click', () => openShortcuts());
  });
  $$('[data-copy-info]', body).forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('LiquidOS 1.0 «Torrente» · Debian 12 · GNOME 43 · kernel 6.1 amd64');
        toast('Información copiada al portapapeles');
      } catch {
        toast('El navegador bloqueó el portapapeles');
      }
    });
  });
}

/* ---------------------------- Spotlight ---------------------------- */

const spot = $('#spotlight');
const spotInput = $('#spotInput');
const spotResults = $('#spotResults');
let spotIndex = 0;
let spotList = [];

function searchTargets() {
  const apps = APPS.map((a) => ({
    id: a.id, name: a.name, glyph: a.glyph, c1: a.c1, c2: a.c2,
    hint: 'Aplicación', run: () => openApp(a.id)
  }));

  const secs = SETTINGS_SECTIONS.map((s) => ({
    id: `ajustes-${s.id}`, name: `Ajustes · ${s.label}`, glyph: s.glyph, c1: '#c9d1e0', c2: '#7d8798',
    hint: 'Ajustes', run: () => openApp('ajustes', { section: s.id })
  }));

  const extras = [
    { id: 'tema', name: 'Cambiar apariencia', glyph: 'moon', c1: '#9d8bff', c2: '#5b46c8', hint: 'Sistema', run: () => {
      setTheme(state.theme === 'dark' ? 'light' : 'dark');
      toast(`Apariencia ${state.theme === 'dark' ? 'oscura' : 'clara'}`);
    } },
    { id: 'tienda', name: 'Centro de software', glyph: 'store', c1: '#8fd4ff', c2: '#3b6fd8', hint: 'Aplicaciones', run: () => openApp('software') },
    { id: 'personalizar', name: 'Personalizar el escritorio', glyph: 'palette', c1: '#8fd4c8', c2: '#2b9080', hint: 'Ajustes', run: () => openApp('ajustes', { section: 'personalizacion' }) },
    { id: 'manual', name: 'Manual de LiquidOS', glyph: 'doc', c1: '#7cc3ff', c2: '#3b6fd8', hint: 'Ayuda', run: () => openManual() },
    { id: 'ayuda', name: 'Atajos de teclado', glyph: 'grid', c1: '#8fd4c8', c2: '#2b9080', hint: 'Ayuda', run: () => openShortcuts() },
    { id: 'acerca', name: 'Acerca de LiquidOS', glyph: 'doc', c1: '#9cc6ff', c2: '#3b6fd8', hint: 'Sistema', run: () => openAbout() },
    { id: 'capturas', name: 'Capturas', glyph: 'image', c1: '#ffd48f', c2: '#f09a3c', hint: 'Carpeta', run: () => openApp('archivos', { path: 'capturas' }) },
    { id: 'papelera', name: 'Papelera', glyph: 'trash', c1: '#b8c6db', c2: '#7d8ba1', hint: 'Sistema', run: () => toast('La papelera está vacía · 0 elementos') }
  ];

  CATALOG.filter((it) => !state.software.installed.includes(it.id)).forEach((it) => {
    extras.push({
      id: `install-${it.id}`,
      name: `Instalar ${it.name}`,
      glyph: it.glyph,
      c1: it.c1,
      c2: it.c2,
      hint: 'Centro de software',
      run: () => {
        openApp('software');
        softwareInstall(it.id);
      }
    });
  });

  const files = [];
  Object.entries(FS).forEach(([path, dir]) => {
    dir.items.forEach((it) => {
      if (it.type === 'folder') return;
      files.push({
        id: `file-${path}-${it.name}`,
        name: it.name,
        glyph: it.type === 'img' ? 'image' : it.type === 'aud' ? 'music' : 'doc',
        c1: '#c9d1e0', c2: '#7d8798',
        hint: dir.label,
        run: () => {
          openApp('archivos', { path });
          if (it.type === 'aud') openApp('musica');
          if (it.type === 'doc') openApp('notas');
          toast(`Abriendo «${it.name}»`);
        }
      });
    });
  });

  return [...apps, ...secs, ...extras, ...files];
}

function openSpotlight() {
  closeMenus();
  spot.hidden = false;
  spotInput.value = '';
  renderSpotResults('');
  setTimeout(() => spotInput.focus(), 30);
}

function closeSpotlight() { spot.hidden = true; }

function renderSpotResults(q) {
  const query = q.trim().toLowerCase();
  spotList = searchTargets().filter((t) => !query || t.name.toLowerCase().includes(query) || (t.hint || '').toLowerCase().includes(query));
  spotIndex = 0;

  if (!spotList.length) {
    spotResults.innerHTML = `<li class="spot-empty">Sin resultados para «${escapeHtml(q)}»</li>`;
    return;
  }

  spotResults.innerHTML = spotList.map((t, i) => `
    <li data-i="${i}" class="${i === 0 ? 'sel' : ''}">
      <span class="mini app-icon" style="--c1:${t.c1};--c2:${t.c2}">${svg(t.glyph)}</span>
      <span>${escapeHtml(t.name)}</span>
      <small>${escapeHtml(t.hint || 'Aplicación')}</small>
    </li>`).join('');

  $$('li[data-i]', spotResults).forEach((li) => {
    li.addEventListener('click', () => launchSpot(Number(li.dataset.i)));
  });
}

function launchSpot(i) {
  const t = spotList[i];
  if (!t) return;
  closeSpotlight();
  spotInput.blur();
  if (typeof t.run === 'function') t.run();
  else openApp(t.id);
}

function moveSpot(dir) {
  if (!spotList.length) return;
  spotIndex = (spotIndex + dir + spotList.length) % spotList.length;
  [...spotResults.children].forEach((li, i) => li.classList.toggle('sel', i === spotIndex));
  const active = spotResults.children[spotIndex];
  if (active) active.scrollIntoView({ block: 'nearest' });
}

/* ------------------------ Cableado de ventanas ------------------------ */

function wireWindow(id, win) {
  switch (id) {
    case 'archivos': wireFinder(win); break;
    case 'navegador': wireBrowser(win); break;
    case 'correo': wireMail(win); break;
    case 'software': wireSoftware(win); break;
    case 'notas': wireNotes(win); break;
    case 'musica': wireMusic(win); break;
    case 'terminal': wireTerminal(win); break;
    case 'ajustes': wireSettings(win); break;
    case 'acerca':
    case 'ayuda':
    case 'manual': wireAux(win); break;
    default: break;
  }
}

/* ------------------------ Iconos del escritorio ------------------------ */

const DESKTOP_ICONS = [
  { key: 'equipo', label: 'LiquidOS', glyph: 'desktop', c1: '#9cc6ff', c2: '#3b6fd8', run: () => openApp('archivos', { path: 'inicio' }) },
  { key: 'documentos', label: 'Documentos', glyph: 'folder', c1: '#6fc0ff', c2: '#1a6fe0', run: () => openApp('archivos', { path: 'documentos' }) },
  { key: 'capturas', label: 'Capturas', glyph: 'image', c1: '#ffd48f', c2: '#f09a3c', run: () => openApp('archivos', { path: 'capturas' }) },
  { key: 'leeme', label: 'Léeme.txt', glyph: 'doc', c1: '#dfe6f2', c2: '#98a4b8', run: () => openApp('notas') },
  { key: 'iso', label: 'LiquidOS.iso', glyph: 'download', c1: '#b8c6db', c2: '#7d8ba1', run: () => openApp('archivos', { path: 'descargas' }) }
];

function buildDesktopIcons() {
  if (!desktopIconsEl) return;
  desktopIconsEl.innerHTML = DESKTOP_ICONS.map((ic) => `
    <button class="desk-icon" data-desk="${ic.key}" title="${ic.label}">
      <span class="desk-glyph" style="--c1:${ic.c1};--c2:${ic.c2}">${svg(ic.glyph)}</span>
      <span class="desk-label">${ic.label}</span>
    </button>`).join('');

  $$('.desk-icon', desktopIconsEl).forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.desk-icon', desktopIconsEl).forEach((b) => b.classList.toggle('on', b === btn));
    });
    btn.addEventListener('dblclick', () => {
      const ic = DESKTOP_ICONS.find((x) => x.key === btn.dataset.desk);
      if (ic) ic.run();
    });
  });
}

/* ---------------------------- Menús ---------------------------- */

let folderN = 1;

function createDesktopFolder() {
  const name = `Carpeta ${folderN++}`;
  FS.escritorio.items.push({ name, type: 'folder', to: 'escritorio' });
  DESKTOP_ICONS.push({
    key: `carpeta-${Date.now()}`,
    label: name,
    glyph: 'folder',
    c1: '#6fc0ff',
    c2: '#1a6fe0',
    run: () => openApp('archivos', { path: 'escritorio' })
  });
  buildDesktopIcons();
  toast(`«${name}» creada en el escritorio`);
}

function focusedId() {
  const list = [...state.open.entries()]
    .sort((a, b) => Number(b[1].el.style.zIndex || 0) - Number(a[1].el.style.zIndex || 0));
  const found = list.find(([, v]) => v.el.classList.contains('focused'));
  return found ? found[0] : null;
}

function closeFocused(minimize = false) {
  const id = focusedId();
  if (!id) { toast('No hay ninguna ventana activa'); return; }
  if (minimize) animateMinimize(id);
  else closeWin(id);
}

function toggleFocusedMax() {
  const id = focusedId();
  if (!id) { toast('No hay ninguna ventana activa'); return; }
  focusWin(id);
  toggleMax(id);
}

function minimizeAll() {
  if (!state.open.size) { toast('No hay ventanas abiertas'); return; }
  [...state.open.keys()].forEach((id) => animateMinimize(id));
  toast('Ventanas minimizadas');
}

function closeAll() {
  if (!state.open.size) { toast('No hay ventanas abiertas'); return; }
  [...state.open.keys()].forEach((id) => closeWin(id));
}

function toggleMenubar() {
  state.menubarHidden = !state.menubarHidden;
  applySystemClasses();
  toast(state.menubarHidden ? 'Barra de menús oculta · acércate al borde superior' : 'Barra de menús visible');
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    toast('El navegador bloqueó la pantalla completa');
  }
}

function editAction(cmd) {
  const el = document.activeElement;
  const editable = el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
  if (!editable) { toast('Primero enfoca un campo de texto'); return; }
  if (cmd === 'paste') { toast('Usa Ctrl + V para pegar'); return; }
  let ok = false;
  try { ok = document.execCommand(cmd); } catch { ok = false; }
  if (ok && cmd === 'copy') toast('Copiado al portapapeles');
  else if (ok && cmd === 'cut') toast('Cortado al portapapeles');
  else if (!ok && cmd !== 'selectAll') toast('Esta acción no está disponible en el navegador');
}

function lockScreen() {
  if ($('.lock-screen')) return;
  const ov = document.createElement('div');
  ov.className = 'lock-screen';
  const now = new Date();
  const time = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const date = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  ov.innerHTML = `
    <div class="lock-inner">
      <div class="lock-time">${time}</div>
      <div class="lock-date">${date}</div>
      <div class="lock-user">
        <span class="lock-avatar">S</span>
        <b>Sebastián</b>
        <small>LiquidOS · sesión local</small>
      </div>
      <button class="btn primary" data-unlock>Desbloquear</button>
      <small class="lock-hint">Pulsa Enter o haz clic para volver</small>
    </div>`;
  desktop.appendChild(ov);

  const unlock = () => {
    ov.classList.add('out');
    setTimeout(() => ov.remove(), 260);
    window.removeEventListener('keydown', onKey);
    toast('Sesión desbloqueada');
  };
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { e.preventDefault(); unlock(); }
  };
  ov.querySelector('[data-unlock]').addEventListener('click', unlock);
  ov.addEventListener('click', (e) => { if (e.target === ov) unlock(); });
  window.addEventListener('keydown', onKey);
}

function shutdownDemo(mode) {
  if ($('.shutdown-screen')) return;
  const restart = mode === 'restart';
  const ov = document.createElement('div');
  ov.className = 'shutdown-screen';
  ov.innerHTML = `
    <div class="shutdown-inner">
      <svg class="mark" viewBox="0 0 100 120"><path d="M50 4c14 22 34 44 34 66a34 34 0 1 1-68 0C16 48 36 26 50 4z" fill="#5aa9ff"/></svg>
      <h2>${restart ? 'Reiniciando…' : 'Apagando…'}</h2>
      <p>${restart ? 'Volviendo a iniciar LiquidOS.' : 'Puedes encender el equipo de nuevo cuando quieras.'}</p>
      <div class="spinner" aria-hidden="true"></div>
      ${restart ? '' : '<button class="btn primary" data-power-on>Encender</button>'}
    </div>`;
  desktop.appendChild(ov);

  if (restart) {
    setTimeout(() => location.reload(), 2000);
  } else {
    ov.querySelector('[data-power-on]').addEventListener('click', () => location.reload());
  }
}

function createNote() {
  const v = state.views.notas;
  v.notes.push({
    title: 'Nueva nota',
    preview: 'Empieza a escribir…',
    html: `<h2>Nueva nota</h2><div class="date">${todayLabel()}</div><p>Empieza a escribir…</p>`
  });
  v.index = v.notes.length - 1;
  if (state.open.has('notas')) rerenderWindow('notas');
  else openApp('notas');
  const ed = $('#windows .window[data-app="notas"] [data-note-body]');
  if (ed) ed.focus();
  toast('Nota creada');
}

const APPLE_MENU = [
  ['Acerca de LiquidOS', () => openAbout(), ''],
  ['Manual de LiquidOS', () => openManual(), ''],
  ['Ajustes del Sistema…', () => openApp('ajustes'), '⌘,'],
  ['—', null, ''],
  ['Bloquear pantalla', () => lockScreen(), '⌃⌘Q'],
  ['Reiniciar…', () => shutdownDemo('restart'), ''],
  ['Apagar…', () => shutdownDemo('power'), '']
];

const GENERIC_MENU = {
  Archivo: [
    ['Nueva ventana', () => openApp('archivos'), '⌘N'],
    ['Nueva nota', () => createNote(), ''],
    ['Cerrar ventana', () => closeFocused(), '⌘W'],
    ['—', null, ''],
    ['Imprimir…', () => window.print(), '⌘P']
  ],
  Editar: [
    ['Deshacer', () => editAction('undo'), '⌘Z'],
    ['Rehacer', () => editAction('redo'), '⇧⌘Z'],
    ['—', null, ''],
    ['Cortar', () => editAction('cut'), '⌘X'],
    ['Copiar', () => editAction('copy'), '⌘C'],
    ['Pegar', () => editAction('paste'), '⌘V'],
    ['Seleccionar todo', () => editAction('selectAll'), '⌘A']
  ],
  Ver: [
    ['Modo claro / oscuro', () => {
      setTheme(state.theme === 'dark' ? 'light' : 'dark');
      toast(`Apariencia ${state.theme === 'dark' ? 'oscura' : 'clara'}`);
    }, ''],
    ['Mostrar u ocultar la barra de menús', () => toggleMenubar(), ''],
    ['Pantalla completa', () => toggleFullscreen(), '⌃⌘F'],
    ['—', null, ''],
    ['Minimizar todas las ventanas', () => minimizeAll(), '']
  ],
  Ventana: [
    ['Minimizar', () => closeFocused(true), '⌘M'],
    ['Zoom', () => toggleFocusedMax(), '⌃⌘Z'],
    ['—', null, ''],
    ['Cerrar todas las ventanas', () => closeAll(), '']
  ],
  Ayuda: [
    ['Manual de LiquidOS', () => openManual(), ''],
    ['Atajos de teclado', () => openShortcuts(), ''],
    ['—', null, ''],
    ['Acerca de LiquidOS', () => openAbout(), '']
  ]
};

function showMenu(x, y, items, owner = '') {
  const pop = $('#menuPop');
  if (!pop.hidden && pop.dataset.owner === owner) { pop.hidden = true; return; }
  pop.dataset.owner = owner;

  pop.innerHTML = items.map(([label, fn, hint]) => {
    if (label === '—') return '<hr>';
    return `<button data-item ${fn ? '' : 'disabled'}>${label}<span>${hint || ''}</span></button>`;
  }).join('');

  pop.hidden = false;
  pop.style.left = '0px';
  pop.style.top = '0px';
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;
  pop.style.left = Math.max(8, Math.min(x, window.innerWidth - w - 8)) + 'px';
  pop.style.top = Math.max(8, Math.min(y, window.innerHeight - h - 8)) + 'px';

  flyout.hidden = true;
  flyoutKind = null;
  $('#controlCenter').hidden = true;

  const buttons = $$('button[data-item]', pop);
  const real = items.filter((i) => i[0] !== '—');
  buttons.forEach((b, i) => {
    b.addEventListener('click', () => {
      pop.hidden = true;
      const fn = real[i] && real[i][1];
      if (fn) fn();
    });
  });
}

function closeMenus() {
  $('#menuPop').hidden = true;
  $('#controlCenter').hidden = true;
  flyout.hidden = true;
  flyoutKind = null;
  flyoutAnchor = null;
}

function setupMenus() {
  const apple = $('#appleBtn');
  if (apple) {
    apple.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = apple.getBoundingClientRect();
      showMenu(r.left, r.bottom + 6, APPLE_MENU, 'apple');
    });
  }

  $$('.menus button').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = b.getBoundingClientRect();
      showMenu(r.left, r.bottom + 4, GENERIC_MENU[b.dataset.menu] || [], b.dataset.menu);
    });
  });

  const search = $('#searchBtn');
  if (search) search.addEventListener('click', (e) => { e.stopPropagation(); openSpotlight(); });

  desktop.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.window, .menubar, .dock-wrap, .spotlight, .control-center, .menu-pop, .flyout, .lock-screen, .shutdown-screen, .desk-icon')) return;
    e.preventDefault();
    showMenu(e.clientX, e.clientY, [
      ['Nueva carpeta', () => createDesktopFolder(), '⇧⌘N'],
      ['Cambiar fondo de pantalla', () => {
        setTheme(state.theme === 'dark' ? 'light' : 'dark');
        toast('Fondo actualizado');
      }, ''],
      ['Ordenar iconos', () => { buildDesktopIcons(); toast('Iconos ordenados por nombre'); }, ''],
      ['—', null, ''],
      ['Ajustes del Sistema…', () => openApp('ajustes'), ''],
      ['Mostrar Spotlight', () => openSpotlight(), '⌃Space'],
      ['Manual de LiquidOS', () => openManual(), '']
    ], 'desktop');
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.menu-pop, .control-center, .flyout')) return;
    closeMenus();
  });

  window.addEventListener('resize', () => {
    if (!flyout.hidden && flyoutAnchor) flyoutPosition(flyoutAnchor);
  });

  window.addEventListener('keydown', (e) => {
    const spotOpen = !spot.hidden;

    if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
      e.preventDefault();
      if (spotOpen) closeSpotlight();
      else openSpotlight();
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
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      closeFocused(true);
      return;
    }
    if (e.key === 'Escape') {
      closeMenus();
      spot.hidden = true;
    }
  });

  spot.addEventListener('click', (e) => {
    if (e.target === spot) closeSpotlight();
  });
  spotInput.addEventListener('input', () => renderSpotResults(spotInput.value));
  spotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); launchSpot(spotIndex); }
  });
}

/* ---------------------------- Centro de control ---------------------------- */

function setupControlCenter() {
  const cc = $('#controlCenter');
  if (!cc) return;

  const controlBtn = $('#controlBtn');
  if (controlBtn) {
    controlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = cc.hidden;
      closeMenus();
      cc.hidden = !willOpen;
      if (willOpen) { syncControlCenter(); beep(540); }
    });
  }

  cc.addEventListener('click', (e) => e.stopPropagation());

  $$('[data-toggle]', cc).forEach((btn) => {
    btn.addEventListener('click', () => toggleSystem(btn.dataset.toggle));
  });

  $$('[data-theme]', cc).forEach((btn) => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.theme);
      toast(`Apariencia ${btn.dataset.theme === 'dark' ? 'oscura' : 'clara'}`);
    });
  });

  const themeTile = $('#ccThemeTile');
  if (themeTile) {
    themeTile.addEventListener('click', () => {
      setTheme(state.theme === 'dark' ? 'light' : 'dark');
      toast(`Apariencia ${state.theme === 'dark' ? 'oscura' : 'clara'}`);
    });
  }

  const bright = $('#brightness');
  if (bright) {
    paintRange(bright);
    bright.addEventListener('input', () => {
      state.system.brightness = Number(bright.value);
      applyBrightness();
      paintRange(bright);
      syncSettingsIfOpen();
    });
  }

  const vol = $('#volume');
  if (vol) {
    paintRange(vol);
    vol.addEventListener('input', () => {
      state.system.volume = Number(vol.value);
      state.system.mute = state.system.volume === 0;
      paintRange(vol);
      syncSettingsIfOpen();
    });
    vol.addEventListener('change', () => beep(760));
  }

  const wifiBtn = $('#wifiBtn');
  if (wifiBtn) wifiBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFlyout('wifi', wifiBtn); });

  const batteryBtn = $('#batteryBtn');
  if (batteryBtn) batteryBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFlyout('battery', batteryBtn); });

  const clockBtn = $('#clock');
  if (clockBtn) clockBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFlyout('calendar', clockBtn); });

  flyout.addEventListener('click', (e) => e.stopPropagation());
}

/* ---------------------------- Paneles emergentes ---------------------------- */

let flyoutKind = null;
let flyoutAnchor = null;

function flyoutPosition(anchor) {
  const r = anchor.getBoundingClientRect();
  const width = 312;
  flyout.style.left = Math.max(12, Math.min(r.right - width, window.innerWidth - width - 12)) + 'px';
  flyout.style.top = (r.bottom + 8) + 'px';
}

function toggleFlyout(kind, anchor) {
  if (!flyout.hidden && flyoutKind === kind) { closeFlyout(); return; }
  closeMenus();
  flyoutKind = kind;
  flyoutAnchor = anchor;
  flyout.hidden = false;
  flyoutPosition(anchor);
  renderFlyout();
}

function closeFlyout() {
  flyout.hidden = true;
  flyoutKind = null;
  flyoutAnchor = null;
}

function refreshFlyout() {
  if (flyout.hidden || !flyoutKind) return;
  renderFlyout();
}

function netRows() {
  const s = state.system;
  return NETWORKS.map((n) => `
    <button class="net-row ${s.wifi && s.wifiNetwork === n.name ? 'on' : ''}" data-net="${escapeHtml(n.name)}">
      <span class="net-ico">${icons(n.lock ? 'lock' : 'wifi')}</span>
      <span class="nm">${escapeHtml(n.name)}${n.known ? '<small>Conocida</small>' : ''}</span>
      ${s.wifi && s.wifiNetwork === n.name ? `<span class="check">${icons('check')}</span>` : `<span class="net-sig">${icons('wifi')}</span>`}
    </button>`).join('');
}

function calendarHtml() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now);
  const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const todayLabel = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);

  let cells = labels.map((l) => `<span class="cal-head">${l}</span>`).join('');
  for (let i = 0; i < offset; i++) cells += '<span class="cal-empty"></span>';
  for (let d = 1; d <= days; d++) {
    const label = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(year, month, d));
    cells += `<button class="cal-day ${d === today ? 'today' : ''}" data-cal-day="${escapeHtml(label)}">${d}</button>`;
  }

  return `
    <div class="fly-head"><b>${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}</b><span>Hoy</span></div>
    <div class="cal-grid">${cells}</div>
    <div class="cal-selected" data-cal-label>${todayLabel}</div>
    <div class="fly-foot"><span>Sin eventos para hoy</span><button class="btn" data-open-settings="pantalla">Ajustes</button></div>`;
}

function flyoutContent(kind) {
  const s = state.system;

  if (kind === 'wifi') {
    return `
      <div class="fly-head">
        <b>Wi-Fi</b>
        <button class="switch ${s.wifi ? 'on' : ''}" data-fly-sys="wifi" aria-label="Wi-Fi"></button>
      </div>
      <div class="net-list ${s.wifi ? '' : 'off'}">${netRows()}</div>
      <div class="fly-foot">
        <span>${s.wifi ? `Conectado a ${escapeHtml(s.wifiNetwork)}` : 'Wi-Fi desactivado'}</span>
        <button class="btn" data-open-settings="wifi">Ajustes</button>
      </div>`;
  }

  if (kind === 'battery') {
    return `
      <div class="fly-head"><b>Batería</b><span>87 %</span></div>
      <div class="battery-visual"><span style="width:87%"></span></div>
      <p class="fly-note">Alimentación por batería · quedan 5 h 12 min</p>
      <div class="row">
        <div><b>Bajo consumo</b><small>Reduce el brillo y el rendimiento</small></div>
        <button class="switch ${s.lowPower ? 'on' : ''}" data-fly-sys="lowPower" aria-label="Bajo consumo"></button>
      </div>
      <div class="fly-foot">
        <span>Salud de la batería: 96 %</span>
        <button class="btn" data-open-settings="pantalla">Ajustes</button>
      </div>`;
  }

  return calendarHtml();
}

function renderFlyout() {
  if (!flyoutKind) return;
  flyout.dataset.kind = flyoutKind;
  flyout.innerHTML = flyoutContent(flyoutKind);
  wireFlyout();
}

function wireFlyout() {
  $$('[data-fly-sys]', flyout).forEach((sw) => {
    sw.addEventListener('click', () => toggleSystem(sw.dataset.flySys));
  });

  $$('[data-net]', flyout).forEach((btn) => {
    btn.addEventListener('click', () => connectNetwork(btn.dataset.net));
  });

  $$('[data-open-settings]', flyout).forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.openSettings;
      closeFlyout();
      openApp('ajustes', { section });
    });
  });

  $$('[data-cal-day]', flyout).forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('[data-cal-day]', flyout).forEach((x) => x.classList.toggle('on', x === btn));
      const label = $('[data-cal-label]', flyout);
      if (label) label.textContent = btn.dataset.calDay;
    });
  });
}

/* ---------------------------- Reloj ---------------------------- */

function setupClock() {
  const el = $('#clock');
  if (!el) return;
  const tick = () => {
    const now = new Date();
    const date = new Intl.DateTimeFormat('es-ES', {
      weekday: 'short', day: 'numeric', month: 'short'
    }).format(now).replace(',', '');
    const time = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(now);
    el.textContent = `${date} ${time}`;
    el.title = `${now.toLocaleString('es-ES')} · pulsa para ver el calendario`;
  };
  tick();
  setInterval(tick, 15000);
}

/* ---------------------------- Barra de menús oculta ---------------------------- */

function setupHotzone() {
  const hot = $('#menuHotzone');
  if (!hot) return;
  hot.addEventListener('mouseenter', () => {
    if (!state.menubarHidden) return;
    document.body.classList.add('menubar-peek');
  });
  document.body.addEventListener('mousemove', (e) => {
    if (!state.menubarHidden) { document.body.classList.remove('menubar-peek'); return; }
    if (e.clientY > 40 && document.body.classList.contains('menubar-peek')) {
      document.body.classList.remove('menubar-peek');
    }
  });
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
  if (!boot || !bar) return;
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
    bar.style.width = '100%';
    setTimeout(() => {
      boot.classList.add('gone');
      document.body.classList.add('ready');
      state.booted = true;
      if (!state.open.size) {
        setTimeout(() => { if (!state.open.size) openApp('archivos'); }, 420);
      }
    }, reduce ? 60 : 320);
  };

  const step = (now) => {
    if (started === null) started = now;
    const t = Math.min(1, (now - started) / duration);
    const eased = t < 0.85 ? 1 - Math.pow(1 - t / 0.85, 1.7) : 1;
    bar.style.width = (eased * 100).toFixed(1) + '%';

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
  // Red de seguridad: en pestañas en segundo plano el navegador puede
  // pausar requestAnimationFrame y la animación no avanzaría nunca.
  setTimeout(finish, duration + 1500);
  boot.addEventListener('click', finish);
  window.addEventListener('keydown', function skip(e) {
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
      finish();
      window.removeEventListener('keydown', skip);
    }
  });
}

/* ---------------------------- Init ---------------------------- */

loadPrefs();
buildDock();
buildDesktopIcons();
setupMenus();
setupControlCenter();
setupClock();
setupHotzone();
setupBoot();
setTheme(state.theme);
applyPrefs();
applySystemClasses();
syncControlCenter();
renderSpotResults('');
setInterval(musicTick, 1000);



