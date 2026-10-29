# Compilar y probar LiquidOS

## 1. Requisitos

| Recurso | Mínimo | Recomendado |
|---|---|---|
| Disco libre | 8 GB | 20 GB |
| RAM | 2 GB | 8 GB |
| CPU | 2 núcleos | 4 núcleos |
| Red | obligatoria en la primera compilación | — |

La compilación descarga ~1,5 GB de paquetes Debian y clona tres repositorios de temas.
La ISO final ronda los **2,2–2,8 GB**.

---

## 2. Compilar en la nube (GitHub Actions) — sin Linux local

Ideal si estás en Windows y no tienes Docker ni WSL, o si no quieres
ocupar 15 GB de disco. GitHub compila por ti y te da la ISO como artefacto.

1. Crea un repositorio y sube el proyecto:

   ```bash
   git init
   git add .
   git commit -m "LiquidOS 1.0"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/LiquidOS.git
   git push -u origin main
   ```

2. En GitHub: **Actions → «Construir ISO» → Run workflow**.
   Puedes indicar otra versión (`1.1`, `2.0`…) en el formulario.

3. Al terminar (~40 min), abre la ejecución y descarga el artefacto
   **`liquidos-1.0-amd64`**: contiene la ISO y su SHA-256.

4. Opcional: al publicar una *release* o un tag `v1.0`, la ISO se adjunta
   automáticamente a la release.

5. Opcional: para que la versión aparezca en **Firefox → Descargas** de la
   vista previa, añade los secretos `SUPABASE_URL` y
   `SUPABASE_SERVICE_ROLE_KEY` en **Settings → Secrets and variables →
   Actions**. Sin ellos la ISO se construye igual. Detalles en
   [`DESCARGAS.md`](DESCARGAS.md).

El flujo está en `.github/workflows/build-iso.yml` y usa `ubuntu-24.04`
con `live-build`, `debootstrap`, GRUB BIOS+UEFI y `zstd`.

> El runner gratuito tiene ~14 GB libres; el workflow borra toolchains
> preinstaladas para dejar espacio antes de compilar.

---

## 3. Compilar con Docker (multiplataforma)

```bash
./build/docker-build.sh
```

- Usa `debian:bookworm-slim` y monta el repositorio en `/src`.
- El contenedor se ejecuta con `--privileged` porque `live-build` necesita montajes.
- En Windows: Docker Desktop + Git Bash o WSL. La carpeta debe estar compartida con Docker.
- En Apple Silicon se fuerza `--platform linux/amd64` (emulación; más lento).

Variables útiles:

```bash
LIQUIDOS_VERSION=1.1 ./build/docker-build.sh
LIQUIDOS_ARCH=amd64 ./build/docker-build.sh
```

### Windows sin complicaciones

```powershell
.\build\build-windows.ps1                       # versión 1.0
.\build\build-windows.ps1 -Version 1.1 -Arch amd64
```

El script prueba en este orden:

1. **Docker** funcionando → compila en el contenedor (`build/Dockerfile`).
2. **WSL** con Debian/Ubuntu → instala las dependencias y compila como root.
3. Si no hay ninguno, imprime las instrucciones (incluida la vía de GitHub Actions).

No requiere permisos de administrador de Windows: solo Docker Desktop o
una distro WSL ya instalada.

---

## 4. Compilar en Debian nativo

```bash
sudo apt update
sudo apt install live-build debootstrap xorriso squashfs-tools \
                 grub-pc-bin grub-efi-amd64-bin mtools dosfstools

sudo ./build/build-iso.sh
```

El script:

1. Copia `build/live-build/config` a `build/work/` (nunca ensucia el repo).
2. Sincroniza fondos, logo, app de bienvenida y branding de Calamares.
3. Ejecuta `lb config` con Debian 12, ISO híbrida BIOS+UEFI y squashfs con zstd.
4. Ejecuta `lb build` y publica `dist/LiquidOS-1.0-amd64.iso` + SHA-256.

Salida esperada al final:

```
[LiquidOS] Listo: /…/dist/LiquidOS-1.0-amd64.iso
[LiquidOS] Tamaño: 2,6G
```

---

## 5. Probar en máquina virtual

### QEMU (rápido, recomendado en Linux)

```bash
qemu-system-x86_64 -m 4096 -smp 4 -enable-kvm \
  -cdrom dist/LiquidOS-1.0-amd64.iso -boot d
```

Sin KVM (Windows/macOS): quita `-enable-kvm` y añade `-accel tcg`.

### VirtualBox

1. Nueva VM → Linux → Debian (64-bit).
2. 4 GB de RAM, 2 CPUs, disco de 25 GB.
3. Almacenamiento → unidad óptica → selecciona la ISO.
4. Arranca y elige **LiquidOS 1.0 «Torrente» — Iniciar**.

### VMware / UTM

Crea una VM Debian 12 x64 y monta la ISO como CD. UEFI está incluido en la ISO.

### Lista de comprobación (uso diario)

Con la ISO arrancada, en 5 minutos:

0. Abre una terminal y ejecuta `liquidos verificar`. Debe terminar con **«Todo correcto»**;
   si algo falla, el propio script indica qué.
1. El Dock muestra **Firefox**, **Thunderbird**, Archivos, Terminal, **Centro de software** y Ajustes.
2. Firefox abre con doble clic y `xdg-open https://debian.org` (o un enlace del correo) usa Firefox.
3. Thunderbird abre desde el Dock y responde a `mailto:`.
4. **Centro de software** → busca una app en Flathub e **instálala de verdad**. Debe aparecer en
   el menú y abrirse. La primera vez, espera a que `liquidos-firstboot` añada Flathub; puedes
   comprobarlo con `cat /var/lib/liquidos/firstboot.done` y `cat /var/log/liquidos-firstboot.log`.
   Si no hay red, al menos debe listar las aplicaciones Debian y no quedarse en blanco.
5. Terminal: `liquidos info`, `liquidos doctor`, `sudo apt update`, `neofetch`.
6. **Ajustes → Personalización**: cambia acento, fondo, posición del Dock y transparencia;
   cierra la sesión y comprueba que se mantiene.
7. `liquidos wallpaper /usr/share/backgrounds/liquidos/liquidos-dark.svg` cambia el fondo.

Si algo falla, `liquidos report` deja un informe en `/tmp` con lo necesario para diagnosticar.
La misma comprobación se puede repetir con `liquidos verificar` tras instalar el sistema.

---

## 6. Grabar en USB

> `dd` no perdona: comprueba dos veces el dispositivo con `lsblk`.

```bash
lsblk
sudo dd if=dist/LiquidOS-1.0-amd64.iso of=/dev/sdX bs=8M status=progress oflag=sync
sync
```

En Windows: Rufus (modo DD) o balenaEtcher.

---

## 7. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `lb build` falla en `bootstrap` | mirror inaccesible | `LIQUIDOS_MIRROR=http://ftp.es.debian.org/debian/` |
| ISO arranca sin entorno gráfico | GPU virtual sin KMS | elige «Modo seguro» en el menú de GRUB |
| El tema se ve como Adwaita | sin red durante el build | recompila con red o ejecuta `scripts/install-liquidos-look.sh` |
| Dock ausente | `gnome-shell-extension-dashtodock` no disponible | instálalo a mano o usa el dock de GNOME |
| Pantalla negra tras Plymouth | driver propietario NVIDIA | añade `nomodeset` en GRUB |
| Pide contraseña en live | usuario `user` sin contraseña | usa `sudo -i` (live-config lo permite) |

### Ver los hooks en detalle

```bash
grep -R "LiquidOS" build/work/config/hooks/normal/
```

### Recompilar solo la parte binaria

```bash
cd build/work
sudo lb build --no-auto-clean
```

---

## 8. Iterar el diseño sin recompilar

Usa la demo web mientras ajustas medidas y colores:

```bash
node scripts/preview.mjs
```

Cuando el diseño esté listo, traslada los cambios a:

- `preview/style.css` → colores/medidas equivalentes en `build/live-build/config/includes.chroot/etc/dconf/db/local.d/00-liquidos` (tema, dock, tipografía).
- `assets/wallpapers/*.svg` → se copian solos en la compilación.
- `desktop/apps/liquid-welcome/liquid-welcome.py` → app de bienvenida real.

Para ver cambios de escritorio sin reconstruir la ISO, prueba primero con
`scripts/install-liquidos-look.sh` en un Debian/Ubuntu con GNOME.
