#!/usr/bin/env bash
# ============================================================
# LiquidOS — construye la ISO dentro de Docker.
# No necesitas Debian en tu equipo: solo Docker.
#
#   ./build/docker-build.sh
#
# En Windows (Docker Desktop) ejecútalo desde Git Bash o WSL.
# ============================================================
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE="${LIQUIDOS_BUILDER_IMAGE:-liquidos-builder:bookworm}"

command -v docker >/dev/null 2>&1 || {
    echo "Docker no está instalado. Alternativas:" >&2
    echo "  · Instala Docker Desktop, o" >&2
    echo "  · usa una máquina Debian 12 y ejecuta: sudo ./build/build-iso.sh" >&2
    exit 1
}

echo "[LiquidOS] Construyendo la imagen de compilación ${IMAGE}"
docker build --platform linux/amd64 -t "$IMAGE" -f "$ROOT/build/Dockerfile" "$ROOT"

mkdir -p "$ROOT/dist"

echo "[LiquidOS] Generando la ISO (puede tardar entre 20 y 60 minutos)"
docker run --rm --privileged \
    --platform linux/amd64 \
    -v "$ROOT":/src \
    -e LIQUIDOS_VERSION="${LIQUIDOS_VERSION:-1.0}" \
    -e LIQUIDOS_ARCH="${LIQUIDOS_ARCH:-amd64}" \
    -e HOST_UID="$(id -u)" \
    -e HOST_GID="$(id -g)" \
    "$IMAGE"

echo "[LiquidOS] Resultado en: $ROOT/dist"
