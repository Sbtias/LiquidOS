# ============================================================
# LiquidOS — Makefile de atajos
#   make preview   → abre la vista previa del escritorio
#   make iso       → construye la ISO con Docker
#   make native    → construye la ISO en Debian (requiere sudo)
#   make look      → aplica el aspecto LiquidOS a un Debian/Ubuntu
#   make clean     → borra artefactos de compilación
# ============================================================

SHELL := /bin/bash
VERSION ?= 1.0

.PHONY: help preview iso native look clean

help:
	@echo "LiquidOS — objetivos disponibles:"
	@echo "  make preview   Vista previa web del escritorio"
	@echo "  make iso       Construir la ISO con Docker"
	@echo "  make native    Construir la ISO en un Debian (sudo)"
	@echo "  make look      Aplicar el aspecto en Debian/Ubuntu (sudo)"
	@echo "  make clean     Borrar build/work y dist"

preview:
	node scripts/preview.mjs

iso:
	./build/docker-build.sh

native:
	sudo ./build/build-iso.sh

look:
	sudo ./scripts/install-liquidos-look.sh

clean:
	rm -rf build/work dist
