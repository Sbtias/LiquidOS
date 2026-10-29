# Descargas de LiquidOS

Este documento explica dónde vive cada ISO, cómo se publica y cómo se verifica.
La idea es sencilla: **el binario pesa demasiado para Supabase, así que el
registro y los checksums están en Supabase y la ISO en GitHub Releases.**

---

## 1. Dónde se descarga

| Pieza | Dónde | Por qué |
|---|---|---|
| ISO (`LiquidOS-1.0-amd64.iso`) | [GitHub Releases](https://github.com/Sbtias/LiquidOS/releases) | CDN gratis; si supera 2 GiB se publica en partes |
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
(`file_size_limit = 52428800`) y una ISO Debian con GNOME ronda los 3,3 GB.
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

### 2.1 Límite de 2 GiB y descarga por partes

GitHub Releases acepta como máximo **2 GiB por archivo**. Una ISO Debian con
GNOME, LibreOffice y las apps de LiquidOS ronda los 3–3,5 GB, así que el flujo
la divide automáticamente:

```text
LiquidOS-1.0-amd64.iso.part01   (1,9 GB)
LiquidOS-1.0-amd64.iso.part02   (resto)
LiquidOS-1.0-amd64.iso.sha256
LEEME-descarga.txt
```

- El paso **«Preparar la descarga»** usa `split -b 1900M` cuando el archivo
  supera `2 000 000 000` bytes y genera el `LEEME`.
- La release sube las partes, la suma y el `LEEME`.
- Supabase guarda las URLs en `parts` (array JSON). La vista previa muestra
  un botón «Parte 1», «Parte 2»… y el enlace a la release.
- El SHA-256 es de la ISO completa: únelas antes de comprobarlo.

Si en el futuro la ISO baja de 2 GiB, el flujo vuelve solo al archivo único.

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
| `parts` | `jsonb` | URLs de las partes si la ISO supera 2 GiB (`[]` si es única) |
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

1. Valida versión, canal, arquitectura y URLs.
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
--part URL          URL de una parte (repetible; ISO de más de 2 GiB)
--download-url URL  URL pública del binario o de la página de la release
--upload-iso        sube también la ISO si cabe en el bucket
--skip-storage      solo actualiza la tabla
--dry-run           no hace peticiones de red
--check             prueba la conexión y lista versiones
```

Si la ISO está dividida, `--download-url` suele ser la página de la release y
cada `--part` apunta a su archivo:

```bash
scripts/publicar-descarga.sh dist/LiquidOS-1.0-amd64.iso \
  --version 1.0 \
  --download-url "https://github.com/Sbtias/LiquidOS/releases/tag/v1.0" \
  --part "https://github.com/Sbtias/LiquidOS/releases/download/v1.0/LiquidOS-1.0-amd64.iso.part01" \
  --part "https://github.com/Sbtias/LiquidOS/releases/download/v1.0/LiquidOS-1.0-amd64.iso.part02"
```

Sin `--download-url`, el script enlaza a la release cuando hay partes. Las URLs
deben ser `http(s)`; se validan antes de escribir nada en Supabase.

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
- **Push de una etiqueta `v*`** → el flujo compila, crea o actualiza la release
  y adjunta la ISO (o sus partes). El registro usa `source = release` y las
  URLs de los assets reales; si hay partes, también se guardan en `parts`.
- Si `SUPABASE_URL` no está definido, el paso de Supabase se omite.
- El paso tiene `continue-on-error: true`: un fallo de Supabase **no invalida**
  la ISO ya construida.
- El resumen del run incluye la versión, si se dividió y el enlace publicado.

Para una release completa:

```bash
git tag -a v1.0 -m "LiquidOS 1.0"
git push origin v1.0
```

El flujo detecta la etiqueta, compila con la versión `1.0` (tomada del nombre
de la etiqueta), crea la release, sube la ISO o sus partes y la registra en
Supabase.

---

## 5. Verificar una descarga

### Archivo único

```bash
# Descarga la ISO y su suma desde la release
curl -LO https://github.com/Sbtias/LiquidOS/releases/download/v1.0/LiquidOS-1.0-amd64.iso
curl -LO https://github.com/Sbtias/LiquidOS/releases/download/v1.0/LiquidOS-1.0-amd64.iso.sha256

sha256sum -c LiquidOS-1.0-amd64.iso.sha256
```

### Descarga por partes

Descarga todas las partes y el `.sha256` de la release, únelas **en orden** y
comprueba la suma de la ISO completa:

```bash
# Linux / macOS
cat LiquidOS-1.0-amd64.iso.part* > LiquidOS-1.0-amd64.iso
sha256sum -c LiquidOS-1.0-amd64.iso.sha256
```

```powershell
# Windows PowerShell 5.1+
Get-Content .\LiquidOS-1.0-amd64.iso.part* -AsByteStream |
  Set-Content .\LiquidOS-1.0-amd64.iso -AsByteStream
Get-FileHash .\LiquidOS-1.0-amd64.iso -Algorithm SHA256
```

El orden alfabético de `part01`, `part02`… es el correcto porque el flujo usa
`split -d -a 2 --numeric-suffixes=1`. Compara el resultado con el valor de
`sha256` en Supabase o con el archivo `.sha256`.

### Archivo único (Windows)

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
  `manifestUrl`, `sha256`, `size`, `source`, `runUrl` y `parts`.
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
