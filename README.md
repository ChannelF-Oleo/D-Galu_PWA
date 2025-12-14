
# 💇‍♀️ D'Galú - Salón & Spa PWA


Una **Progressive Web App (PWA)** moderna y elegante desarrollada para la gestión y promoción de servicios de belleza, spa y academia. Este proyecto combina una interfaz de usuario sofisticada con **Glassmorphism** y una arquitectura robusta basada en la nube.

[![React](https://img.shields.io/badge/React-v19.0.0-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v7.0.0-purple)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v12.0.0-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-CX34)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## 🚀 Características Principales

* **Experiencia PWA:** Instalable en dispositivos móviles y de escritorio, con caché optimizado para rendimiento offline (via `vite-plugin-pwa`).
* **Diseño UI/UX Premium:** Implementación de estilos modernos utilizando **Tailwind CSS** y efectos de **Glassmorphism** para una estética limpia y lujosa.
* **Autenticación Segura:** Sistema de Login y gestión de sesiones persistentes utilizando **Firebase Authentication**.
* **Dashboard Administrativo:** Panel protegido (`/admin`) para la gestión de citas y métricas del negocio.
* **Navegación Dinámica:** Enrutamiento fluido con `react-router-dom` v7.
* **Gestión de Formularios:** Validaciones robustas implementadas con `react-hook-form` y esquemas `zod`.

## 🛠 Tech Stack

### Frontend
* **Core:** React 19 + Vite.
* **Estilos:** Tailwind CSS, PostCSS, Diseño Responsivo (Mobile-First).
* **Iconos:** Lucide React & Iconify.
* **Componentes:** Swiper (Carruseles), React Hot Toast (Notificaciones).

### Backend & Servicios (Serverless)
* **Plataforma:** Firebase (Google Cloud Platform).
* **Auth:** Firebase Authentication.
* **Base de Datos:** Firestore (Configurado para escalabilidad NoSQL).
* **Storage:** Firebase Storage (Gestión de imágenes).

## 📦 Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/d-galu-pwa.git](https://github.com/tu-usuario/d-galu-pwa.git)
    cd d-galu-pwa
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o si usas yarn
    yarn install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y agrega tus credenciales de Firebase:

    ```env
    VITE_FIREBASE_API_KEY=tu_api_key
    VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
    VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
    VITE_FIREBASE_APP_ID=tu_app_id
    VITE_PAYPAL_CLIENT_ID=tu_paypal_client_id
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

5.  **Build para producción:**
    ```bash
    npm run build
    ```

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura modular y escalable:

```text
src/
├── assets/         # Imágenes, iconos estáticos y logos
├── components/     # Componentes reutilizables (Navbar, Footer, ProtectedRoute)
├── config/         # Configuración de servicios externos (Firebase)
├── context/        # Gestión de estado global (AuthContext)
├── pages/          # Vistas principales (Home, Login, AdminDashboard, etc.)
│   ├── Academy/    # Sección de cursos
│   ├── Products/   # Sección de productos
│   └── Services/   # Sección de servicios
├── styles/         # Archivos CSS globales y específicos
└── utils/          # Utilidades, constantes de colores e iconos
````

## 🚧 Roadmap

  * [x] Configuración inicial y Autenticación.
  * [x] Diseño de Home y Navegación.
  * [ ] Integración completa de Firestore para Citas (Booking).
  * [ ] CRUD de Productos y Servicios en el Dashboard.
  * [ ] Pasarela de pagos con PayPal.
  * [ ] Blog y sección de Academia.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir lo que te gustaría cambiar.

-----

Desarrollado con ❤️ por [ChannelF\_Oleo](https://www.google.com/search?q=https://github.com/channelf-oleo)

```

