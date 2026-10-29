# ============================================================
# LiquidOS — Makefile de atajos
#   make preview   → abre la vista previa del escritorio
#   make iso       → construye la ISO con Docker
#   make native    → construye la ISO en Debian (requiere sudo)
#   make look      → aplica el aspecto LiquidOS a un Debian/Ubuntu
#   make publish   → registra una ISO en Supabase (ISO=…)
#   make downloads → comprueba el registro de descargas
#   make clean     → borra artefactos de compilación
# ============================================================

SHELL := /bin/bash
VERSION ?= 1.0

.PHONY: help preview iso native look publish downloads clean

help:
	@echo "LiquidOS — objetivos disponibles:"
	@echo "  make preview   Vista previa web del escritorio"
	@echo "  make iso       Construir la ISO con Docker"
	@echo "  make native    Construir la ISO en un Debian (sudo)"
	@echo "  make look      Aplicar el aspecto en Debian/Ubuntu (sudo)"
	@echo "  make publish   Registrar una ISO en Supabase (ISO=…)"
	@echo "  make downloads Comprobar el registro de descargas"
	@echo "  make clean     Borrar build/work y dist"

preview:
	node scripts/preview.mjs

iso:
	./build/docker-build.sh

native:
	sudo ./build/build-iso.sh

look:
	sudo ./scripts/install-liquidos-look.sh

publish:
	@test -n "$(ISO)" || { echo "Uso: make publish ISO=dist/LiquidOS-$(VERSION)-amd64.iso"; exit 1; }
	./scripts/publicar-descarga.sh "$(ISO)" --version "$(VERSION)"

downloads:
	./scripts/publicar-descarga.sh --check

clean:
	rm -rf build/work dist
