; =========================================================================
; 28E - Donde crecen las flores (Custom NSIS Themed Installer)
; =========================================================================

!define MUI_WELCOMEPAGE_TITLE "Bienvenido a la instalación de$\r$\n28E: Donde crecen las flores"
!define MUI_WELCOMEPAGE_TEXT "Este asistente te guiará en la instalación de 28E - Donde crecen las flores en tu computadora.$\r$\n$\r$\nPrepárate para recorrer el jardín, descubrir recuerdos y sumergirte en la historia.$\r$\n$\r$\nHaz clic en Siguiente para continuar."

!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customUnWelcomePage
  !define MUI_UNWELCOMEPAGE_TITLE "Desinstalar 28E: Donde crecen las flores"
  !define MUI_UNWELCOMEPAGE_TEXT "Este asistente desinstalará 28E - Donde crecen las flores de tu sistema.$\r$\n$\r$\nHaz clic en Siguiente para continuar con la desinstalación."
  !insertmacro MUI_UNPAGE_WELCOME
!macroend

!define MUI_DIRECTORYPAGE_TEXT_TOP "El asistente instalará 28E - Donde crecen las flores en la siguiente carpeta. Para instalar en una carpeta diferente, haz clic en Examinar y selecciona otra ubicación."
!define MUI_DIRECTORYPAGE_TEXT_DESTINATION "Carpeta de instalación:"

!define MUI_FINISHPAGE_TITLE "¡El jardín está listo!"
!define MUI_FINISHPAGE_TEXT "28E - Donde crecen las flores se ha instalado con éxito en tu computadora.$\r$\n$\r$\nSe han generado accesos directos en el Escritorio y en el Menú Inicio.$\r$\n$\r$\nHaz clic en Finalizar para cerrar el instalador."
!define MUI_FINISHPAGE_RUN_TEXT "Iniciar 28E - Donde crecen las flores ahora"
