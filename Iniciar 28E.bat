@echo off
title 28E Originals - Donde Crecen las Flores
echo Iniciando 28E con audio y animacion automatica sincronizada...
start "" "chrome.exe" --user-data-dir="%TEMP%\chrome_28e_profile" --autoplay-policy=no-user-gesture-required "%~dp0dclf.html" 2>nul || start "" "msedge.exe" --user-data-dir="%TEMP%\chrome_28e_profile" --autoplay-policy=no-user-gesture-required "%~dp0dclf.html"
exit

