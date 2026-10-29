#!/usr/bin/env bash
# ============================================================
# LiquidOS — publicar una descarga en Supabase
#
#   scripts/publicar-descarga.sh dist/LiquidOS-1.0-amd64.iso \
#       --version 1.0 --channel stable
#
# Hace tres cosas:
#   1. Calcula tamaño y SHA-256 de la ISO.
#   2. Sube el manifiesto JSON y SHA256SUMS al bucket público «liquidos».
#   3. Registra la versión en public.liquidos_releases y la marca como actual.
#
# El binario NO se sube por defecto: con el límite actual de Supabase
# (50 MB por objeto) la ISO no cabe. Se enlaza a GitHub Releases o al
# artefacto del run. Usa --upload-iso solo si el proyecto admite el tamaño.
#
# Variables de entorno:
#   SUPABASE_URL                URL del proyecto (https://xxx.supabase.co)
#   SUPABASE_SERVICE_ROLE_KEY   clave de servicio (solo en CI o tu equipo)
#   SUPABASE_SECRET_KEY         alternativa moderna a la anterior
#   LIQUIDOS_DOWNLOAD_URL       URL pública del binario (si no, se deduce)
#   GITHUB_REPOSITORY           owner/repo (por defecto Sbtias/LiquidOS)
#   LIQUIDOS_SUPABASE_MAX_BYTES límite del bucket (por defecto 52428800)
#
# Ejemplos:
#   scripts/publicar-descarga.sh --dry-run dist/LiquidOS-1.0-amd64.iso
#   scripts/publicar-descarga.sh --check
# ============================================================
set -euo pipefail

VERSION="${LIQUIDOS_VERSION:-1.0}"
ARCH="${LIQUIDOS_ARCH:-amd64}"
CHANNEL="${LIQUIDOS_CHANNEL:-stable}"
BUCKET="${LIQUIDOS_BUCKET:-liquidos}"
REPO="${GITHUB_REPOSITORY:-Sbtias/LiquidOS}"
SOURCE="${LIQUIDOS_SOURCE:-release}"
RUN_URL="${LIQUIDOS_RUN_URL:-}"
DOWNLOAD_URL="${LIQUIDOS_DOWNLOAD_URL:-}"
MAX_BYTES="${LIQUIDOS_SUPABASE_MAX_BYTES:-52428800}"

ISO=""
NOTES_FILE=""
DRY_RUN=0
UPLOAD_ISO=0
SKIP_STORAGE=0
CHECK=0

usage() {
  sed -n '2,28p' "$0" | sed 's/^# \{0,1\}//'
  cat <<'EOF'

Opciones:
  --version V        versión publicada (defecto: $LIQUIDOS_VERSION o 1.0)
  --arch A           arquitectura (defecto: $LIQUIDOS_ARCH o amd64)
  --channel C        canal: stable, beta, nightly… (defecto: stable)
  --notes FICHERO    notas de la versión (texto plano)
  --source TIPO      release | artifact (defecto: release)
  --run-url URL      página del run de Actions (para --source artifact)
  --download-url URL URL pública del binario
  --upload-iso       sube también la ISO si cabe en el bucket
  --skip-storage     no sube manifiesto ni sumas (solo la tabla)
  --timeout S        timeout de cada petición (defecto: 60)
  --dry-run          muestra lo que haría, sin red ni claves
  --check            comprueba la conexión y lista las últimas versiones
  -h, --help         esta ayuda
EOF
}

fail() { printf 'Error: %s\n' "$*" >&2; exit 1; }
log() { printf '· %s\n' "$*"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --version) VERSION="${2:-}"; shift 2 ;;
    --arch) ARCH="${2:-}"; shift 2 ;;
    --channel) CHANNEL="${2:-}"; shift 2 ;;
    --notes) NOTES_FILE="${2:-}"; shift 2 ;;
    --source) SOURCE="${2:-}"; shift 2 ;;
    --run-url) RUN_URL="${2:-}"; shift 2 ;;
    --download-url) DOWNLOAD_URL="${2:-}"; shift 2 ;;
    --bucket) BUCKET="${2:-}"; shift 2 ;;
    --repo) REPO="${2:-}"; shift 2 ;;
    --upload-iso) UPLOAD_ISO=1; shift ;;
    --skip-storage) SKIP_STORAGE=1; shift ;;
    --timeout) TIMEOUT="${2:-60}"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --check) CHECK=1; shift ;;
    -h|--help) usage; exit 0 ;;
    -*) fail "opción desconocida: $1 (usa --help)" ;;
    *)
      [ -z "$ISO" ] || fail "solo se admite una ISO"
      ISO="$1"
      shift
      ;;
  esac
done

TIMEOUT="${TIMEOUT:-60}"
SUPABASE_URL="${SUPABASE_URL:-https://noeankaxfyqvgtkrulno.supabase.co}"
KEY="${SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SECRET_KEY:-}}"
SUPABASE_URL="${SUPABASE_URL%/}"

# Nombres y canales seguros: evitan rutas extrañas dentro del bucket.
[[ "$VERSION" =~ ^[A-Za-z0-9._-]+$ ]] || fail "versión no válida: $VERSION"
[[ "$CHANNEL" =~ ^[A-Za-z0-9._-]+$ ]] || fail "canal no válido: $CHANNEL"
[[ "$ARCH" =~ ^[A-Za-z0-9._-]+$ ]] || fail "arquitectura no válida: $ARCH"
[[ "$BUCKET" =~ ^[a-z0-9-]+$ ]] || fail "bucket no válido: $BUCKET"

require_key() {
  [ -n "$SUPABASE_URL" ] || fail "falta SUPABASE_URL"
  [ -n "$KEY" ] || fail "falta SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SECRET_KEY)"
}

api() {
  # api MÉTODO RUTA [extra...]
  local method="$1" path="$2"
  shift 2
  curl --fail-with-body -sS --max-time "$TIMEOUT" \
    -X "$method" "$SUPABASE_URL$path" \
    -H "apikey: $KEY" \
    -H "Authorization: Bearer $KEY" \
    -H "Accept: application/json" \
    "$@"
}

if [ "$CHECK" -eq 1 ]; then
  require_key
  log "Consultando $SUPABASE_URL"
  api GET "/rest/v1/liquidos_releases?select=version,channel,is_current,created_at&order=created_at.desc&limit=5"
  status=$(curl -sS --max-time "$TIMEOUT" \
    "$SUPABASE_URL/storage/v1/object/public/$BUCKET/releases/$CHANNEL/$VERSION.json" \
    -o /dev/null -w '%{http_code}' || true)
  case "$status" in
    200) printf '\nManifiesto de %s: publicado\n' "$VERSION" ;;
    400|404) printf '\nManifiesto de %s: todavía no publicado\n' "$VERSION" ;;
    *) printf '\nManifiesto de %s: HTTP %s\n' "$VERSION" "$status" ;;
  esac
  exit 0
fi

ISO_NAME="${ISO:+$(basename "$ISO")}"
ISO_NAME="${ISO_NAME:-LiquidOS-$VERSION-$ARCH.iso}"
SIZE=""
SHA=""
if [ -n "$ISO" ]; then
  [ -f "$ISO" ] || fail "no existe la ISO: $ISO"
  SIZE=$(wc -c < "$ISO" | tr -d '[:space:]')
  if command -v sha256sum >/dev/null 2>&1; then
    SHA=$(sha256sum "$ISO" | awk '{print $1}')
  elif command -v shasum >/dev/null 2>&1; then
    SHA=$(shasum -a 256 "$ISO" | awk '{print $1}')
  else
    fail "faltan sha256sum o shasum para calcular la suma"
  fi
fi

if [ -z "$DOWNLOAD_URL" ]; then
  if [ "$SOURCE" = "artifact" ]; then
    DOWNLOAD_URL="${RUN_URL:-https://github.com/$REPO/actions}"
  else
    DOWNLOAD_URL="https://github.com/$REPO/releases/download/v$VERSION/$ISO_NAME"
  fi
fi
[[ "$DOWNLOAD_URL" =~ ^https?:// ]] || fail "download_url no es una URL http(s): $DOWNLOAD_URL"
if [ -n "$RUN_URL" ] && [[ ! "$RUN_URL" =~ ^https?:// ]]; then
  fail "run_url no es una URL http(s): $RUN_URL"
fi

NOTES=""
if [ -n "$NOTES_FILE" ]; then
  [ -f "$NOTES_FILE" ] || fail "no existe el fichero de notas: $NOTES_FILE"
  NOTES=$(head -c 2000 "$NOTES_FILE" | tr -d '\r')
fi

json_string() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\"/\\\"}"
  s="${s//$'\n'/\\n}"
  s="${s//$'\r'/}"
  s="${s//$'\t'/\\t}"
  printf '"%s"' "$s"
}

size_json="null"; [ -n "$SIZE" ] && size_json="$SIZE"
sha_json="null"; [ -n "$SHA" ] && sha_json="$(json_string "$SHA")"
run_json="null"; [ -n "$RUN_URL" ] && run_json="$(json_string "$RUN_URL")"
storage_json="null"

if [ "$UPLOAD_ISO" -eq 1 ] && [ -n "$ISO" ] && [ -n "$SIZE" ]; then
  if [ "$SIZE" -le "$MAX_BYTES" ]; then
    storage_json="$(json_string "releases/$CHANNEL/$VERSION/$ISO_NAME")"
  else
    log "La ISO pesa $SIZE bytes y el límite es $MAX_BYTES: se enlaza fuera de Supabase"
  fi
fi

payload=$(printf '{"version":%s,"channel":%s,"iso_name":%s,"size_bytes":%s,"sha256":%s,"download_url":%s,"storage_path":%s,"notes":%s,"source":%s,"run_url":%s,"is_current":true}' \
  "$(json_string "$VERSION")" \
  "$(json_string "$CHANNEL")" \
  "$(json_string "$ISO_NAME")" \
  "$size_json" \
  "$sha_json" \
  "$(json_string "$DOWNLOAD_URL")" \
  "$storage_json" \
  "$(json_string "$NOTES")" \
  "$(json_string "$SOURCE")" \
  "$run_json")

manifest_url="$SUPABASE_URL/storage/v1/object/public/$BUCKET/releases/$CHANNEL/$VERSION.json"

if [ "$DRY_RUN" -eq 1 ]; then
  log "Modo de prueba: no se toca la red"
  printf '\nFila que se enviaría:\n%s\n\n' "$payload"
  printf 'Manifiesto público: %s\n' "$manifest_url"
  [ -n "$SHA" ] && printf 'SHA-256: %s\n' "$SHA"
  exit 0
fi

require_key
[ -n "$KEY" ] || fail "clave vacía"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

printf '%s\n' "$payload" > "$TMP/manifest.json"
if [ -n "$SHA" ]; then
  printf '%s  %s\n' "$SHA" "$ISO_NAME" > "$TMP/SHA256SUMS"
else
  printf 'Sin SHA-256: falta el binario\n' > "$TMP/SHA256SUMS"
fi

upload_object() {
  local file="$1" path="$2" type="$3"
  api POST "/storage/v1/object/$BUCKET/$path" \
    -H "Content-Type: $type" \
    -H "x-upsert: true" \
    --data-binary "@$file" >/dev/null
  printf '%s/storage/v1/object/public/%s/%s' "$SUPABASE_URL" "$BUCKET" "$path"
}

if [ "$SKIP_STORAGE" -eq 0 ]; then
  log "Subiendo el manifiesto"
  manifest_url=$(upload_object "$TMP/manifest.json" "releases/$CHANNEL/$VERSION.json" "application/json")
  log "Subiendo SHA256SUMS"
  upload_object "$TMP/SHA256SUMS" "releases/$CHANNEL/$VERSION/SHA256SUMS" "text/plain; charset=utf-8" >/dev/null
  if [ "$storage_json" != "null" ] && [ -n "$ISO" ]; then
    log "Subiendo la ISO al bucket (esto puede tardar)"
    upload_object "$ISO" "releases/$CHANNEL/$VERSION/$ISO_NAME" "application/x-iso9660-image" >/dev/null
  fi
fi

log "Desmarcando la versión actual anterior de $CHANNEL"
api PATCH "/rest/v1/liquidos_releases?channel=eq.$CHANNEL&version=neq.$VERSION" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  --data-binary '{"is_current":false}' >/dev/null

log "Registrando $VERSION en Supabase"
api POST "/rest/v1/liquidos_releases?on_conflict=version,channel" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=representation" \
  --data-binary "@$TMP/manifest.json"

printf '\n'
log "Listo: $VERSION ($CHANNEL)"
printf 'Descarga:   %s\n' "$DOWNLOAD_URL"
printf 'Manifiesto: %s\n' "$manifest_url"
[ -n "$SHA" ] && printf 'SHA-256:    %s\n' "$SHA"
