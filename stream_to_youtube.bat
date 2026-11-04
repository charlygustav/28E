@echo off
title 28E Radio - Emision YouTube 24/7
cls
echo ==========================================================
echo       28E RADIO - TRANSMISION EN VIVO A YOUTUBE
echo ==========================================================
echo.

if not exist "%~dp0radio" (
    echo [ERROR] No se encontro la carpeta radio.
    pause
    exit /b 1
)

if not exist "%~dp016-9_1080p.mp4" (
    echo [ERROR] No se encontro el video de fondo 16-9_1080p.mp4.
    pause
    exit /b 1
)

set /p STREAM_KEY=Introduce tu Clave de Emision de YouTube (Stream Key): 
if "%STREAM_KEY%"=="" (
    echo [ERROR] La clave de emision no puede estar vacia.
    pause
    exit /b 1
)

echo.
echo [INFO] Iniciando sincronizador de noticias en segundo plano...
start /b "" node "%~dp0scripts\update_news.js" --loop >nul 2>&1

echo [INFO] Iniciando transmision continua 1080p a YouTube...
echo Servidor RTMP: rtmp://a.rtmp.youtube.com/live2
echo Presiona Ctrl+C para detener la emision.
echo.

:STREAM_LOOP
ffmpeg -re -stream_loop -1 -i "%~dp016-9_1080p.mp4" -stream_loop -1 -f concat -safe 0 -i "%~dp0scripts\radio_playlist.txt" -map 0:v:0 -map 1:a:0 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -c:v libx264 -preset veryfast -b:v 3000k -maxrate 3500k -bufsize 6000k -pix_fmt yuv420p -g 60 -c:a aac -b:a 256k -ar 44100 -f flv "rtmp://a.rtmp.youtube.com/live2/%STREAM_KEY%"

echo.
echo [ALERTA] La conexion se interrumpio. Reconectando en 5 segundos...
timeout /t 5 /nobreak >nul
goto STREAM_LOOP
