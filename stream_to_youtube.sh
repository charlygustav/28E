#!/usr/bin/env bash
# ==========================================================
#       28E RADIO — TRANSMISIÓN EN VIVO A YOUTUBE (LINUX/AWS)
# ==========================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "      28E RADIO — EMISIÓN YOUTUBE 24/7 (AWS LINUX)"
echo "=========================================================="
echo ""

if [ ! -d "$DIR/radio" ]; then
    echo "[ERROR] No se encontró la carpeta 'radio'."
    exit 1
fi

if [ -z "$STREAM_KEY" ]; then
    read -rp "Introduce tu Clave de Emisión de YouTube (Stream Key): " STREAM_KEY
fi

if [ -z "$STREAM_KEY" ]; then
    echo "[ERROR] La clave de emisión no puede estar vacía."
    exit 1
fi

echo ""
echo "[INFO] Iniciando sincronizador de noticias en segundo plano..."
if command -v node >/dev/null 2>&1; then
    node "$DIR/scripts/update_news.js" --loop >/dev/null 2>&1 &
    NEWS_PID=$!
    echo "[INFO] Sincronizador de noticias activo (PID: $NEWS_PID)"
fi

echo "[INFO] Iniciando transmisión continua 1080p a YouTube..."
echo "Servidor RTMP: rtmp://a.rtmp.youtube.com/live2"
echo "Presiona Ctrl+C para detener."
echo ""

while true; do
    ffmpeg -re -stream_loop -1 -i "$DIR/16-9_1080p.mp4" \
           -stream_loop -1 -f concat -safe 0 -i "$DIR/scripts/radio_playlist.txt" \
           -map 0:v:0 -map 1:a:0 \
           -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p" \
           -c:v libx264 -preset veryfast -b:v 3000k -maxrate 3500k -bufsize 6000k -pix_fmt yuv420p -g 60 \
           -c:a aac -b:a 256k -ar 44100 \
           -f flv "rtmp://a.rtmp.youtube.com/live2/$STREAM_KEY" || true

    echo ""
    echo "[ALERTA] La conexión se interrumpió o reinició. Reconectando en 5 segundos..."
    sleep 5
done

