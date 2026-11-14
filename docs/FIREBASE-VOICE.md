# Activar el canal de voz con Firebase

## Qué está preparado

La web usa Realtime Database para participantes, señalización WebRTC, chat,
estados y música compartida. El panel recibe los cambios por suscripción y puede
expulsar sesiones. El canal ya no necesita un proceso Socket.IO alojado aparte.
El audio sigue viajando por WebRTC, directamente o a través de TURN.

Se conservan las cuentas Google del proyecto `yaire-591ca`. Las reglas permiten
entrar a cuentas Google autenticadas del proyecto; no son una lista exclusiva de
dos personas. La cuenta propietaria actual del panel conserva la moderación.

El servidor Node anterior se conserva como código de referencia y sus pruebas
siguen disponibles, pero el widget ya no lo utiliza.

## 1. Primera fase: proteger la voz y conservar la radio activa

El propietario confirmó que la radio emite en YouTube 24/7 y que las noticias
pueden estar actualizándose automáticamente. La primera activación usa por eso
`firebase/database.voice-transition.rules.json`, seleccionado en `firebase.json`.

Estas reglas quitan el permiso de la raíz y protegen `voiceRooms`. Las demás
rutas conservan temporalmente el acceso público que ya tenían. Así los
publicadores actuales de radio y noticias siguen pudiendo leer y escribir sus
rutas. Esto no completa la protección del resto de la base: sus permisos
públicos siguen pendientes de retirar.

La raíz completa ya no se puede descargar de una vez, porque eso expondría la
voz privada. Las consultas por rutas existentes de radio, noticias y
configuración siguen permitidas.

Para esta fase no actualizar ni reiniciar el emisor, sus claves de YouTube ni los
scripts de noticias. Los cambios locales de `radio-stream.html`,
`scripts/update_news.js`, `scripts/sync_live_news.py`,
`scripts/firebase-publisher.js` y `stream_vps.sh` pertenecen a la segunda fase y
no deben publicarse en el equipo que emite todavía.

## 2. Publicar las reglas de transición

En Firebase Console → `yaire-591ca` → Realtime Database → Reglas:

1. Conservar una copia local de las reglas actuales para referencia.
2. Sustituir el contenido completo por
   `firebase/database.voice-transition.rules.json`.
3. Revisar la cuenta propietaria del panel y publicar.

No pegar el fragmento `firebase/voice.rules.json` debajo de una raíz pública:
el permiso de la raíz se hereda y anularía la privacidad del canal.

Alternativa con Firebase CLI autenticado, desde la raíz:
`firebase deploy --only database --project yaire-591ca`.
El destino configurado actualmente son las reglas de transición. La operación
cambia permisos; no reemplaza los datos ni reinicia YouTube.

Las reglas definitivas `firebase/database.rules.json` se aplicarán en una segunda
fase, una vez autenticados el emisor y los publicadores. No publicar ese archivo
en esta primera fase.

El propietario publicó las reglas de transición el 14 de noviembre de 2026.
Se verificó que la lectura anónima de `voiceRooms/principal/members` devuelve
HTTP 401 y la lectura pública del título de radio devuelve HTTP 200.
La web publicada aún utiliza el cliente anterior; falta publicar esta migración.

## 3. Desplegar la web y probar con dos dispositivos

Publicar el cliente de voz (`index.html`, `assets/js/firebase-db.js`,
`assets/js/voice-channel-widget.js`, `assets/js/firebase-voice-transport.js`), el
panel (`admin/index.html` y `assets/js/safe-html.js`) y sus funciones web
(`api/voice-ice.js`, `api/music-search.js`, `signaling-server/auth.js`,
`package.json`, `package-lock.json`) en el alojamiento existente. Conservar las
exclusiones del emisor y noticias indicadas arriba. No hace falta crear un proyecto nuevo ni activar Blaze para usar
Realtime Database y Google Auth dentro de Spark.

Pruebas reales pendientes:

1. Entrar con Google desde dos dispositivos y unirse al canal.
2. Comprobar voz, silencio, chat y una canción de Spotlight o YouTube.
3. Salir de uno de los dispositivos y verificar que desaparezca de la lista.
4. Interrumpir y recuperar la red; verificar la nueva sesión y el audio.
5. Abrir el panel con la cuenta propietaria y expulsar una sesión.
6. Repetir entre Wi-Fi y datos móviles.

Las pruebas de emulador no verifican micrófonos, reproducción del navegador ni
conectividad real de WebRTC.

## 4. TURN sigue pendiente

Se retiraron la IP y las credenciales TURN antiguas del widget. Con STUN se puede
probar una conexión directa, pero algunas redes requieren un retransmisor TURN.

`GET /api/voice-ice` requiere una sesión Google y puede emitir credenciales TURN
temporales de una hora para un servidor compatible con coturn REST. Configurar
en el alojamiento de las funciones:

- `TURN_URLS`: URLs `turn:` / `turns:` separadas por comas.
- `TURN_SHARED_SECRET`: secreto compartido del retransmisor; solo en el servidor.

El endpoint no crea un servicio TURN ni incluye transferencia gratuita. Todavía
hay que seleccionar y configurar ese servicio. Proveedores con una API distinta
necesitan su adaptador correspondiente. Sin configurar TURN el endpoint responde
503 y el cliente intenta WebRTC directo.

## Música y límites de almacenamiento

La música de Spotlight y YouTube se reproduce desde sus fuentes originales.
Las URLs de Spotify se resuelven usando `POST /api/music-search`, una función web
opcional autenticada; sus límites son independientes de las cuotas de Firebase.
No se guardan audios ni vídeos en Realtime Database.

- Máximo cuatro sesiones simultáneas en el canal.
- Historial con 100 posiciones reutilizables; se muestran las 50 más recientes.
- Buzón de señalización con 128 posiciones por sesión, confirmadas y borradas al
  recibirlas; se rechazan posiciones adicionales mediante reglas.
- Cola de música de hasta 100 canciones.
- La desconexión elimina presencia, eventos y el buzón de la sesión en Firebase.

## Comprobaciones reproducibles

Con Node 20+ y Java 21 disponibles:

```
npm ci --prefix firebase
npm run test:firebase
```

Estas pruebas usan exclusivamente el proyecto de demostración `demo-28e` en el
emulador local, sin credenciales ni datos de producción. Incluyen autenticación,
autoría, cupo concurrente, chat, señalización, música, expulsión y reconexión.

Las comprobaciones de API y del servidor anterior se ejecutan con
`npm run test:security`, tras instalar dependencias de `signaling-server/`.

Las cuotas reales se revisan en Firebase Console → Realtime Database → Uso.
La estimación de consumo hecha en la conversación no sustituye esa medición.

## Segunda fase: cerrar la escritura pública restante

Cuando la voz esté funcionando, autenticar los publicadores actuales antes de
seleccionar las reglas definitivas:

- Para el emisor con navegador, actualizar `radio-stream.html` y abrirlo con
  `?publisher=1`, iniciando sesión con la cuenta propietaria.
- Si se ejecutan los scripts de noticias, actualizar sus versiones y
  `scripts/firebase-publisher.js`. Necesitan Node y Firebase Admin, con
  `GOOGLE_APPLICATION_CREDENTIALS` apuntando a un archivo de servicio guardado
  únicamente en el host, o `FIREBASE_SERVICE_ACCOUNT_JSON` en el entorno.
- Si se actualiza `stream_vps.sh`, proporcionar la clave de emisión mediante
  `STREAM_KEY` en el entorno antes de reiniciar.
- Confirmar que radio y noticias se actualizan con autenticación; después cambiar
  el destino en `firebase.json` a `firebase/database.rules.json` y publicar esas
  reglas.

Las credenciales privadas nunca deben copiarse al chat ni a archivos del frontend.
