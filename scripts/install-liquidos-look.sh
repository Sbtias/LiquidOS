#!/usr/bin/env bash
# ============================================================
# LiquidOS — aplica el aspecto de LiquidOS a un Debian/Ubuntu
# con GNOME ya instalado. Ideal para probar sin compilar la ISO.
#
#   sudo ./scripts/install-liquidos-look.sh
#   sudo ./scripts/install-liquidos-look.sh --no-plymouth
#
# NO cambia el sistema base: solo tema, dock, fondos, splash
# y la app de bienvenida.
# ============================================================
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_USER="${SUDO_USER:-${USER:-}}"
WITH_PLYMOUTH=1
WITH_EXTENSIONS=1

log()  { printf '\033[1;36m[LiquidOS]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[LiquidOS]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[LiquidOS]\033[0m %s\n' "$*" >&2; exit 1; }

while [ $# -gt 0 ]; do
    case "$1" in
        --no-plymouth)   WITH_PLYMOUTH=0 ;;
        --no-extensions) WITH_EXTENSIONS=0 ;;
        -h|--help)
            sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'
            exit 0 ;;
        *) die "Opción desconocida: $1" ;;
    esac
    shift
done

[ "$(id -u)" -eq 0 ] || die "Ejecuta con sudo: sudo $0"
[ -n "$TARGET_USER" ] || die "No se pudo detectar el usuario. Usa: sudo SUDO_USER=tuusuario $0"
id "$TARGET_USER" >/dev/null 2>&1 || die "El usuario $TARGET_USER no existe."

as_user() {
    runuser -u "$TARGET_USER" -- dbus-run-session -- "$@" 2>/dev/null || true
}

# ------------------------------------------------------------
# 1. Dependencias
# ------------------------------------------------------------
log "Instalando dependencias (usuario destino: $TARGET_USER)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq

PAQUETES=(
    dconf-cli git curl ca-certificates
    sassc libglib2.0-dev-bin libxml2-utils librsvg2-bin
    fonts-inter fonts-jetbrains-mono
    gnome-tweaks python3-gi gir1.2-gtk-3.0
    xdg-user-dirs
)
[ "$WITH_EXTENSIONS" -eq 1 ] && PAQUETES+=(gnome-shell-extension-dashtodock gnome-shell-extension-appindicator)
[ "$WITH_PLYMOUTH" -eq 1 ] && PAQUETES+=(plymouth plymouth-themes)

apt-get install -y -qq --no-install-recommends "${PAQUETES[@]}"

# ------------------------------------------------------------
# 2. Temas WhiteSur (macOS-like)
# ------------------------------------------------------------
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

log "Descargando el tema WhiteSur"
if git clone --depth=1 --quiet https://github.com/vinceliuice/WhiteSur-gtk-theme.git "$TMP/gtk"; then
    ( cd "$TMP/gtk" && ./install.sh -d /usr/share/themes -c dark -c light -t default \
        --round --shell -i apple ) || warn "El tema GTK no se pudo instalar"
else
    warn "Sin conexión: se usará Adwaita oscuro"
fi

if git clone --depth=1 --quiet https://github.com/vinceliuice/WhiteSur-icon-theme.git "$TMP/icons"; then
    ( cd "$TMP/icons" && ./install.sh -d /usr/share/icons -t default ) || warn "Los iconos no se pudieron instalar"
fi

if git clone --depth=1 --quiet https://github.com/vinceliuice/WhiteSur-cursors.git "$TMP/cursors"; then
    ( cd "$TMP/cursors" && ./install.sh ) || warn "Los cursores no se pudieron instalar"
fi

if [ ! -d /usr/share/themes/WhiteSur-Dark ]; then
    warn "WhiteSur no está disponible; se ajustarán los ajustes a Adwaita"
    GTK_THEME="Adwaita-dark"
    ICON_THEME="Adwaita"
    CURSOR_THEME="Adwaita"
else
    GTK_THEME="WhiteSur-Dark"
    ICON_THEME="WhiteSur-dark"
    CURSOR_THEME="WhiteSur-cursors"
fi

# ------------------------------------------------------------
# 3. Fondos, logo y splash
# ------------------------------------------------------------
log "Instalando fondos y logotipo"
install -Dm644 "$ROOT/assets/wallpapers/liquidos-dark.svg"  /usr/share/backgrounds/liquidos/liquidos-dark.svg
install -Dm644 "$ROOT/assets/wallpapers/liquidos-light.svg" /usr/share/backgrounds/liquidos/liquidos-light.svg
install -Dm644 "$ROOT/branding/logo/liquidos-logo.svg"      /usr/share/pixmaps/liquidos-logo.svg
install -Dm644 "$ROOT/branding/logo/liquidos-logo.svg"      /usr/share/icons/hicolor/scalable/apps/liquidos-logo.svg
rsvg-convert -w 512 -h 614 /usr/share/pixmaps/liquidos-logo.svg -o /usr/share/pixmaps/liquidos-logo.png 2>/dev/null || true

if [ "$WITH_PLYMOUTH" -eq 1 ]; then
    log "Instalando el splash de arranque"
    DEST=/usr/share/plymouth/themes/liquidos
    install -d "$DEST/src"
    install -m644 "$ROOT/build/live-build/config/includes.chroot/usr/share/plymouth/themes/liquidos/liquidos.plymouth" "$DEST/"
    install -m644 "$ROOT/build/live-build/config/includes.chroot/usr/share/plymouth/themes/liquidos/liquidos.script"   "$DEST/"
    install -m644 "$ROOT/build/live-build/config/includes.chroot/usr/share/plymouth/themes/liquidos/src/dot.svg"       "$DEST/src/"
    install -m644 "$ROOT/build/live-build/config/includes.chroot/usr/share/plymouth/themes/liquidos/src/bar.svg"       "$DEST/src/"
    install -m644 "$ROOT/build/live-build/config/includes.chroot/usr/share/plymouth/themes/liquidos/src/knob.svg"      "$DEST/src/"
    install -m644 "$ROOT/branding/logo/liquidos-logo.svg" "$DEST/src/liquidos-logo.svg"
    rsvg-convert -w 160 -h 192 "$DEST/src/liquidos-logo.svg" -o "$DEST/logo.png" 2>/dev/null || true
    rsvg-convert -w 20  -h 20  "$DEST/src/dot.svg"           -o "$DEST/dot.png"  2>/dev/null || true
    rsvg-convert -w 240 -h 4   "$DEST/src/bar.svg"           -o "$DEST/bar.png"  2>/dev/null || true
    rsvg-convert -w 44  -h 44  "$DEST/src/knob.svg"          -o "$DEST/knob.png" 2>/dev/null || true
    plymouth-set-default-theme -R liquidos || warn "No se pudo activar Plymouth"
fi

# ------------------------------------------------------------
# 4. Valores por defecto del escritorio
# ------------------------------------------------------------
log "Aplicando ajustes del escritorio"
DCONF_DIR=/etc/dconf/db/local.d
install -d "$DCONF_DIR" /etc/dconf/profile
install -m644 "$ROOT/build/live-build/config/includes.chroot/etc/dconf/profile/user" /etc/dconf/profile/user

sed -e "s/WhiteSur-Dark/$GTK_THEME/g" \
    -e "s/WhiteSur-Light/Adwaita/g" \
    -e "s/WhiteSur-dark/$ICON_THEME/g" \
    -e "s/WhiteSur-cursors/$CURSOR_THEME/g" \
    -e "s/name='WhiteSur-Dark'/name='$GTK_THEME'/" \
    "$ROOT/build/live-build/config/includes.chroot/etc/dconf/db/local.d/00-liquidos" \
    > "$DCONF_DIR/00-liquidos"

dconf update || warn "dconf update falló; los ajustes se aplicarán al reiniciar sesión"

# Aplicar también en caliente para el usuario actual
as_user gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
as_user gsettings set org.gnome.desktop.interface gtk-theme "$GTK_THEME"
as_user gsettings set org.gnome.desktop.interface icon-theme "$ICON_THEME"
as_user gsettings set org.gnome.desktop.interface cursor-theme "$CURSOR_THEME"
as_user gsettings set org.gnome.desktop.interface font-name 'Inter 11'
as_user gsettings set org.gnome.desktop.interface clock-format '24h'
as_user gsettings set org.gnome.desktop.wm.preferences button-layout 'close,minimize,maximize:'
as_user gsettings set org.gnome.desktop.wm.preferences theme "$GTK_THEME"
as_user gsettings set org.gnome.desktop.background picture-uri 'file:///usr/share/backgrounds/liquidos/liquidos-dark.svg'
as_user gsettings set org.gnome.desktop.background picture-uri-dark 'file:///usr/share/backgrounds/liquidos/liquidos-dark.svg'
as_user gsettings set org.gnome.desktop.background picture-options 'zoom'
as_user gsettings set org.gnome.shell.extensions.user-theme name "$GTK_THEME"

log "Configurando el Dock"
if [ "$WITH_EXTENSIONS" -eq 1 ] && [ -d /usr/share/gnome-shell/extensions/dash-to-dock@micxgx.gmail.com ]; then
    as_user gsettings set org.gnome.shell enabled-extensions \
        "['dash-to-dock@micxgx.gmail.com', 'user-theme@gnome-shell-extensions.gcampax.github.com', 'appindicatorsupport@rgcjonas.gmail.com']"
    DTD=org.gnome.shell.extensions.dash-to-dock
    as_user gsettings set $DTD dock-position 'BOTTOM'
    as_user gsettings set $DTD extend-height false
    as_user gsettings set $DTD dock-fixed false
    as_user gsettings set $DTD autohide true
    as_user gsettings set $DTD intellihide true
    as_user gsettings set $DTD transparency-mode 'DYNAMIC'
    as_user gsettings set $DTD custom-theme-shrink true
    as_user gsettings set $DTD running-indicator-style 'DOTS'
    as_user gsettings set $DTD click-action 'minimize-or-previews'
    as_user gsettings set $DTD dash-max-icon-size 48
    as_user gsettings set $DTD show-trash true
    as_user gsettings set $DTD show-apps-at-top true
else
    warn "Dash to Dock no está instalado: el dock seguirá siendo el de GNOME"
fi

# ------------------------------------------------------------
# 5. App de bienvenida
# ------------------------------------------------------------
log "Instalando la app de bienvenida"
install -Dm755 "$ROOT/desktop/apps/liquid-welcome/liquid-welcome.py" /usr/share/liquidos/welcome/liquid-welcome.py
ln -sf /usr/share/liquidos/welcome/liquid-welcome.py /usr/bin/liquid-welcome
install -Dm644 "$ROOT/build/live-build/config/includes.chroot/usr/share/applications/liquid-welcome.desktop" \
    /usr/share/applications/liquid-welcome.desktop
install -Dm644 "$ROOT/build/live-build/config/includes.chroot/etc/xdg/autostart/liquid-welcome.desktop" \
    /etc/xdg/autostart/liquid-welcome.desktop
command -v update-desktop-database >/dev/null && update-desktop-database /usr/share/applications || true

# ------------------------------------------------------------
# 6. Resumen
# ------------------------------------------------------------
cat <<EOF

  LiquidOS · aspecto aplicado
  ────────────────────────────────────────────────
  Tema GTK      : $GTK_THEME
  Iconos        : $ICON_THEME
  Cursores      : $CURSOR_THEME
  Dock          : Dash to Dock (inferior, autohide)
  Fondos        : /usr/share/backgrounds/liquidos
  Splash        : $([ "$WITH_PLYMOUTH" -eq 1 ] && echo "activado" || echo "omitido")

  Cierra sesión y vuelve a entrar para verlo todo.
  Si algo no cambia: gnome-tweaks → Apariencia.
EOF
