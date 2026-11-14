# Estado del despliegue de seguridad

La ruta elegida es ahora Firebase Realtime Database para el canal de voz.
Consulta [la guía actual de activación](FIREBASE-VOICE.md) para las reglas,
publicadores de radio/noticias, pruebas reales y configuración TURN pendiente.

El código del servidor Node anterior sigue en `signaling-server/`, pero el
widget y el panel ya no dependen de `voice.yaire.site` para coordinar llamadas.

## Otras correcciones conservadas

- TTS usa POST y sesión Google. Limita el texto a 1000 caracteres y aplica cuotas
  por UID y por instancia, con timeout y sin devolver errores internos del
  proveedor. Las cuotas en memoria no son un presupuesto global de Vercel.
- Se retiraron las claves incrustadas de GitHub, administración de voz y emisión.
  El historial Git no se reescribió: las claves retiradas deben revocarse en sus
  servicios. El emisor necesita `STREAM_KEY` en el entorno.
- El panel escapa texto remoto y valida URLs de imágenes.
- El service worker evita almacenar respuestas de API.
- Electron usa aislamiento de contexto, sandbox y `webSecurity`. El instalador
  aún necesita prueba en Windows antes de distribuirse.

El propietario ya publicó las reglas de transición. Se comprobó HTTP 401 para la lectura anónima de voz y HTTP 200 para datos públicos de radio. La publicación de los archivos web sigue pendiente.
La sesión real con Google y las llamadas entre dos dispositivos siguen pendientes.

La primera fase selecciona reglas de transición que protegen la voz y conservan los permisos públicos existentes en las demás rutas para mantener la radio activa. El cierre completo de esos permisos queda para después de autenticar sus publicadores.
