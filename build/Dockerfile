# ============================================================
# Imagen de compilación de LiquidOS
# Debian 12 con live-build y todo lo necesario para generar
# una ISO híbrida (BIOS + UEFI).
# ============================================================
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

RUN apt-get update && apt-get install -y --no-install-recommends \
        live-build \
        debootstrap \
        xorriso \
        squashfs-tools \
        mtools \
        dosfstools \
        grub-pc-bin \
        grub-efi-amd64-bin \
        grub-common \
        isolinux \
        syslinux-common \
        syslinux-efi \
        rsync \
        git \
        ca-certificates \
        curl \
        file \
        python3-minimal \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

CMD ["bash", "build/build-iso.sh"]
