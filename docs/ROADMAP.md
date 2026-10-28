# Hoja de ruta

## v1.0 «Torrente» — alpha actual

Objetivo: que la ISO arranque, se vea como LiquidOS y sea usable en una VM.

- [x] Estructura del repositorio y build reproducible con Docker.
- [x] Identidad del sistema, zsh por defecto y esqueletos de usuario.
- [x] Tema WhiteSur (GTK, iconos, cursores) con respaldo a Adwaita.
- [x] Dock inferior con Dash to Dock y botones de ventana a la izquierda.
- [x] Fondos vectoriales claro/oscuro y logotipo propio.
- [x] Plymouth + tema GRUB.
- [x] App de bienvenida con atajos.
- [x] Vista previa web interactiva del escritorio.
- [ ] Validar la ISO en QEMU (BIOS y UEFI) y corregir el splash.
- [ ] Validar Calamares de principio a fin en una VM.
- [ ] Añadir `blur-my-shell` empaquetado para bookworm (o backport propio).

## v1.1 — beta

Objetivo: que instalar LiquidOS sea tan fiable como instalar Debian.

- [ ] Preseed / automatización del instalador y pruebas en hardware real.
- [ ] Repositorio APT propio con `apt update` firmado.
- [ ] Centro de bienvenida con perfiles de color (azul, grafito, arena, verde).
- [ ] Iconos de aplicaciones propias (Navegador, Correo, Notas) coherentes con el sistema.
- [ ] Sesión de GNOME sin extensiones rotas: empaquetar y versionar cada una.
- [ ] Imagen ARM64 para Raspberry Pi 5.
- [ ] Edición *Lite* (~1,2 GB) sin ofimática ni edición de imagen.

## v2.0 — estable

- [ ] Secure Boot con claves propias.
- [ ] Actualizaciones atómicas opcionales (A/B) sobre btrfs.
- [ ] Asistente de primer arranque: idioma, cuenta, copia de seguridad, cifrado.
- [ ] Tienda de apps curada (Flatpak) con apps verificadas.
- [ ] Documentación de usuario final y web del proyecto.
- [ ] Suite de pruebas automáticas: arranque, login, apps clave, captura de pantalla.

## Ideas para más adelante

- Modo "enfoque" con notificaciones silenciadas y música integrada.
- Sincronización opcional de ajustes entre equipos (autoalojada).
- Panel lateral tipo "Stage Manager" para agrupar ventanas.
- Efecto de vidrio líquido en el dock usando shaders (requiere extensión propia).
- Edición "Creator" con OBS, Kdenlive, GIMP e Inkscape preinstalados.
