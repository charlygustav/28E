#!/usr/bin/env bash
# ==============================================================================
#  28E RADIO — TRANSMISIÓN 24/7 DESDE VPS LINUX (UBUNTU / DEBIAN)
#  Transmite radio-stream.html exactamente como se ve en el navegador:
#  - Video de Yaire en bucle 1080p Full HD
#  - Contador de apertura en vivo
#  - Canciones y noticias dinámicas de Firebase
#  - Audio digital de la radio sin cortes
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "    28E RADIO — TRANSMISIÓN VIVO A YOUTUBE (VPS LINUX)   "
echo "=========================================================="
echo ""

# 1. Comprobar / Instalar dependencias necesarias en Ubuntu/Debian
echo "[1/5] Verificando dependencias del sistema..."
MISSING_PKGS=""
for pkg in ffmpeg xvfb pulseaudio python3 xdotool; do
    if ! dpkg -s "$pkg" >/dev/null 2>&1; then
        MISSING_PKGS="$MISSING_PKGS $pkg"
    fi
done

# Verificar Chromium o Chrome
if ! command -v chromium-browser >/dev/null 2>&1 && ! command -v chromium >/dev/null 2>&1 && ! command -v google-chrome >/dev/null 2>&1; then
    MISSING_PKGS="$MISSING_PKGS chromium-browser"
fi

if [ -n "$MISSING_PKGS" ]; then
    echo "[INFO] Instalando paquetes faltantes:$MISSING_PKGS..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq $MISSING_PKGS
fi

# Detectar binario de Chromium disponible
BROWSER_BIN=""
if command -v google-chrome >/dev/null 2>&1; then
    BROWSER_BIN="google-chrome"
elif command -v chromium-browser >/dev/null 2>&1; then
    BROWSER_BIN="chromium-browser"
elif command -v chromium >/dev/null 2>&1; then
    BROWSER_BIN="chromium"
fi

echo "[INFO] Navegador detectado: $BROWSER_BIN"

# 2. Clave de transmisión de YouTube
STREAM_KEY="${STREAM_KEY:-vxa5-v839-rk66-4p8x-4rg1}"

# Limpiar instancias huérfanas previas
echo "[INFO] Limpiando procesos previos..."
pkill -9 -f 'chromium|chrome|Xvfb' 2>/dev/null || true
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 2>/dev/null || true
rm -rf /tmp/stream_profile 2>/dev/null || true

# Limpieza al salir (Ctrl+C o cierre)
cleanup() {
    echo ""
    echo "[INFO] Deteniendo todos los servicios..."
    kill "$FFMPEG_PID" "$BROWSER_PID" "$XVFB_PID" "$HTTP_PID" 2>/dev/null || true
    pulseaudio --kill 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# 3. Iniciar servidor web local en puerto 5500 si no está activo
if ! lsof -i :5500 >/dev/null 2>&1; then
    echo "[2/5] Iniciando servidor web local (puerto 5500)..."
    python3 -m http.server 5500 --bind 127.0.0.1 >/dev/null 2>&1 &
    HTTP_PID=$!
    sleep 1
else
    echo "[2/5] Servidor web local ya activo en puerto 5500."
fi

# 4. Iniciar PulseAudio y crear sumidero virtual (VirtualSink) para capturar el audio web
echo "[3/5] Configurando sistema de audio virtual (PulseAudio)..."
pulseaudio --start 2>/dev/null || true
sleep 1
pactl load-module module-null-sink sink_name=VirtualSink sink_properties=device.description=VirtualSink >/dev/null 2>&1 || true
pactl set-default-sink VirtualSink 2>/dev/null || true

# 5. Iniciar pantalla virtual Xvfb en :99 a 1920x1080 (30 fps)
echo "[4/5] Creando pantalla virtual 1080p Full HD (Xvfb :99)..."
Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset >/dev/null 2>&1 &
XVFB_PID=$!
sleep 2

# 6. Iniciar Chromium en pantalla completa abriendo radio-stream.html
echo "[5/5] Lanzando radio-stream.html en pantalla virtual 1080p..."
mkdir -p /tmp/stream_profile
PULSE_SINK=VirtualSink DISPLAY=:99 $BROWSER_BIN \
    --kiosk \
    --window-size=1920,1080 \
    --window-position=0,0 \
    --disable-infobars \
    --noerrdialogs \
    --disable-session-crashed-bubble \
    --disable-features=Translate,TranslateUI \
    --disable-translate \
    --disable-dev-shm-usage \
    --js-flags="--max-old-space-size=256" \
    --autoplay-policy=no-user-gesture-required \
    --lang=es \
    --no-sandbox \
    --no-first-run \
    --no-default-browser-check \
    --user-data-dir=/tmp/stream_profile \
    http://127.0.0.1:5500/radio-stream.html >/dev/null 2>&1 &
BROWSER_PID=$!
sleep 6

# Enviar tecla Escape y mover cursor fuera de la pantalla
DISPLAY=:99 xdotool mousemove 1920 1080 key Escape 2>/dev/null || true

echo ""
echo "=========================================================="
echo "  ¡TRANSMISIÓN INICIADA A YOUTUBE EN VIVO 24/7!          "
echo "  Resolución: 1920x1080 (1080p Full HD @ 25fps)          "
echo "  Audio: Digital Directo (192 kbps)                      "
echo "  Presiona Ctrl+C para detener.                          "
echo "=========================================================="
echo ""

# 7. Bucle de transmisión FFmpeg: Captura pantalla virtual y audio de PulseAudio
while true; do
    ffmpeg -thread_queue_size 64 -f x11grab -draw_mouse 0 -video_size 1920x1080 -framerate 25 -i :99.0 \
           -thread_queue_size 64 -f pulse -i VirtualSink.monitor \
           -c:v libx264 -preset ultrafast -tune zerolatency -b:v 2800k -maxrate 3200k -bufsize 6000k -pix_fmt yuv420p -g 50 \
           -c:a aac -b:a 192k -ar 44100 \
           -f flv "rtmp://a.rtmp.youtube.com/live2/$STREAM_KEY" || true

    echo "[ALERTA] Conexión interrumpida. Reconectando en 5 segundos..."
    sleep 5
done
