<div align="center">
  <h1>🌷 28E </h1>
  <p><strong>Una experiencia web de alto rendimiento construida con Vanilla JS, GSAP y TailwindCSS.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Estado-En_mantenimiento-orange.svg" alt="Estado" />
    <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E.svg" alt="Vanilla JS" />
    <img src="https://img.shields.io/badge/CSS-Tailwind-38B2AC.svg" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Animaciones-GSAP_3-88CE02.svg" alt="GSAP" />
  </p>
</div>

---

## 📖 Resumen

**28E** es una aplicación web hecha a medida y altamente optimizada, diseñada originalmente como una bóveda digital con candado de tiempo. Concebida con un lenguaje de diseño minimalista **OLED-black** estricto, utiliza un diseño modular "Bento Grid" para presentar el contenido de forma elegante.

El proyecto fue creado como una sorpresa especial que se desbloqueó oficialmente el **28 de Abril de 2026**, permitiendo acceso a sus experiencias. El código actual programa una reapertura para el 21 de noviembre de 2026, a las 00:00 de Venezuela.

## ✨ Características Principales

*   🔧 **Estado de Acceso**: El mantenimiento se controla en el cliente y en la configuración de Firebase. No es un mecanismo criptográfico de acceso.
*   🌑 **Estética "Monolith" OLED-Black**: Fondos `#000000` puros con tarjetas `.bento-surface` color carbón. Se eliminó todo rastro de "glassmorphism" para asegurar el máximo contraste, negros profundos y una sensación premium editorial.
*   🚀 **Interfaz Acelerada por Hardware**: El uso de `contain` y `translateZ(0)` en CSS, junto con una gestión agresiva del DOM, busca mantener una experiencia fluida; el rendimiento y la memoria deben medirse en los dispositivos objetivo.
*   🎵 **Motor de Audio Web Zero-Lag**: Una implementación completamente personalizada usando `AudioContext` maneja la música de fondo (`radio/`) y los efectos de sonido de la interfaz (`sounds/`) sin bloquear el hilo principal de ejecución.
*   🌍 **Motor i18n Dinámico**: Un diccionario de traducción sin dependencias integrado que soporta Inglés, Español, Francés, Portugués y Alemán, intercambiable al instante.
*   📱 **Navegación Táctil (Swipes) Personalizada**: Un sistema de eventos táctiles diseñado desde cero maneja los gestos en dispositivos móviles, evitando el peso de librerías externas.
*   🎮 **Micro-interacciones Integradas**: Incluye minijuegos (Juego de Memoria), lienzos interactivos de partículas y visualizaciones de datos fluidas con Chart.js.

## 🎬 28E Entertainment

**28E Entertainment** es la división de juegos y contenido interactivo responsable de todo el universo de experiencias de la plataforma:
* 🕹️ **Yaire's Gaming Hub:** Todos los juegos y experiencias lúdicas, destacando el juego 3D *Donde crecen las flores*.
* 📊 **28E Wrapped:** La experiencia interactiva de recuerdos y estadísticas.
* 📺 **28E TV:** La señal de televisión y contenidos audiovisuales 24/7.


## 🛠️ Stack Tecnológico

*   **Lógica**: 100% Vanilla JavaScript (Sin el peso extra de React, Vue o Angular).
*   **Estilos**: Tailwind CSS (vía CDN) + Clases utilitarias personalizadas.
*   **Tipografía**: `Inter` (Interfaz) y `Merriweather` (Display).
*   **Animaciones**: GSAP 3 y ScrollTrigger para revelados de diseño y efectos de cascada enlazados al scroll.
*   **Visualización de Datos**: Chart.js para estadísticas interactivas.

## 📁 Estructura del Proyecto

```text
/
├── index.html           # Aplicación Principal (Más de 15k líneas de JS/HTML/CSS optimizado)
├── mantenimiento.html   # Interfaz de reserva / cuenta regresiva (histórica)
├── radio/               # Pistas de música en alta fidelidad
├── sounds/              # Efectos de sonido de la interfaz (clics, hovers, éxito)
└── tulip.ico            # Favicon de la marca
```

## 🚀 Desarrollo Local

Para correr este proyecto localmente:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/charlygustav/yaire.git
   ```
2. Inicia cualquier servidor web local en el directorio (ej. Live Server, `http.server` de Python, o `http-server` de Node).
3. Abre `index.html` en tu navegador. 

## 🎨 Filosofía de Diseño

La interfaz sigue estrictamente las directrices del diseño **Monolith de Megara Studio**:
- Cero sombras difusas.
- Bordes ultra delgados de 1px `rgba(255,255,255,0.05)`.
- Los estados de "hover" se controlan mediante escalas elásticas de GSAP en lugar de cambios de color.
- La paleta de colores se restringe estrictamente a grises zinc, `brand-500` (Ámbar/Naranja) y `tulip-500` (Rosa).

---
*Diseñado y codificado por Charles Gustav.*


## Seguridad y validación

El canal y su administración usan Firebase Realtime Database con reglas de acceso y sesiones de Google. Consulta [la guía de despliegue](docs/SECURITY-DEPLOYMENT.md) para configurar permisos, aplicar las reglas de Firebase y migrar el emisor de radio.

Instala las dependencias de `signaling-server/` y ejecuta `npm run test:security` desde la raíz para las pruebas de seguridad.

La migración del canal está documentada en [Activar voz con Firebase](docs/FIREBASE-VOICE.md). Las reglas y el código aún requieren publicación y prueba real entre dos dispositivos.
