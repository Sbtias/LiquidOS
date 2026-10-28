# ============================================================
# LiquidOS — construir la ISO desde Windows
#
#   .\build\build-windows.ps1                 # versión 1.0
#   .\build\build-windows.ps1 -Version 1.1
#
# Estrategia:
#   1. Si Docker Desktop está disponible, compila en un
#      contenedor Debian 12 (no hace falta WSL).
#   2. Si no, intenta usar una distribución WSL (Debian/Ubuntu)
#      y compila dentro de ella como root.
#   3. Si no hay ninguna de las dos, explica las alternativas.
# ============================================================

[CmdletBinding()]
param(
    [string]$Version = "1.0",
    [string]$Arch = "amd64"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Out = Join-Path $Root "dist"
$IsoName = "LiquidOS-$Version-$Arch.iso"

function Info($msg) { Write-Host "[LiquidOS] $msg" -ForegroundColor Cyan }
function Warn($msg) { Write-Host "[LiquidOS] $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "[LiquidOS] $msg" -ForegroundColor Red; exit 1 }

function Show-FinalMessage {
    param([string]$IsoPath)
    if (Test-Path -LiteralPath $IsoPath) {
        $size = "{0:N0} MB" -f ((Get-Item -LiteralPath $IsoPath).Length / 1MB)
        Info "ISO lista: $IsoPath ($size)"
        Info "Pruébala en VirtualBox/VMware/QEMU como disco óptico."
    } else {
        Warn "La compilación terminó, pero no se encontró $IsoPath."
        Warn "Revisa dist\build.log para ver el error."
    }
}

# ------------------------------------------------------------
# 1. Docker
# ------------------------------------------------------------
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    $dockerOk = $false
    try {
        docker info --format '{{.ServerVersion}}' *> $null
        $dockerOk = $true
    } catch { $dockerOk = $false }

    if ($dockerOk) {
        Info "Docker detectado. Compilando en un contenedor Debian 12…"
        $image = "liquidos-builder:bookworm"

        docker build --platform linux/amd64 -t $image -f (Join-Path $Root "build\Dockerfile") $Root
        if ($LASTEXITCODE -ne 0) { Fail "No se pudo construir la imagen de compilación." }

        New-Item -ItemType Directory -Force -Path $Out | Out-Null

        # Docker Desktop comparte la unidad C: con el contenedor.
        $mount = "$Root`:/src"
        docker run --rm --privileged --platform linux/amd64 `
            -v $mount `
            -e "LIQUIDOS_VERSION=$Version" `
            -e "LIQUIDOS_ARCH=$Arch" `
            -e "HOST_UID=0" `
            $image

        if ($LASTEXITCODE -ne 0) { Fail "La compilación dentro de Docker falló." }

        Show-FinalMessage (Join-Path $Out $IsoName)
        exit 0
    }

    Warn "Docker está instalado pero el motor no responde (¿Docker Desktop cerrado?)."
}

# ------------------------------------------------------------
# 2. WSL
# ------------------------------------------------------------
$wsl = Get-Command wsl -ErrorAction SilentlyContinue
if ($wsl) {
    $distros = @()
    try {
        $raw = (wsl -l -q) 2>$null
        $distros = @($raw | ForEach-Object { ($_ -replace "`0", "").Trim() } | Where-Object { $_ })
    } catch { $distros = @() }

    $candidates = $distros | Where-Object { $_ -match '^(Debian|Ubuntu|Kali|Linux)' }
    if ($candidates.Count -gt 0) {
        $distro = $candidates[0]
        Info "WSL detectado ($distro). Preparando dependencias y compilando…"

        # C:\Users\sebas\... -> /mnt/c/Users/sebas/...
        $posix = $Root -replace '\\', '/'
        if ($posix -match '^([A-Za-z]):') {
            $drive = $Matches[1].ToLower()
            $posix = "/mnt/$drive" + $posix.Substring(2)
        }

        $script = @"
set -e
export DEBIAN_FRONTEND=noninteractive
if ! command -v lb >/dev/null 2>&1; then
  apt-get update
  apt-get install -y --no-install-recommends live-build debootstrap xorriso \
    squashfs-tools zstd mtools dosfstools isolinux syslinux-common syslinux-efi \
    grub-pc-bin grub-efi-amd64-bin grub-common rsync git ca-certificates librsvg2-bin
fi
cd "$posix"
LIQUIDOS_VERSION="$Version" LIQUIDOS_ARCH="$Arch" ./build/build-iso.sh
"@

        wsl -d $distro -u root -- bash -lc $script
        if ($LASTEXITCODE -ne 0) { Fail "La compilación dentro de WSL falló." }

        Show-FinalMessage (Join-Path $Out $IsoName)
        exit 0
    }

    Warn "WSL existe, pero no hay una distribución Debian/Ubuntu instalada."
}

# ------------------------------------------------------------
# 3. Sin entorno Linux: instrucciones
# ------------------------------------------------------------
Warn "No se encontró Docker funcionando ni una distribución WSL compatible."
Write-Host ""
Write-Host "  Opción A — GitHub Actions (recomendada, sin instalar nada):" -ForegroundColor White
Write-Host "    1. Sube este proyecto a un repositorio de GitHub."
Write-Host "    2. Pestaña «Actions» → «Construir ISO» → «Run workflow»."
Write-Host "    3. Al terminar (~40 min), descarga el artefacto «liquidos-1.0-amd64»."
Write-Host ""
Write-Host "  Opción B — Docker Desktop:" -ForegroundColor White
Write-Host "    Instala Docker Desktop, ábrelo y vuelve a ejecutar este script."
Write-Host ""
Write-Host "  Opción C — WSL 2 con Debian:" -ForegroundColor White
Write-Host "    wsl --install -d Debian"
Write-Host "    Después vuelve a ejecutar este script."
Write-Host ""
Write-Host "  En cualquiera de los casos la ISO queda en:" -ForegroundColor White
Write-Host "    $Out\$IsoName"
exit 1
