# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Destinataria principal:** Yaire Lisbeth, pareja del creador, accediendo principalmente desde dispositivos móviles (iOS y Android) y ocasionalmente desde navegador web de escritorio.
- **Creador y Administrador:** Charles Gustav, quien diseña, programa y mantiene la infraestructura, la selección musical, los recuerdos, las experiencias interactivas y la configuración en la nube.

## Product Purpose
Proporcionar una cápsula del tiempo digital íntima, interactiva y conmemorativa para celebrar y preservar su historia de amor ("28E", oficialmente desbloqueada el 28 de Abril de 2026). El éxito significa transmitir emoción, complicidad, asombro visual y cercanía mediante una experiencia técnica impecable y fluida.

## Positioning
Una bóveda digital hiper-personalizada que fusiona ingeniería web de alto rendimiento (Web Audio API de latencia cero, WebRTC P2P para llamadas de voz privadas, Three.js 3D en tiempo real, minijuegos arcade y métricas sentimentales) con un lenguaje visual editorial OLED Monolith. No es una tarjeta digital ni un álbum de fotos estándar: es un universo interactivo completo creado a medida.

## Operating Context
- **Entorno de uso predominante:** Conexiones móviles cotidianas, momentos íntimos de navegación, escuchando música en la radio integrada o usando los canales de voz en tiempo real.
- **Restricciones de uso:** Debe funcionar con fluidez absoluta (60 FPS) en teléfonos móviles de cualquier gama, bajo condiciones de red variable, y respetar políticas estrictas de reproducción de audio móvil (evitando bloqueos de autoplay de WebKit/Blink).

## Capabilities and Constraints
- **Capacidades confirmadas:**
  - Bóveda Bento Grid OLED con microinteracciones GSAP 3 y ScrollTrigger.
  - Reproductor Hi-Fi personalizado con listas de canciones dinámicas ([radio/](radio/)) y efectos sonoros hápticos de interfaz ([sounds/](sounds/)).
  - Canales de voz WebRTC en tiempo real conectándose a `voice.yaire.site`.
  - Minijuegos interactivos (Atrapa Girasoles 2D, Vuelo Hacia Ti, Cartas Ocultas, Adivinanza Musical).
  - Experiencia 3D inmersiva en Three.js con joystick táctil y recolección de tulipanes ([jardin_de_yaire.html](jardin_de_yaire.html)).
  - Sincronización en tiempo real vía Firebase para estados dinámicos y pantalla de mantenimiento.
  - Soporte multi-idioma nativo (ES, EN, FR, PT, DE).
- **Restricciones técnicas:**
  - 100% Vanilla JavaScript y Tailwind CSS compilado; sin frameworks pesados (React/Vue) para garantizar máximo rendimiento y cero overhead.
  - Alojamiento y despliegue continuo en Vercel con reglas de proxy para APIs y WebRTC.
  - Estricta estética OLED: `#000000` puro, bordes sutiles de 1px `rgba(255,255,255,0.05)`, tipografía `Inter` + `Merriweather`, acentos en zinc, ámbar (`brand-500`) y rosa tulipán (`tulip-500`).

## Brand Commitments
- **Identidad:** "28E" / "Para Yaire 🌷" / "El jardín de Yaire".
- **Voz y Tono:** Íntimo, afectuoso, poético, elegante y auténtico. Cero clichés corporativos o lenguaje genérico.
- **Símbolos y referencias clave:** El tulipán 🌷, el girasol 🌻, el color rosa tulipán y la fecha conmemorativa 28 de Abril.

## Evidence on Hand
- Archivos reales de chats de WhatsApp y estadísticas analizadas ([Chat de WhatsApp con mi novia linda 💗.txt](Chat%20de%20WhatsApp%20con%20mi%20novia%20linda%20💗.txt), [chat_stats.txt](chat_stats.txt)).
- Galería fotográfica personal y recuerdos ([gallery/](gallery/), [lasfotos/](lasfotos/)).
- Canciones seleccionadas con metadatos reales y carátulas personalizadas ([radio/](radio/), [config.json](config.json)).
- Efectos de sonido de interfaz propios ([sounds/](sounds/)).

## Product Principles
1. **Emoción a través del detalle:** Cada animación, sonido y transición debe sentirse intencional, cálido y personal.
2. **Rendimiento implacable (60 FPS):** Cero lag, sin saltos de layout (CLS), optimización de memoria y aceleración por hardware en todo dispositivo.
3. **Privacidad e intimidad absoluta:** La experiencia pertenece exclusivamente a Yaire y Charles.
4. **Resiliencia y robustez:** Si una API o red falla (CDN, audio o WebRTC), la interfaz debe degradar elegantemente sin interrumpir la experiencia.

## Accessibility & Inclusion
- Contraste visual legible sobre fondos negros puros.
- Controles táctiles generosos y joystick virtual con target táctil adecuado en móviles.
- Soporte para `prefers-reduced-motion` reduciendo o desactivando efectos pesados para comodidad visual.
