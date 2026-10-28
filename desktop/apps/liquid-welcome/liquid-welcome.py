#!/usr/bin/env python3
# ============================================================
# LiquidOS — ventana de bienvenida
# GTK3 + PyGObject. Se muestra una sola vez por usuario
# (salvo que se ejecute con --force).
# ============================================================

import os
import subprocess
import sys

import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gdk, GLib, Gtk, Pango  # noqa: E402

APP_ID = "org.liquidos.Welcome"
VERSION = "1.0 «Torrente»"
MARKER = os.path.join(GLib.get_user_config_dir(), "liquidos-welcome")
LOGO_PNG = "/usr/share/pixmaps/liquidos-logo.png"
LOGO_SVG = "/usr/share/pixmaps/liquidos-logo.svg"

CSS = b"""
window.liquid-window {
    background-image: linear-gradient(155deg, #080c16 0%, #101728 55%, #0b1220 100%);
}
.hero-title {
    font-size: 34px;
    font-weight: 800;
    color: #f4f7ff;
    letter-spacing: -0.5px;
}
.hero-sub {
    font-size: 13px;
    color: #9fb0cf;
}
.eyebrow {
    font-size: 10px;
    font-weight: 700;
    color: #5aa9ff;
    letter-spacing: 2.5px;
}
.card {
    background-color: rgba(255, 255, 255, 0.045);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 14px;
}
.card-title {
    font-size: 12px;
    font-weight: 700;
    color: #dce6fa;
    letter-spacing: 0.3px;
}
.keycap {
    background-color: rgba(255, 255, 255, 0.09);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    padding: 2px 7px;
    font-size: 11px;
    color: #eaf1ff;
}
.hint {
    font-size: 11px;
    color: #7e90b0;
}
button.flat-action {
    padding: 7px 14px;
    border-radius: 9px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background-color: rgba(255, 255, 255, 0.05);
    color: #eaf1ff;
}
button.flat-action:hover {
    background-color: rgba(255, 255, 255, 0.11);
}
button.go {
    padding: 8px 22px;
    border-radius: 9px;
    border: none;
    background-image: linear-gradient(180deg, #6fb6ff, #2f7fe0);
    color: #06101f;
    font-weight: 700;
}
button.go:hover {
    background-image: linear-gradient(180deg, #8ac5ff, #3b8bea);
}
"""

ATAJOS = [
    ("Super", "Actividades y ventanas"),
    ("Ctrl + Espacio", "Buscar en todo el sistema"),
    ("Super + ← / →", "Mover ventana a cada lado"),
    ("Super + Q", "Cerrar la ventana activa"),
    ("Super + M", "Minimizar la ventana activa"),
]


def logo_widget(size=96):
    if os.path.exists(LOGO_PNG):
        img = Gtk.Image.new_from_file(LOGO_PNG)
    elif os.path.exists(LOGO_SVG):
        img = Gtk.Image.new_from_file(LOGO_SVG)
    else:
        img = Gtk.Image.new_from_icon_name("applications-system", Gtk.IconSize.DIALOG)
    img.set_pixel_size(size)
    return img


class Welcome(Gtk.Window):
    def __init__(self):
        super().__init__(title="Bienvenido a LiquidOS")
        self.set_default_size(640, 650)
        self.set_position(Gtk.WindowPosition.CENTER)
        self.set_resizable(False)
        self.get_style_context().add_class("liquid-window")
        self.connect("destroy", self.on_destroy)

        root = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=18)
        root.set_border_width(34)
        self.add(root)

        # ---------- Cabecera ----------
        head = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=6)
        head.set_halign(Gtk.Align.CENTER)

        eyebrow = Gtk.Label(label="L I Q U I D O S")
        eyebrow.get_style_context().add_class("eyebrow")
        head.pack_start(eyebrow, False, False, 0)

        head.pack_start(logo_widget(88), False, False, 6)

        title = Gtk.Label()
        title.set_markup("<span>LiquidOS</span>")
        title.get_style_context().add_class("hero-title")
        head.pack_start(title, False, False, 0)

        sub = Gtk.Label(label=f"Versión {VERSION} · Debian 12 · escritorio GNOME")
        sub.get_style_context().add_class("hero-sub")
        head.pack_start(sub, False, False, 0)

        root.pack_start(head, False, False, 0)

        # ---------- Tarjeta de atajos ----------
        card = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
        card.get_style_context().add_class("card")
        card.set_border_width(18)

        card_title = Gtk.Label(label="Atajos para empezar", xalign=0)
        card_title.get_style_context().add_class("card-title")
        card.pack_start(card_title, False, False, 0)

        grid = Gtk.Grid(column_spacing=16, row_spacing=8)
        for row, (combo, desc) in enumerate(ATAJOS):
            key = Gtk.Label(label=combo, xalign=0)
            key.get_style_context().add_class("keycap")
            key.set_size_request(132, -1)
            txt = Gtk.Label(label=desc, xalign=0)
            txt.set_ellipsize(Pango.EllipsizeMode.END)
            txt.get_style_context().add_class("hint")
            grid.attach(key, 0, row, 1, 1)
            grid.attach(txt, 1, row, 1, 1)
        card.pack_start(grid, False, False, 0)

        root.pack_start(card, False, False, 0)

        # ---------- Acciones ----------
        actions = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        actions.set_margin_top(4)

        btn_apariencia = Gtk.Button(label="Cambiar apariencia")
        btn_apariencia.get_style_context().add_class("flat-action")
        btn_apariencia.connect("clicked", self.abrir_apariencia)

        btn_acerca = Gtk.Button(label="Acerca de")
        btn_acerca.get_style_context().add_class("flat-action")
        btn_acerca.connect("clicked", self.abrir_acerca)

        actions.pack_start(btn_apariencia, False, False, 0)
        actions.pack_start(btn_acerca, False, False, 0)

        # ---------- Botón principal y pie ----------
        go = Gtk.Button(label="Empezar a usar LiquidOS")
        go.get_style_context().add_class("go")
        go.set_size_request(-1, 40)
        go.connect("clicked", lambda *_: self.close())

        footer = Gtk.Label(label="Hecho con software libre · GPL-3.0")
        footer.get_style_context().add_class("hint")
        footer.set_halign(Gtk.Align.CENTER)

        # pack_end: el primero queda más abajo
        root.pack_end(footer, False, False, 0)
        root.pack_end(go, False, False, 0)
        root.pack_end(actions, False, False, 0)

        self.show_all()

    # --------------------------------------------------------
    def abrir_apariencia(self, *_):
        self._lanzar(["gnome-control-center", "background"])

    def abrir_acerca(self, *_):
        dlg = Gtk.AboutDialog(transient_for=self, modal=True)
        dlg.set_program_name("LiquidOS")
        dlg.set_version("1.0 «Torrente»")
        dlg.set_comments(
            "Distribución de Linux basada en Debian con un escritorio "
            "cuidado, fluido y fácil de usar."
        )
        dlg.set_website("https://liquidos.example")
        dlg.set_license_type(Gtk.License.GPL_3_0)
        dlg.set_logo(self._logo_pixbuf())
        dlg.run()
        dlg.destroy()

    def _logo_pixbuf(self):
        ruta = LOGO_PNG if os.path.exists(LOGO_PNG) else LOGO_SVG
        if os.path.exists(ruta):
            try:
                return GdkPixbuf_from_file(ruta, 96)
            except Exception:
                pass
        return None

    @staticmethod
    def _lanzar(cmd):
        try:
            subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except FileNotFoundError:
            pass

    def on_destroy(self, *_):
        try:
            os.makedirs(os.path.dirname(MARKER), exist_ok=True)
            with open(MARKER, "w", encoding="utf-8") as fh:
                fh.write("[General]\nshown=true\n")
        except OSError:
            pass
        Gtk.main_quit()


def GdkPixbuf_from_file(ruta, tam):
    # Importación diferida: GdkPixbuf no está expuesto por gi.require_version
    import gi as _gi

    _gi.require_version("GdkPixbuf", "2.0")
    from gi.repository import GdkPixbuf

    return GdkPixbuf.Pixbuf.new_from_file_at_scale(ruta, tam, tam, True)


def ya_mostrado():
    try:
        with open(MARKER, encoding="utf-8") as fh:
            return "shown=true" in fh.read()
    except OSError:
        return False


def main():
    forzado = "--force" in sys.argv or "-f" in sys.argv
    if ya_mostrado() and not forzado:
        return 0

    proveedor = Gtk.CssProvider()
    proveedor.load_from_data(CSS)
    Gtk.StyleContext.add_provider_for_screen(
        Gdk.Screen.get_default(),
        proveedor,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
    )

    Welcome()
    Gtk.main()
    return 0


if __name__ == "__main__":
    sys.exit(main())
