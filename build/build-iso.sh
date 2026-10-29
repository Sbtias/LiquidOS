#!/usr/bin/env bash
# ============================================================
# LiquidOS — construcción de la ISO (se ejecuta en Debian/WSL/CI)
#
#   sudo ./build/build-iso.sh
#
# Variables opcionales:
#   LIQUIDOS_VERSION   (por defecto 1.0)
#   LIQUIDOS_ARCH      (por defecto amd64)
#   WORKDIR            (por defecto build/work)
#   LIQUIDOS_MIRROR    (por defecto http://deb.debian.org/debian/)
# ============================================================
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/build/live-build"
WORK="${WORKDIR:-$ROOT/build/work}"
OUT="$ROOT/dist"
VERSION="${LIQUIDOS_VERSION:-1.0}"
CODENAME="Torrente"
ARCH="${LIQUIDOS_ARCH:-amd64}"
MIRROR="${LIQUIDOS_MIRROR:-http://deb.debian.org/debian/}"
ISO_NAME="LiquidOS-${VERSION}-${ARCH}.iso"

log()  { printf '\033[1;36m[LiquidOS]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[LiquidOS]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[LiquidOS]\033[0m %s\n' "$*" >&2; exit 1; }

# ------------------------------------------------------------
# 1. Comprobaciones
# ------------------------------------------------------------
[ "$(id -u)" -eq 0 ] || die "Ejecuta este script como root (sudo ./build/build-iso.sh)."

for cmd in lb debootstrap xorriso mksquashfs; do
    command -v "$cmd" >/dev/null 2>&1 || die "Falta '$cmd'. Instala: apt install live-build debootstrap xorriso squashfs-tools"
done

FREE_MB=$(df -Pm "$ROOT" | awk 'NR==2 {print $4}')
[ "$FREE_MB" -ge 8000 ] || die "Necesitas al menos 8 GB libres (detectados ${FREE_MB} MB)."

log "LiquidOS ${VERSION} «${CODENAME}» · ${ARCH} · Debian 12 (bookworm)"
log "Espacio libre: ${FREE_MB} MB"

# ------------------------------------------------------------
# 2. Árbol de compilación limpio
# ------------------------------------------------------------
log "Preparando el árbol de compilación en ${WORK}"
rm -rf "$WORK"
mkdir -p "$WORK" "$OUT"
cp -a "$SRC"/. "$WORK"/

# ------------------------------------------------------------
# 3. Sincronizar recursos del repositorio
# ------------------------------------------------------------
stage() {
    local INC="$WORK/config/includes.chroot"

    install -Dm644 "$ROOT/assets/wallpapers/liquidos-dark.svg"  "$INC/usr/share/backgrounds/liquidos/liquidos-dark.svg"
    install -Dm644 "$ROOT/assets/wallpapers/liquidos-light.svg" "$INC/usr/share/backgrounds/liquidos/liquidos-light.svg"

    install -Dm644 "$ROOT/branding/logo/liquidos-logo.svg" "$INC/usr/share/pixmaps/liquidos-logo.svg"
    install -Dm644 "$ROOT/branding/logo/liquidos-logo.svg" "$INC/usr/share/icons/hicolor/scalable/apps/liquidos-logo.svg"
    install -Dm644 "$ROOT/branding/logo/liquidos-logo.svg" "$INC/usr/share/plymouth/themes/liquidos/src/liquidos-logo.svg"

    install -Dm755 "$ROOT/desktop/apps/liquid-welcome/liquid-welcome.py" \
        "$INC/usr/share/liquidos/welcome/liquid-welcome.py"

    install -Dm644 "$ROOT/branding/logo/liquidos-logo.svg" \
        "$INC/usr/share/calamares/branding/liquidos/liquidos-logo.svg"

    chmod +x "$WORK"/config/hooks/normal/*.hook.chroot

    # El script de verificación se puede ejecutar dentro de la ISO.
    install -Dm755 "$ROOT/scripts/verificar-uso-diario.sh" \
        "$INC/usr/local/bin/liquidos-verificar"

    # Windows no conserva el bit de ejecución: lo restauramos para los
    # scripts que systemd y el usuario ejecutan dentro de la ISO.
    chmod +x "$INC/usr/local/sbin/liquidos-firstboot" 2>/dev/null || true

    # Versión real en los ficheros de identidad
    sed -i "s/^VERSION=\"1.0\"/VERSION=\"${VERSION}\"/" \
        "$WORK/config/hooks/normal/0100-liquidos-identity.hook.chroot"
}
stage

# ------------------------------------------------------------
# 4. Configurar live-build
# ------------------------------------------------------------
cd "$WORK"

log "Configurando live-build"
lb config \
    --mode debian \
    --system live \
    --architecture "$ARCH" \
    --distribution bookworm \
    --binary-image iso-hybrid \
    --bootloaders "grub-pc grub-efi" \
    --uefi-secure-boot auto \
    --initramfs live-boot \
    --initsystem systemd \
    --linux-flavours "$ARCH" \
    --apt-recommends true \
    --apt-indices true \
    --debian-installer none \
    --memtest none \
    --mirror-bootstrap "$MIRROR" \
    --mirror-chroot "$MIRROR" \
    --mirror-binary "$MIRROR" \
    --updates true \
    --security true \
    --image-name liquidos \
    --iso-application "LiquidOS" \
    --iso-preparer "LiquidOS Build System" \
    --iso-publisher "Proyecto LiquidOS" \
    --iso-volume "LIQUIDOS_${VERSION}_${ARCH}" \
    --bootappend-live "boot=live components quiet splash loglevel=3 vt.global_cursor_default=0" \
    --bootappend-live-failsafe "boot=live components nomodeset quiet splash vt.global_cursor_default=0" \
    --chroot-squashfs-compression-type zstd \
    --checksums sha256 \
    --zsync false \
    --compression xz

# ------------------------------------------------------------
# 5. Construir
# ------------------------------------------------------------
log "Construyendo la ISO (esto tarda entre 20 y 60 minutos)"
lb build 2>&1 | tee "$OUT/build.log"

# ------------------------------------------------------------
# 6. Publicar el resultado
# ------------------------------------------------------------
ISO=$(find "$WORK" -maxdepth 1 -name '*.hybrid.iso' -print -quit)
[ -n "$ISO" ] || die "No se generó ninguna ISO. Revisa $OUT/build.log"

cp -f "$ISO" "$OUT/$ISO_NAME"
( cd "$OUT" && sha256sum "$ISO_NAME" > "$ISO_NAME.sha256" )

if [ -n "${HOST_UID:-}" ]; then
    chown -R "${HOST_UID}:${HOST_GID:-$HOST_UID}" "$OUT" 2>/dev/null || true
fi

log "Listo: $OUT/$ISO_NAME"
log "Tamaño: $(du -h "$OUT/$ISO_NAME" | cut -f1)"
log "Puedes grabarla con: sudo dd if=$OUT/$ISO_NAME of=/dev/sdX bs=8M status=progress"
