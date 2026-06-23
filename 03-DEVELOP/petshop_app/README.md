# petshop_app

Frontend móvil construido con Flutter (Material 3) que funciona como un panel de administración para una tienda de mascotas. La app consume una API REST, mantiene el estado con `provider` y muestra dashboards, listas y estadísticas ayudando a controlar productos, categorías y recibos desde el celular.

## Resumen general
- **Stack:** Flutter, Provider para estado, `http` para peticiones, `shared_preferences` para mantener tokens y `fl_chart` para gráficas.
- **Propósito:** registrar usuarios autenticados, sincronizar inventario/recibos con la API y proveer indicadores visuales (stocks bajos, ingresos, top productos).
- **Modo offline ligero:** los tokens, su expiración y los datos del usuario se guardan localmente para restaurar sesión automática cuando la API vuelve a estar accesible.

## Estructura del proyecto
- `lib/main.dart`: entry point. Inyecta `AppProvider` que inicializa la API y controla sesiones/lifecycle.
- `lib/providers/app_provider.dart`: `ChangeNotifier` central. Maneja autenticación, persistencia, sincronización de categorías/productos/recibos y registra actividad para extender el TTL del token (5 minutos).
- `lib/services/api_config.dart`: host base `http://127.0.0.1:3001/api/v1`, endpoints (`/categoria`, `/product`, `/recibo-caja`, `/auth/login`) y headers por defecto/auth.
- `lib/services/api_service.dart`: wrapper HTTP con reintentos de refresh, parsing de errores, almacenamiento de tokens y lógica singleton.
- `lib/models/models.dart`: modelos tipo `User`, `Category`, `Product`, `ReceiptItem`, `Receipt`.
- `lib/screens`: pantallas reutilizables (Splash, Login, Dashboard, Productos, Estadísticas, Recibos, Categorías y Layout principal).
- `lib/theme/app_theme.dart`: paleta, tipografías y decoraciones compartidas (gradientes, botones, campos).
- `assets/`: imágenes y logos que usan las cabeceras de pantalla y tarjetas.

## Flujo de datos y estado
`AppProvider` inicializa `ApiService`, restaura tokens y llama a `_restoreUser()` para reconstruir el estado. Cada `screen` observa al provider (`context.watch<AppProvider>()`) y recibe listas actualizadas de categorías, productos y recibos. La sincronización se ejecuta en `initApi`, `refreshAll` o al refrescar manualmente con `RefreshIndicator`. El provider también:

- Guarda usuario y tokens en `SharedPreferences`.
- Controla el timer de sesión (`_idleTimeout` 5 min) y extiende la expiración cuando detecta actividad (`recordActivity`).
- Expone métodos CRUD locales (agregar/actualizar/eliminar productos, categorías, recibos) para simular acciones offline o preparar formularios futuros.

## Conexión con la API
- Base URL: `http://127.0.0.1:3001/api/v1`.
- Endpoints principales:
  - `/categoria` para categorías.
  - `/product` para productos.
  - `/recibo-caja` para recibos/ventas.
  - `/auth/login` para autenticación.
- `ApiService` usa `Content-Type` `application/json`, guarda tokens y su expiración, y tiene callbacks (`onUnauthorized`) que disparan logout automático si la API responde 401. Implementa reintento de refresh (actualmente el endpoint está vacío, pero la estructura permite extenderlo).
- `AppProvider.loginWithApi` genera combinaciones de campos (`email`, `usuario`, `correo_electronico`...) para adaptarse a distintos cuerpos y extrae el usuario y rol del cuerpo JSON para guardarlos localmente. Luego sincroniza categorías/productos/recibos si la autenticación es exitosa.

## Front móvil: pantallas y funcionalidades
- **Splash + Login:** `SplashScreen` dura 2.5 s y luego muestra el login. En `LoginScreen` se valida usuario y contraseña, se muestran gradients y tarjetas con el logo, y se llama a `provider.loginWithApi`. Si falla, aparece un `SnackBar` con el error.
- **MainLayout:** `BottomNavigationBar` con 4 pestañas (Dashboard, Productos, Estadísticas, Recibos). Header con logo, título dinámico, botón de notificaciones (cuento de stocks bajos) y menú de cierre de sesión. `Listener` global detecta toques para extender la sesión.
- **Dashboard:** tarjetas estadísticas (`productos`, `categorías`, `recibos`, `ingresos`), alerta visual para productos con stock bajo o cero, últimos recibos listados y botón flotante para refrescar datos.
- **Productos:** lista filtrable por búsqueda y categoría (dropdown). Cada tarjeta muestra nombre, descripción, precio, stock y posible imagen. Incluye `RefreshIndicator` y UI para distinguir stocks bajos (color y etiquetas).
- **Estadísticas:** filtros de fecha (`Desde`/`Hasta`), tarjetas resumen (ingresos totales, total de ventas), gráfico de barras o líneas con `fl_chart` para ventas por mes y gráfico circular de top productos, con refresco manual.
- **Recibos:** busca por id, cliente o método de pago; lista ordenada y modal de detalle (items, cantidad, subtotal, total, método). El modal aparece encima del `Stack`.
- **Categorías:** aunque no está en el nav, aparece en modales/detalles. Muestra lista de categorías, cantidad de productos por categoría, colores personalizados y modal con los productos asociados.

## Temas y recursos
- `AppTheme` centraliza colores primarios/categorías, `ThemeData` (botones, campos, appbar) y decoraciones (gradientes y cardDecoration). Ayuda a mantener consistencia visual en todas las pantallas.
- Las imágenes (por ejemplo `assets/img/logos/Logo_B.png`) se usan en cabeceras y tarjetas de login/dashboard.

## Cómo ejecutar
1. `flutter pub get`
2. Conecta un dispositivo/emulador y ejecuta `flutter run`.
3. Durante desarrollo usa el endpoint local `http://127.0.0.1:3001/api/v1`. Ajusta `ApiConfig.baseUrl` si trabajas contra otra instancia.

## Próximos pasos
- Completar formularios de creación/edición (actualmente sólo hay lectura/alertas localmente).
- Agregar modales para editar productos y recibos usando los métodos CRUD del provider.
- Extender el endpoint `/refresh` y el manejo de tokens de refresco en `ApiService`.
