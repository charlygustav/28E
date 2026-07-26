# 🌹 28E Admin Panel

Bienvenido al núcleo de operaciones del **Proyecto 28E**. Este repositorio contiene el código fuente del panel de administración central, diseñado con una estética moderna ("dark mode" / "glassmorphism"), enfocado en la usabilidad y el monitoreo en tiempo real.

## ✨ Características Principales

*   **🔒 Autenticación Segura:** Acceso restringido utilizando Firebase Authentication (Correo/Contraseña) para garantizar que solo los administradores autorizados puedan entrar.
*   **📊 Dashboard en Tiempo Real:** 
    *   Métricas de tráfico integradas con `counterapi.dev` y Firebase.
    *   Monitorización del estado de servidores externos (GitHub Status) y tiempos de respuesta de APIs.
    *   Gráficos visuales del histórico de tráfico usando **Chart.js**.
*   **🛠 Control de Sistema:**
    *   Activación/Desactivación del **Modo Mantenimiento** del sitio principal en un clic.
    *   Gestor de mensajes personalizados y opciones de derivación de tráfico durante mantenimientos.
*   **🎨 Gestión de Contenido Dinámico:**
    *   **Galería de Arte:** Administración visual de las imágenes mostradas en el sitio principal.
    *   **Textos Principales:** Control sobre el vocabulario y bloques de texto.
    *   **Spotlight Radio:** Gestión de pistas musicales y sonidos globales.
*   **🎙 Control del Canal de Voz:** Monitoreo de usuarios activos y gestión de la contraseña de acceso a las salas de voz.
*   **🎵 Experiencia Inmersiva:** Incluye efectos de sonido (SFX) para interacciones en la UI y música de fondo (BGM) para el administrador, con opciones para silenciarlos.

## 🛠 Tecnologías Utilizadas

*   **Frontend Core:** HTML5, JavaScript (Vanilla ES6+).
*   **Estilos y UI:** [Tailwind CSS](https://tailwindcss.com/) (vía CDN), estética Glassmorphism, animaciones fluidas con [GSAP](https://gsap.com/).
*   **Gráficos:** [Chart.js](https://www.chartjs.org/) para analíticas de tráfico.
*   **Iconos y Tipografías:** [Phosphor Icons](https://phosphoricons.com/), fuentes *SF Pro Display*, *Inter* y *Merriweather*.
*   **Backend & Base de Datos:** [Firebase Realtime Database](https://firebase.google.com/) y Firebase Auth (SDK v12).

## 🚀 Instalación y Uso

Dado que este proyecto está construido enteramente en tecnologías web cliente y utiliza CDN, no requiere un proceso de compilación complejo (build step) para ejecutarse de forma básica.

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/28E-Admin.git
    cd 28E-Admin
    ```

2.  **Configurar Firebase (Opcional si usas los tuyos):**
    El proyecto ya viene preconfigurado con las claves del proyecto `yaire-591ca`. Si deseas utilizar tu propia base de datos, deberás modificar el objeto `firebaseConfig` dentro de `index.html` (y cualquier otro script JS como `test.js`).

3.  **Ejecutar localmente:**
    Puedes abrir directamente el archivo `index.html` en tu navegador, o preferiblemente utilizar una extensión como **Live Server** en VSCode para evitar problemas con CORS en los módulos de Firebase.
    ```bash
    # Si tienes npx instalado, puedes usar:
    npx serve .
    ```

## 📁 Estructura del Proyecto

*   `index.html`: Contiene toda la estructura del panel, scripts de inicialización de Firebase, configuración de Tailwind y lógica de UI.
*   `test.js`: Archivo con lógica extendida de inicialización, manejo de animaciones, sonidos (SFX) y lógica de obtención de analíticas.
*   `admin panel resources/`: Contiene los recursos multimedia (imágenes, efectos de sonido y música) utilizados en la interfaz para dar la experiencia inmersiva.
*   `package.json`: Definición básica del proyecto (actualmente solo rastrea gsap como dependencia base).

## 🤝 Contribución

Si deseas contribuir o realizar mejoras al panel de administración:
1. Haz un fork del repositorio.
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`).
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Sube la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.
