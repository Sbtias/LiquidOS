# Arquitectura de LiquidOS

## 1. Vista general

LiquidOS es una **derivada de Debian 12 (bookworm)** que no reemplaza nada del sistema base:
añade una capa de configuración, branding y aplicaciones propias sobre GNOME.
Esa decisión mantiene la distro actualizable, auditable y compatible con el ecosistema Debian.

```
┌──────────────────────────────────────────────────────────────┐
│  Marca         GRUB · Plymouth · fondos · os-release         │
├──────────────────────────────────────────────────────────────┤
│  Capa Liquid   dconf · WhiteSur · Dash to Dock · bienvenida  │
├──────────────────────────────────────────────────────────────┤
│  Escritorio    GNOME Shell 43 · GDM · Nautilus · Terminal    │
├──────────────────────────────────────────────────────────────┤
│  Sistema       systemd · PipeWire · NetworkManager · CUPS    │
├──────────────────────────────────────────────────────────────┤
│  Base          Debian 12 bookworm (kernel 6.1 LTS, amd64)    │
└──────────────────────────────────────────────────────────────┘
```

## 2. Flujo de arranque

1. **GRUB** (`bootloaders/grub-pc/grub.cfg` + `boot/grub/themes/liquidos`) muestra el menú
   con el tema oscuro de LiquidOS.
2. El kernel arranca con `boot=live components quiet splash loglevel=3 vt.global_cursor_default=0`;
   `live-boot` monta el `filesystem.squashfs` con overlay en RAM.
3. **Plymouth** toma la pantalla: gota con fundido y flotación suave, tres puntos en secuencia
   y una barra de progreso con nodo luminoso que avanza según el arranque real
   (`Plymouth.SetBootProgressFunction`). Ver `usr/share/plymouth/themes/liquidos/liquidos.script`.
4. **systemd** levanta los servicios; `live-config` crea el usuario `user` (sin contraseña, con `sudo`).
5. **GDM** aplica `greeter.dconf-defaults` (logo, fondo, tema oscuro).
6. Al iniciar sesión, **dconf** aplica `/etc/dconf/db/local.d/00-liquidos`:
   botones de ventana a la izquierda, Inter 11, tema WhiteSur, dock inferior.
7. Se lanza **liquid-welcome** una sola vez (marca en `~/.config/liquidos-welcome`).

## 3. Capas y responsabilidades

### 3.1 Base (`build/live-build/config/package-lists`)

Una única lista declara todo el software. Reglas:

- Solo `main` (todo software libre y redistribuible).
- Nada de paquetes propietarios en la ISO; el firmware no libre queda fuera por defecto.
- Las apps "grandes" (LibreOffice, GIMP, VLC) están en la lista para que la ISO sea usable
  sin conexión; la futura edición *Lite* las quitará.
- **Firefox (ESR) y Thunderbird** son parte de la base: no hay que instalar un navegador ni un
  cliente de correo tras el primer arranque.

### 3.2 Identidad (`hooks/normal/0100-*`)

Un solo hook genera `/etc/os-release`, `/etc/lsb-release`, `/etc/issue`, hostname, zsh por
defecto y los esqueletos de configuración de usuario (`/etc/skel`). Cambiar la versión o el
nombre en un sitio (y en `build/build-iso.sh`) es suficiente.

### 3.3 Tema (`hooks/normal/0200-*`)

- Clona **WhiteSur** (GTK, iconos, cursores) y lo instala en `/usr/share`, no en `$HOME`:
  todos los usuarios comparten tema y la ISO no arrastra configuraciones personales.
- Genera los PNG de Plymouth con `rsvg-convert` a partir de los SVG del repo.
- Si no hay red, **degrada a Adwaita oscuro** reescribiendo el fichero de dconf.
  La ISO sigue siendo válida, solo pierde el acabado macOS.

### 3.4 Extensiones (`hooks/normal/0300-*`)

`Dash to Dock` (dock inferior), `Blur my Shell` (cristal) y `AppIndicator` (bandeja).
Bookworm no incluye `blur-my-shell`; el hook lo intenta y, si no está, elimina su UUID de la
lista de extensiones activas para que GNOME no muestre errores.

### 3.5 Valores por defecto (`includes.chroot/etc/dconf`)

El fichero `00-liquidos` es la **fuente de verdad del aspecto**. Se aplica a nivel de sistema
(no en `~/.config`), por lo que vale para cualquier usuario nuevo y para el instalador.
`01-liquidos-uso-diario` añade los valores cómodos para el día a día (sonidos, notificaciones,
Nautilus, energía, búsqueda). Los usuarios pueden cambiarlo: no hay bloqueos (`locks/`) a propósito.

### 3.6 Branding de arranque

- `includes.chroot/boot/grub/themes/liquidos/theme.txt` → sistema instalado.
- `includes.binary/boot/grub/themes/liquidos/theme.txt` → menú del medio live.
- Plymouth vive en el chroot y se activa con `plymouth-set-default-theme -R`.

### 3.7 Aplicaciones propias (`desktop/apps`)

`liquid-welcome` es GTK3 + PyGObject, sin dependencias extra (python3-gi ya está en GNOME).
Se instala en `/usr/share/liquidos/welcome` y se enlaza en `/usr/bin/liquid-welcome`.
La compilación la copia al chroot: el repo es la única fuente.

### 3.8 Instalador (`Calamares`)

Configuración en `etc/calamares` y branding en `/usr/share/calamares/branding/liquidos`.
Instala el sistema copiando el squashfs (`unpackfs`) y configura GRUB, locale, usuarios y Plymouth.
**Estado experimental**: falta probar el ciclo completo en UEFI y BIOS.

### 3.9 Uso diario (`hooks/normal/0350-*`)

Este hook prepara la distro para no tener que configurar nada al arrancar:

- Alias `/usr/local/bin/firefox` → `firefox-esr` y renombrado de la entrada `.desktop` a
  «Firefox». `update-alternatives` deja Firefox como `x-www-browser` y `gnome-www-browser`.
- `/etc/xdg/mimeapps.list` fija Firefox para `http`, `https`, HTML y PDF, y Thunderbird para
  `mailto:`.
- `flatpak remote-add --system flathub` para que **GNOME Software** tenga catálogo amplio.
  Si la compilación no tiene red, el hook avisa y continúa: la ISO sigue siendo válida.
- `liquidos-firstboot.service` + `/usr/local/sbin/liquidos-firstboot`: en el primer arranque
  con red añade Flathub, refresca appstream y el catálogo de PackageKit, y deja la marca
  `/var/lib/liquidos/firstboot.done`. Si no hay red, se reintenta en el siguiente arranque.
- `/etc/polkit-1/rules.d/49-liquidos-live.rules`: permite instalar con PackageKit y Flatpak
  sin contraseña **solo al usuario `user` de la sesión live**. La cuenta creada por Calamares
  no se llama así, de modo que en el sistema instalado se sigue pidiendo autenticación.
- Paquetes `packagekit`, `packagekit-tools`, `packagekit-backend-aptcc`,
  `xdg-desktop-portal` y `xdg-desktop-portal-gtk` para que GNOME Software pueda instalar
  paquetes Debian y los portales funcionen en Wayland.
- `/usr/local/bin/liquidos` (más `liquidos-report` y `liquidos-verificar`) con `info`, `apps`,
  `search`, `install`, `remove`, `update`, `store`, `flatpak`, `theme`, `wallpaper`, `doctor`,
  `verificar` y `report`.
- Alias de zsh en `/etc/skel/.zshrc` (`actualizar`, `tienda`, `estado`, `navegador`, `correo`…).

La vista previa web reproduce estas mismas funciones en `preview/app.js` (Centro de software,
shell virtual y panel de personalización) para poder probarlas sin compilar la ISO. Además,
`scripts/preview.mjs` expone dos APIs locales:

- `/api/web`: descarga páginas reales, elimina scripts, iframes y manejadores inline, añade
  una base y un puente de navegación, y bloquea destinos privados (SSRF). El iframe se
  ejecuta en un origen opaco (`sandbox`), separado del escritorio.
- `/api/store/*`: consulta la API real de Flathub (catálogo e iconos) y, si el equipo tiene
  Flatpak, lanza `flatpak install/update/uninstall` como trabajos en segundo plano con su
  salida. Sin Flatpak responde con el comando exacto en lugar de fingir una instalación.

La demo no forma parte de la ISO; es una herramienta de diseño y prueba.

## 4. Decisiones y alternativas descartadas

| Decisión | Por qué | Alternativa descartada |
|---|---|---|
| Debian 12 estable | Base predecible, 5 años de soporte, paquetes firmados | Arch/Ubuntu (más cambios, menos estabilidad) |
| `live-build` | Herramienta oficial de Debian Live, reproducible, hooks claros | `debos`, `mkosi` (más modernos pero menos documentados para ISO híbrida) |
| GNOME Shell | Wayland, HiDPI, accesibilidad, apps maduras | KDE Plasma (más configurable, más piezas que mantener) |
| WhiteSur | Mantenido, cubre GTK3/4, iconos, cursores y shell | Tema propio desde cero (meses de trabajo) |
| dconf de sistema | Un solo sitio para el look; sobrevive a usuarios nuevos | `gsettings` por usuario (frágil, no escala) |
| zstd en squashfs | Compila 3–4× más rápido que xz con tamaño similar | xz (ISO algo más pequeña, build mucho más lento) |
| Firefox ESR de Debian | Cero claves/repos externos, actualizaciones por seguridad de Debian | PPA/repositorio APT de Mozilla (más frágil en una ISO) |
| GNOME Software + Flathub | Tienda gráfica sin desarrollar una propia; apps fuera de Debian | Tienda propia (mucho mantenimiento) |
| `liquidos` en `/usr/local/bin` | Automatiza lo cotidiano sin depender de la tienda | Solo documentación de comandos |

## 5. Seguridad y privacidad

- No se incluyen claves SSH de host ni `machine-id` de la máquina de compilación
  (`0900-liquidos-cleanup`).
- El usuario live usa `sudo` sin contraseña, práctica habitual en Debian Live;
  **no** es adecuado para un sistema instalado sin cambiarlo.
- No hay telemetría, cuentas online ni servicios propietarios por defecto.
- Las actualizaciones usan los repositorios oficiales de Debian con firma GPG.

## 6. Limitaciones actuales

1. El instalador Calamares no se ha validado de punta a punta.
2. `blur-my-shell` no está empaquetado en bookworm: el efecto cristal depende de WhiteSur.
3. Las apps libadwaita (GTK4) solo toman el tema mediante el `gtk.css` copiado a `/etc/skel`;
   un usuario creado antes de esa copia verá Adwaita.
4. Sin repositorio APT propio: `apt upgrade` actualiza a Debian, no a "LiquidOS 1.1".
5. Secure Boot usa el shim firmado de Debian, no uno propio.
6. El Centro de software necesita red la primera vez que se usa Flathub; la ISO se compila sin
   descargar aplicaciones Flatpak para no crecer de más.
