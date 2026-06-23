# PETSHOP - Sistema de Gestión Empresarial

Este repositorio contiene el **PETSHOP**, un sistema completo de gestión empresarial desarrollado con React y Vite.

Qué incluye:
- **Sistema de Gestión Empresarial** con interfaz moderna y profesional
- `package.json`, `vite.config.js` para ejecutar la app con Vite.
- `src/` con componentes y páginas principales: Login, Dashboard, Clientes, Inventario, Usuarios.
- Diseño premium con animaciones avanzadas y experiencia de usuario excepcional
- Integración completa con Supabase para base de datos y autenticación

Pasos para probar localmente (PowerShell en Windows):

```powershell
npm install
npm run dev
```

Notas:
- Las imágenes (`logo_perro.png`, `user_icon.png`) están actualmente en la raíz del proyecto. Para que Vite las sirva de forma estática se recomienda moverlas a una carpeta `public/` (por ejemplo `public/logo_perro.png`). Si prefieres dejarlas en la raíz, en el servidor de desarrollo pueden no resolverse automáticamente; muévelas a `public/` si ves errores 404.
- He creado rutas básicas con `react-router-dom`. Agrega más páginas copiando la estructura en `src/pages/` y los enlaces en `src/components/Sidebar.jsx`.

Siguientes pasos recomendados:
- Mover assets a `public/`.
- Reescribir cada HTML (crear_producto.html, crear_usuario.html, etc.) como componentes React y conectar con API/backend.
- Añadir control de estado (Context, Redux o similar) si necesitas compartir datos.

Configurar Supabase
-------------------

1. Crea un proyecto en Supabase y copia la URL y la ANON key.
2. Crea un archivo de entorno a partir de `.env.example` y añade las variables:

```text
# .env.local
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anonymous_key
```

3. Instala dependencias (si no lo hiciste):

```powershell
npm install
```

4. Ejecuta la app:

```powershell
npm run dev
```

5. La página de Clientes ya intenta leer la tabla `clientes` desde Supabase. Asegúrate de crearla en tu proyecto Supabase o modifica el nombre de la tabla en `src/pages/Clientes.jsx`.

Notas de seguridad: No compartas la ANON key en repositorios públicos si no es intencional. Para producción usa RLS y claves seguras en el servidor.
