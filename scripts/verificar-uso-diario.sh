#!/bin/bash
# ============================================================
# LiquidOS — verificación de uso diario dentro de la VM
#
# Dentro de la ISO arrancada (o en el sistema instalado) ejecuta:
#     liquidos verificar
# o directamente:
#     bash /usr/local/bin/liquidos-verificar
# (en el repositorio: bash scripts/verificar-uso-diario.sh)
#
# Comprueba que Firefox, Thunderbird, el Centro de software,
# Flathub y la terminal están realmente operativos. Devuelve 0 si
# todo está bien y 1 si algo falla.
# ============================================================
set -uo pipefail

VERDE=$'\e[32m'; ROJO=$'\e[31m'; AMBAR=$'\e[33m'; AZUL=$'\e[36m'; FIN=$'\e[0m'
fallos=0
avisos=0

ok()    { echo -e "  ${VERDE}✔${FIN} $1"; }
mal()   { echo -e "  ${ROJO}✘${FIN} $1"; fallos=$((fallos + 1)); }
aviso() { echo -e "  ${AMBAR}!${FIN} $1"; avisos=$((avisos + 1)); }

seccion() { echo; echo -e "${AZUL}$1${FIN}"; }

echo -e "${AZUL}LiquidOS · verificación de uso diario${FIN}"
echo "Fecha: $(date -Is)"

# ------------------------------------------------------------
seccion "Sesión y escritorio"
# ------------------------------------------------------------
case "${XDG_CURRENT_DESKTOP:-}" in
    *GNOME*) ok "Sesión GNOME activa (${XDG_CURRENT_DESKTOP})" ;;
    "")      aviso "Sin sesión gráfica: ejecuta esto dentro del escritorio" ;;
    *)       aviso "Escritorio inesperado: ${XDG_CURRENT_DESKTOP}" ;;
esac

command -v gsettings >/dev/null && ok "gsettings disponible" || mal "gsettings no encontrado"

# ------------------------------------------------------------
seccion "Firefox"
# ------------------------------------------------------------
if command -v firefox-esr >/dev/null; then
    ok "Firefox instalado ($(firefox-esr --version 2>/dev/null | head -1))"
else
    mal "firefox-esr no está instalado"
fi

if [ -x /usr/local/bin/firefox ]; then
    ok "Comando «firefox» disponible"
else
    mal "Falta el comando /usr/local/bin/firefox"
fi

navegador=$(update-alternatives --query x-www-browser 2>/dev/null | awk -F': ' '/^Value:/{print $2}')
if [ "$navegador" = "/usr/bin/firefox-esr" ]; then
    ok "Navegador predeterminado del sistema: Firefox"
else
    mal "Navegador predeterminado inesperado: ${navegador:-ninguno}"
fi

if grep -qs '^text/html=firefox-esr.desktop' /etc/xdg/mimeapps.list; then
    ok "Las páginas web se abren con Firefox"
else
    mal "text/html no apunta a Firefox en /etc/xdg/mimeapps.list"
fi

# ------------------------------------------------------------
seccion "Correo"
# ------------------------------------------------------------
if command -v thunderbird >/dev/null; then
    ok "Thunderbird instalado"
else
    mal "Thunderbird no está instalado"
fi

if grep -qs '^x-scheme-handler/mailto=thunderbird.desktop' /etc/xdg/mimeapps.list; then
    ok "Los enlaces mailto se abren con Thunderbird"
else
    mal "mailto no apunta a Thunderbird"
fi

# ------------------------------------------------------------
seccion "Centro de software y Flathub"
# ------------------------------------------------------------
command -v gnome-software >/dev/null && ok "GNOME Software instalado" || mal "GNOME Software no encontrado"
command -v flatpak >/dev/null && ok "Flatpak instalado" || mal "Flatpak no encontrado"
if command -v pkcon >/dev/null || [ -x /usr/lib/packagekit/packagekitd ] || [ -x /usr/libexec/packagekitd ]; then
    ok "PackageKit instalado"
else
    mal "PackageKit no encontrado"
fi

if command -v flatpak >/dev/null && flatpak remotes --columns=name 2>/dev/null | grep -qx flathub; then
    ok "Remoto Flathub configurado"
else
    mal "Flathub no está configurado"
fi

if [ -f /var/lib/liquidos/firstboot.done ]; then
    ok "Primer arranque completado ($(cat /var/lib/liquidos/firstboot.done))"
else
    aviso "El primer arranque aún no ha terminado; se reintenta al reiniciar"
fi

if [ -r /var/log/liquidos-firstboot.log ]; then
    if grep -q "Primer arranque completado" /var/log/liquidos-firstboot.log; then
        ok "Registro del primer arranque correcto"
    else
        aviso "Revisa /var/log/liquidos-firstboot.log"
    fi
fi

if [ -f /etc/polkit-1/rules.d/49-liquidos-live.rules ]; then
    ok "Permisos de instalación de la sesión live presentes"
else
    aviso "Sin regla de polkit para la sesión live (pedirá contraseña)"
fi

# Comprobación real de instalación: descarga el catálogo de Flathub.
if command -v flatpak >/dev/null && command -v curl >/dev/null; then
    if curl -fsSL --max-time 12 -o /dev/null https://dl.flathub.org/repo/summary; then
        ok "Flathub responde por red"
    else
        mal "No se pudo contactar con Flathub"
    fi
fi

# ------------------------------------------------------------
seccion "Terminal y utilidades"
# ------------------------------------------------------------
[ -x /usr/local/bin/liquidos ] && ok "Comando «liquidos» instalado" || mal "Falta el comando liquidos"
[ -x /usr/local/bin/liquidos-report ] && ok "Comando «liquidos-report» instalado" || aviso "Falta liquidos-report"
command -v zsh >/dev/null && ok "zsh instalado" || aviso "zsh no encontrado"
command -v gnome-terminal >/dev/null && ok "Terminal de GNOME instalada" || mal "gnome-terminal no encontrado"

# ------------------------------------------------------------
seccion "Red"
# ------------------------------------------------------------
if getent hosts dl.flathub.org >/dev/null 2>&1; then
    ok "Resolución DNS correcta"
else
    mal "No se resuelve dl.flathub.org"
fi

if ping -c1 -W2 1.1.1.1 >/dev/null 2>&1; then
    ok "Conexión a Internet"
else
    aviso "Sin ping (puede estar bloqueado); prueba con curl"
fi

# ------------------------------------------------------------
echo
if [ "$fallos" -eq 0 ]; then
    echo -e "${VERDE}Todo correcto${FIN} · ${avisos} aviso(s)"
    echo "Abre Firefox, busca una web y prueba a instalar algo desde el Centro de software."
    exit 0
else
    echo -e "${ROJO}$fallos comprobación(es) fallida(s)${FIN} · ${avisos} aviso(s)"
    echo "Genera un informe con: liquidos report"
    exit 1
fi
