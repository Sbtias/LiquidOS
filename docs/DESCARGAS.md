# Descargas de LiquidOS

Este documento explica dónde vive cada ISO, cómo se publica y cómo se verifica.
La idea es sencilla: **el binario pesa demasiado para Supabase, así que el
registro y los checksums están en Supabase y la ISO en GitHub Releases.**

---

## 1. Dónde se descarga

| Pieza | Dónde | Por qué |
|---|---|---|
| ISO (`LiquidOS-1.0-amd64.iso`) | [GitHub Releases](https://github.com/Sbtias/LiquidOS/releases) | Sin límite práctico de tamaño y con CDN de GitHub |
| Registro de versiones | Supabase · `public.liquidos_releases` | Una sola fuente de verdad para la web y la vista previa |
| Manifiesto JSON | Supabase Storage · bucket `liquidos` | Datos estructurados de la versión |
| `SHA256SUMS` | Supabase Storage · bucket `liquidos` | Verificación independiente del binario |
| Artefacto de cada compilación | GitHub Actions | Pruebas internas antes de etiquetar una release |

La vista previa (`node scripts/preview.mjs`) consulta el registro real en
**Firefox → Descargas** mediante `GET /api/downloads`.

> Repositorio: <https://github.com/Sbtias/LiquidOS>  
> Proyecto Supabase: `https://noeankaxfyqvgtkrulno.supabase.co`

---

## 2. Por qué la ISO no se sube a Supabase

El plan actual del proyecto tiene un límite de **50 MB por objeto**
(`file_size_limit = 52428800`) y una ISO Debian con GNOME ronda los 2–3 GB.
Subirla requeriría subir de plan o configurar almacenamiento externo (S3), y
además gastaría la cuota de transferencia del proyecto.

Por eso el flujo por defecto es:

1. GitHub Actions construye la ISO.
2. Si la compilación viene de una etiqueta `v*`, la ISO se adjunta a la release.
3. `scripts/publicar-descarga.sh` calcula tamaño y SHA-256.
4. Sube el manifiesto y `SHA256SUMS` al bucket `liquidos` (pesan kilobytes).
5. Hace *upsert* en `public.liquidos_releases` y marca esa versión como actual.

Si algún día el proyecto admite ISO en Storage, el script ya tiene
`--upload-iso`: solo sube el binario cuando cabe en el límite y guarda su ruta
en `storage_path`.

---

## 3. Estructura en Supabase

### Tabla `public.liquidos_releases`

| Columna | Tipo | Uso |
|---|---|---|
| `id` | `uuid` | Identificador |
| `version` | `text` | `1.0`, `1.1`… |
| `channel` | `text` | `stable`, `beta`, `nightly`… |
| `iso_name` | `text` | Nombre exacto del archivo |
| `size_bytes` | `bigint` | Tamaño real |
| `sha256` | `text` | Suma SHA-256 |
| `download_url` | `text` | Enlace público al binario |
| `storage_path` | `text` | Ruta en Storage si se subió la ISO |
| `notes` | `text` | Notas de la versión |
| `source` | `text` | `release`, `artifact` o `storage` |
| `run_url` | `text` | Página del run de Actions |
| `is_current` | `boolean` | Versión actual del canal |
| `created_at` / `updated_at` | `timestamptz` | Fechas |

Restricciones e índices:

- `unique (version, channel)` — una fila por versión y canal.
- Índice único parcial `(channel) where is_current` — solo una versión actual
  por canal.
- RLS activo con **lectura pública** para `anon` y `authenticated`.
- Sin políticas de escritura: solo la clave de servicio puede insertar.

### Bucket `liquidos`

- Público para lectura.
- Límite: 50 MB por objeto.
- MIME permitidos: `application/json`, `text/plain`,
  `application/octet-stream`, `application/x-iso9660-image`.
- Rutas que genera el script:

```text
liquidos/
├── releases/
│   └── stable/
│       ├── 1.0.json
│       └── 1.0/
│           └── SHA256SUMS
└── (opcional) releases/stable/1.0/LiquidOS-1.0-amd64.iso
```

Manifiesto público:

```text
https://noeankaxfyqvgtkrulno.supabase.co/storage/v1/object/public/liquidos/releases/stable/1.0.json
```

---

## 4. Publicar una versión

### Desde tu equipo

Necesitas la **clave de servicio** (`service_role` o `sb_secret_…`). No la
guardes en el repositorio ni en la vista previa: solo se usa para escribir.

```bash
export SUPABASE_URL="https://noeankaxfyqvgtkrulno.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="…"

# 1. Comprobar el acceso y ver las últimas versiones
scripts/publicar-descarga.sh --check

# 2. Ver qué se enviaría, sin tocar la red
scripts/publicar-descarga.sh --dry-run dist/LiquidOS-1.0-amd64.iso

# 3. Publicar de verdad
scripts/publicar-descarga.sh dist/LiquidOS-1.0-amd64.iso \
  --version 1.0 \
  --channel stable \
  --download-url "https://github.com/Sbtias/LiquidOS/releases/download/v1.0/LiquidOS-1.0-amd64.iso"
```

El script:

1. Valida versión, canal y arquitectura.
2. Calcula `size_bytes` y `sha256`.
3. Sube `releases/<canal>/<versión>.json` y `SHA256SUMS`.
4. Desmarca la versión anterior del canal.
5. Inserta o actualiza la fila con `is_current = true`.
6. Imprime la URL de descarga, el manifiesto y el SHA-256.

Opciones útiles:

```text
--notes FICHERO     notas de la versión (máx. 2000 caracteres)
--source TIPO       release | artifact | storage
--run-url URL       página del run de Actions
--upload-iso        sube también la ISO si cabe en el bucket
--skip-storage      solo actualiza la tabla
--dry-run           no hace peticiones de red
--check             prueba la conexión y lista versiones
```

### Desde GitHub Actions

El flujo `.github/workflows/build-iso.yml` incluye el paso
**«Publicar la descarga en Supabase»**. Se ejecuta después de compilar y antes
de subir el artefacto.

Configura en **Settings → Secrets and variables → Actions**:

| Secreto | Obligatorio | Valor |
|---|---|---|
| `SUPABASE_URL` | sí | `https://noeankaxfyqvgtkrulno.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | sí* | clave `service_role` del proyecto |
| `SUPABASE_SECRET_KEY` | alternativa | clave `sb_secret_…` |

\* Basta con una de las dos claves de escritura.

Comportamiento:

- **Push a `main` o ejecución manual** → `source = artifact` y el enlace apunta
  al run de Actions (el artefacto se descarga desde allí).
- **Etiqueta `v*` o release publicada** → `source = release` y el enlace apunta
  al asset de GitHub Releases.
- Si `SUPABASE_URL` no está definido, el paso se omite.
- El paso tiene `continue-on-error: true`: un fallo de Supabase **no invalida**
  la ISO ya construida.
- El resumen del run incluye la versión y el enlace publicado.

Para una release completa:

```bash
git tag -a v1.0 -m "LiquidOS 1.0"
git push origin v1.0
```

El flujo construye la ISO, la adjunta a la release y la registra en Supabase.

---

## 5. Verificar una descarga

```bash
# Descarga la ISO y su suma desde la release
curl -LO https://github.com/Sbtias/LiquidOS/releases/download/v1.0/LiquidOS-1.0-amd64.iso
curl -LO https://github.com/Sbtias/LiquidOS/releases/download/v1.0/LiquidOS-1.0-amd64.iso.sha256

sha256sum -c LiquidOS-1.0-amd64.iso.sha256
```

En Windows:

```powershell
Get-FileHash .\LiquidOS-1.0-amd64.iso -Algorithm SHA256
```

El valor debe coincidir con `sha256` en Supabase y con el manifiesto:

```bash
curl -s https://noeankaxfyqvgtkrulno.supabase.co/rest/v1/liquidos_releases \
  -H "apikey: sb_publishable_Z7xSrzPPt4ECu7kywl_cmg_K-6yrdDT" \
  -H "Accept: application/json"
```

La clave publicable es pública por diseño: solo permite leer las tablas con
política de lectura. **Nunca** publiques la clave `service_role`.

---

## 6. Vista previa

`scripts/preview.mjs` expone `GET /api/downloads`:

- Lee `public.liquidos_releases` con la clave publicable.
- Ordena por `is_current` y fecha, y limita a 20 versiones.
- Cachea la respuesta 60 segundos.
- Devuelve `{ ok, configured, releases[] }` con `downloadUrl`,
  `manifestUrl`, `sha256`, `size`, `source` y `runUrl`.
- Si Supabase no responde, la app muestra el error y el enlace a GitHub
  Releases; no inventa descargas.

Variables opcionales para apuntar a otro proyecto:

```bash
LIQUIDOS_SUPABASE_URL="https://otro.supabase.co" \
LIQUIDOS_SUPABASE_ANON_KEY="sb_publishable_…" \
node scripts/preview.mjs
```

En la app: **Firefox → Descargas**. Cada fila permite descargar, copiar el
SHA-256, abrir el manifiesto y ver el run que la generó.

---

## 7. Mantenimiento

Listar versiones:

```bash
scripts/publicar-descarga.sh --check
```

Marcar manualmente otra versión como actual (SQL en el editor de Supabase):

```sql
update public.liquidos_releases set is_current = false where channel = 'stable';
update public.liquidos_releases set is_current = true
 where channel = 'stable' and version = '1.1';
```

Borrar una versión:

```sql
delete from public.liquidos_releases
 where channel = 'stable' and version = '0.9';
```

Y borra los objetos correspondientes del bucket `liquidos` si ya no se usan.

### Si cambias de plan

1. Sube `file_size_limit` del bucket o del proyecto.
2. Ejecuta el script con `--upload-iso` y `--source storage`.
3. Comprueba que `storage_path` apunta a la ISO y que la URL pública descarga.
4. Mantén igualmente la release de GitHub como espejo: es más rápida y no
   consume la cuota de Supabase.
