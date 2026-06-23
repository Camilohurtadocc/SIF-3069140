# GUÍA COMPLETA DEL FRONTEND - PETSHOP 3.0.3.1

## ÍNDICE
1. [Introducción General](#introducción-general)
2. [Arquitectura General](#arquitectura-general)
3. [Sistema de Conexión con el Backend (Axios)](#sistema-de-conexión-con-el-backend-axios)
4. [Gestión de Autenticación](#gestión-de-autenticación)
5. [Estructura de Carpetas](#estructura-de-carpetas)
6. [Flujo de Datos](#flujo-de-datos)
7. [Descripción Detallada de Archivos](#descripción-detallada-de-archivos)
8. [Rutas y Navegación](#rutas-y-navegación)
9. [Componentes Reutilizables](#componentes-reutilizables)
10. [Servicios](#servicios)
11. [Manejo de Errores](#manejo-de-errores)
12. [Estado Global](#estado-global)

---

## INTRODUCCIÓN GENERAL

Este frontend es una aplicación web completa de gestión para una tienda de mascotas (PetShop). Está construida con **React 18.3.1** y utiliza **Vite** como herramienta de construcción. La aplicación permite gestionar:

- **Clientes**: Crear, editar, listar clientes
- **Productos**: Crear, editar, listar y gestionar inventario de productos
- **Usuarios**: Crear, editar, listar usuarios con diferentes roles (administrador, vendedor)
- **Recibos de Caja**: Crear recibos de ventas y ver historial
- **Cierres de Caja**: Registrar y ver el cierre diario de cajas
- **Categorías**: Gestionar categorías de productos
- **Dashboard**: Panel de control con estadísticas

La aplicación requiere **autenticación por token JWT** para acceder a cualquier funcionalidad. El token se obtiene mediante el login y se almacena en `localStorage` para persistencia entre sesiones.

---

## ARQUITECTURA GENERAL

La aplicación sigue una arquitectura de **capas**:

```
┌─────────────────────────────────────────────────────────┐
│                    COMPONENTES UI (React)               │
│           (Páginas, Modales, Formularios)              │
└────────────────────────┬────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│              ESTADO GLOBAL (AuthContext)                │
│           (Usuario, Token, Roles, Funciones)           │
└────────────────────────┬────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│                    SERVICIOS (Services)                 │
│     (productService, userService, clientService, etc)  │
│              Lógica de negocio y mapeo                  │
└────────────────────────┬────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│            CLIENTE HTTP (Axios - api.js)               │
│      Gestiona peticiones HTTP y interceptores           │
└────────────────────────┬────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────────┐
│                     BACKEND                             │
│          (API REST en Node.js/Express)                 │
│       Base de datos SQL (MySQL/MariaDB)                │
└─────────────────────────────────────────────────────────┘
```

---

## SISTEMA DE CONEXIÓN CON EL BACKEND (AXIOS)

### ¿Qué es Axios?

Axios es una librería JavaScript que permite hacer peticiones HTTP (GET, POST, PUT, DELETE, etc.) desde el frontend al backend. Es más moderna y fácil de usar que el antiguo `fetch()`.

### Archivo: `src/services/api.js`

Este es el corazón de la comunicación entre el frontend y el backend. **Todos** los servicios (productService, userService, etc.) usan este archivo para hacer peticiones.

**Configuración inicial:**

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

Esto significa:
- **baseURL**: Toda petición a `/product` se convierte en `http://localhost:3001/api/v1/product`
- **headers**: Por defecto, todas las peticiones envían `Content-Type: application/json` (indicando que enviamos JSON)

### Interceptor de Solicitud (Request Interceptor)

Antes de que cualquier petición se envíe al backend, el interceptor de solicitud se ejecuta automáticamente:

**¿Qué hace?**

1. Lee el token JWT del `localStorage` (donde se guardó durante el login)
2. Agrega el token en el header `Authorization: Bearer [token]`
3. Registra la petición en logs (para debugging)
4. Envía la petición al backend

**Ejemplo:**
Cuando tu componente hace:
```javascript
await api.get('/product/3')
```

El interceptor automáticamente hace que se envíe:
```
GET http://localhost:3001/api/v1/product/3
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
```

Sin el token, el backend rechazaría la petición con error 401 (Unauthorized).

### Interceptor de Respuesta (Response Interceptor)

Después de que el backend responde, el interceptor de respuesta se ejecuta:

**¿Qué hace?**

1. Si la respuesta es exitosa (status 200-299): 
   - Registra los datos en logs
   - Devuelve la respuesta al componente

2. Si hay error en la respuesta (status 400-599):
   - **Status 500+**: Error del servidor. Muestra un toast: "Error interno del servidor"
   - **Status 400-499**: Error del cliente. Muestra un toast con el mensaje de error del backend
   - **Sin respuesta**: Error de conexión. Muestra un toast: "Error de conexión"
   - Registra el error detallado en logs

**Ejemplo de flujo con error:**

1. Componente intenta crear un producto sin nombre:
```javascript
await api.post('/product', { precio_unitario: 1000 })
```

2. Backend rechaza: "El nombre del producto es requerido" (error 400)

3. Interceptor captura el error y ejecuta:
```javascript
toast.error('El nombre del producto es requerido')
logger.error('API', 'Error al crear producto', { status: 400, ... })
```

4. Lanza el error para que el componente lo maneje

---

## GESTIÓN DE AUTENTICACIÓN

### Archivo: `src/context/AuthContext.jsx`

Este archivo define el **contexto global de autenticación**. Un contexto es como una "caja global" donde se guarda información que múltiples componentes necesitan acceder sin pasarla entre ellos.

### ¿Cómo funciona el flujo de autenticación?

**1. Inicialización (cuando carga la aplicación):**

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario abre la aplicación o recarga la página            │
│  (componente AuthProvider carga)                            │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  AuthContext busca token en localStorage                    │
│  ¿Hay token guardado?                                       │
└──────────────────────────┬──────────────────────────────────┘
         ┌─────────────────┴─────────────────┐
         ↓                                   ↓
     SÍ HAY TOKEN                    NO HAY TOKEN
     (Sesión previa)                (Usuario nuevo)
         │                               │
         ↓                               ↓
  Valida token con                 setUser(null)
  endpoint /me                      Muestra login
         │
         ├─ ¿Token válido?
         │  SÍ: setUser(datos del usuario)
         │  NO: Limpia localStorage, muestra login
```

**¿Qué sucede si el rol fue modificado?**

El sistema tiene un mecanismo especial: cuando un administrador cambio el rol de un usuario, ese usuario verá un alerta y será deslogueado automáticamente en su próxima acción.

```
┌──────────────────────────────────────────────────────────────┐
│  En AuthContext.jsx (línea ~31-57)                          │
│                                                               │
│  1. Se valida token con /me                                 │
│  2. Se revisa localStorage.getItem('usersToLogout')         │
│  3. Si el ID del usuario está en esa lista:                │
│     - Muestra: "Tu rol ha sido modificado"                 │
│     - Limpia localStorage                                   │
│     - Redirige a login (/dashboard → /)                    │
│     - Limpia la marca de logout                            │
└──────────────────────────────────────────────────────────────┘
```

**2. Login (usuario ingresa email y contraseña):**

```
┌────────────────────────────────────────────────────────────┐
│  Usuario escribe email/password y da click en "Ingresar"  │
└───────────────────────┬──────────────────────────────────┘
                        ↓
           ┌─────────────────────────────────────┐
           │  signIn({ email, password })        │
           │  en AuthContext.jsx (línea ~113)   │
           └────────────┬────────────────────────┘
                        ↓
    ┌───────────────────────────────────────────┐
    │  Petición POST a /login                   │
    │  Body: { email, password }                │
    │  Enviada por: api.post('/login', ...)     │
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │  Backend responde:                        │
    │  {                                         │
    │    token: "jwt...muy...largo",            │
    │    user: {                                 │
    │      id_usuario: 1,                       │
    │      correo_electronico: "email@...",     │
    │      nombre_rol: "administrador"          │
    │    }                                       │
    │  }                                         │
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │  Guardar en localStorage:                 │
    │  - token → para enviar en futuras          │
    │    peticiones                             │
    │  - user → para mostrar datos del usuario  │
    │    (nombre, rol, email, etc)              │
    └────────────┬────────────────────────────┘
                 ↓
    ┌───────────────────────────────────────────┐
    │  Redirigir a /dashboard                   │
    │  (página principal de la app)             │
    └───────────────────────────────────────────┘
```

**3. Logout (usuario cierra sesión):**

```
Usuario hace click en "Cerrar sesión"
          ↓
signOut() en AuthContext (línea ~154)
          ↓
Limpia localStorage (token y user)
          ↓
Limpia header Authorization en Axios
          ↓
setUser(null)
          ↓
Redirige a login (/)
```

### Archivo: `src/hooks/useProfile.js`

Este archivo es un "hook personalizado" que simplifica el acceso a información de roles del usuario.

**¿Qué hace?**

Proporciona dos funciones útiles:
- `hasRole('administrador')`: Devuelve true si el usuario es administrador
- `hasRole('vendedor')`: Devuelve true si el usuario es vendedor

**¿Por qué es útil?**

En lugar de escribir en componentes:
```javascript
if (user && user.nombre_rol === 'administrador') { ... }
```

Simplemente escribes:
```javascript
if (hasRole('administrador')) { ... }
```

---

## ESTRUCTURA DE CARPETAS

```
src/
├── main.jsx                    # Punto de entrada de la aplicación React
├── App.jsx                     # Configuración de rutas principales
├── styles.css                  # Estilos globales
│
├── context/
│   └── AuthContext.jsx         # Contexto global de autenticación
│
├── hooks/
│   └── useProfile.js           # Hook personalizado para acceso a roles
│
├── pages/                      # Páginas principales de la aplicación
│   ├── Login.jsx               # Página de login
│   ├── Dashboard.jsx           # Panel de control
│   ├── Clientes.jsx            # Listar clientes
│   ├── CrearCliente.jsx        # Crear cliente
│   ├── EditarCliente.jsx       # Editar cliente
│   ├── Productos.jsx           # Listar productos
│   ├── CrearProducto.jsx       # Crear producto
│   ├── ModificarProducto.jsx   # Editar producto
│   ├── Usuarios.jsx            # Listar usuarios (solo admin)
│   ├── CrearUsuario.jsx        # Crear usuario (solo admin)
│   ├── ActualizarUsuario.jsx   # Editar usuario (solo admin)
│   ├── Categorias.jsx          # Gestionar categorías
│   ├── RecibosDeCaja.jsx       # Crear recibos de venta
│   ├── HistorialRecibosDeCaja.jsx  # Ver recibos anteriores
│   └── CierresCaja.jsx         # Registrar cierre de caja diaria
│
├── components/                 # Componentes reutilizables
│   ├── Layout.jsx              # Estructura base (Header, Sidebar, contenido)
│   ├── Header.jsx              # Barra superior con usuario y opciones
│   ├── Sidebar.jsx             # Menú lateral de navegación
│   ├── ProtectedRoute.jsx      # Envuelve rutas para proteger con autenticación
│   ├── ProductDetailModal.jsx  # Modal que muestra detalles de un producto
│   ├── Pagination.jsx          # Componente de paginación
│   ├── SearchableSelect.jsx    # Selector (dropdown) con búsqueda
│   ├── FormLayout.jsx          # Estructura para formularios
│   ├── BackendStatus.jsx       # Indicador de estado del backend
│   └── recibos/                # Carpeta con componentes específicos de recibos
│       └── (componentes para recibos)
│
├── services/                   # Servicios (comunicación con backend)
│   ├── api.js                  # Configuración de Axios
│   ├── productService.js       # Funciones para productos
│   ├── userService.js          # Funciones para usuarios
│   ├── clientService.js        # Funciones para clientes
│   ├── categoryService.js      # Funciones para categorías
│   ├── recibosDeCajaService.js # Funciones para recibos
│   ├── cierresCajaService.js   # Funciones para cierres
│   ├── dataService.js          # Función genérica para datos paginados
│   ├── storageService.js       # Funciones para localStorage
│   ├── errorCodes.js           # Mapeo de códigos de error a mensajes
│   └── (otros servicios)
│
└── utils/                      # Funciones de utilidad
    ├── logger.js               # Sistema de logging para debugging
    └── validation.js           # Funciones de validación de formularios
```

---

## FLUJO DE DATOS

### Ejemplo 1: Ver lista de productos

```
┌─────────────────────────────────────┐
│  Usuario abre /productos            │
│  (Página Productos.jsx carga)       │
└──────────────┬──────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  useEffect() en Productos.jsx ejecuta:   │
│  loadProductos()                         │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  Llama a:                                │
│  fetchPaginatedData({                    │
│    endpoint: 'product',                  │
│    page: 1,                              │
│    pageSize: 10,                         │
│    search: ''                            │
│  })                                      │
│  (ubicado en dataService.js)            │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  dataService.js hace petición:           │
│  api.get('/product')                     │
│                                          │
│  Interceptor Request:                    │
│  - Lee token de localStorage             │
│  - Agrega Authorization header           │
│  - Envía petición                        │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  Petición HTTP:                          │
│  GET http://localhost:3001/api/v1/       │
│      product                             │
│  Headers: Authorization: Bearer [token]  │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  BACKEND RESPONDE:                       │
│  [                                       │
│    {                                     │
│      id_producto: 1,                     │
│      nombre_producto: "Alimento",        │
│      precio_unitario: 15000,             │
│      stock: 50,                          │
│      categoria: {                        │
│        id_categoria: 2,                  │
│        nombre_categoria: "Alimentos"     │
│      }                                   │
│    },                                    │
│    ...más productos                      │
│  ]                                       │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  Interceptor Response:                   │
│  - Verifica status (200 = OK)            │
│  - Devuelve respuesta al servicio        │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  dataService.js procesa:                 │
│  - Aplica paginación en frontend         │
│  - Aplica búsqueda si hay                │
│  - Devuelve { data: [...], count: 45 }   │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  Productos.jsx recibe datos:             │
│  - setProductos(data)                    │
│  - setTotal(45)                          │
│                                          │
│  Estado actualizado → Component re-render│
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  Usuario ve tabla de productos con:      │
│  - 10 productos en la página             │
│  - Paginador con "Página 1 de 5"         │
│  - Nombres, precios, stock, categorías   │
└──────────────────────────────────────────┘
```

### Ejemplo 2: Crear un nuevo producto

```
┌──────────────────────────────┐
│  Usuario rellena formulario  │
│  y hace click en "Crear"     │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────────────────┐
│  CrearProducto.jsx ejecuta:              │
│  handleSubmit(formData)                  │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  Llama a:                                │
│  productService.create(productData)      │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  productService.js hace petición:        │
│  api.post('/product', productData)       │
│                                          │
│  Con datos:                              │
│  {                                       │
│    nombre_producto: "Juguete",           │
│    precio_unitario: 5000,                │
│    stock: 30,                            │
│    id_categoria: 1,                      │
│    presentacion_producto: "unidad"       │
│  }                                       │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  Interceptor Request:                    │
│  - Agrega token en header                │
│  - Agrega Content-Type: application/json │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  Petición HTTP:                          │
│  POST http://localhost:3001/api/v1/      │
│       product                            │
│  Body: { nombre_producto, ... }          │
│  Headers: Authorization, Content-Type    │
└──────────────┬───────────────────────────┘
               ↓
         ┌─────────────────┐
         │  BACKEND        │
         │  Procesa:       │
         │  - Valida datos │
         │  - Guarda en BD │
         │  - Devuelve OK  │
         └────────┬────────┘
                  ↓
┌──────────────────────────────────────────┐
│  BACKEND RESPONDE:                       │
│  {                                       │
│    id_producto: 47,                      │
│    nombre_producto: "Juguete",           │
│    precio_unitario: 5000,                │
│    stock: 30,                            │
│    id_categoria: 1                       │
│  }                                       │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  Interceptor Response (status 201):      │
│  - Devuelve respuesta                    │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  CrearProducto.jsx captura respuesta:    │
│  - toast.success("Producto creado!")     │
│  - Espera 1-2 segundos                   │
│  - navigate('/productos')                │
│    (vuelve a listar productos)           │
└──────────────────────────────────────────┘
```

---

## DESCRIPCIÓN DETALLADA DE ARCHIVOS

### ARCHIVOS PRINCIPALES

#### `src/main.jsx`

**Función:** Es el punto de entrada de toda la aplicación. Cuando ejecutas `npm run dev`, este archivo se ejecuta primero.

**¿Qué hace línea por línea?**

1. Importa librerías necesarias:
   - React (framework)
   - ReactDOM (renderiza React en HTML)
   - BrowserRouter (permite navegación entre páginas)
   - App (componente principal)
   - Estilos (CSS de Bootstrap y Toastify)
   - ToastContainer (muestra notificaciones)
   - AuthProvider (contexto de autenticación)

2. Busca el elemento HTML con id="root" en `index.html`

3. Renderiza:
   ```
   AuthProvider (gestiona autenticación)
     ↓
   BrowserRouter (gestiona rutas)
     ↓
   App (componente principal)
   ```

---

#### `src/App.jsx`

**Función:** Define todas las rutas de la aplicación (qué página se muestra en cada URL).

**Estructura:**

- Ruta `/` → Login (cualquiera puede acceder)
- Todas las demás rutas están envueltas en `ProtectedLayout`, que requiere autenticación

**Rutas protegidas:**

```
/dashboard       → Dashboard (todos)
/clientes        → Listar clientes (todos)
/clientes/crear  → Crear cliente (todos)
/clientes/editar/:id → Editar cliente (todos)
/productos       → Listar productos (todos)
/productos/crear → Crear producto (todos)
/productos/editar/:id → Editar producto (todos)
/usuarios        → Listar usuarios (SOLO administrador)
/usuarios/crear  → Crear usuario (SOLO administrador)
/usuarios/editar/:id → Editar usuario (SOLO administrador)
/categorias      → Gestionar categorías (todos)
/recibos-de-caja → Crear recibos (todos)
/recibos-de-caja/historial → Ver recibos (todos)
/cierres-caja    → Registrar cierre (todos)
```

**¿Qué es ProtectedLayout?**

Es un componente que envuelve todas las rutas protegidas. Verifica:
1. ¿El usuario está autenticado? (¿Hay token?)
2. ¿El usuario tiene el rol requerido?

Si falla alguna validación, redirige a `/` (login).

---

#### `src/services/api.js`

**YA EXPLICADO ARRIBA EN "SISTEMA DE CONEXIÓN CON EL BACKEND"**

Resumidamente: Es el cliente HTTP que conecta con el backend. Maneja:
- Agregar token automáticamente
- Manejar errores
- Registrar logs

---

#### `src/context/AuthContext.jsx`

**YA EXPLICADO ARRIBA EN "GESTIÓN DE AUTENTICACIÓN"**

Resumidamente: Gestiona:
- Login/Logout
- Almacenar token y usuario en localStorage
- Validar sesión
- Compartir información de autenticación con toda la app

---

### SERVICIOS (Services)

Los servicios son funciones que **comunican con el backend**. Cada servicio corresponde a una entidad del sistema.

#### `src/services/productService.js`

**Operaciones disponibles:**

```javascript
// Obtener todos los productos
await productService.getAll()

// Obtener un producto por ID (con todos los detalles incluyendo categoría)
await productService.getById(5)

// Crear un producto nuevo
await productService.create({
  nombre_producto: "Alimento",
  precio_unitario: 15000,
  stock: 50,
  id_categoria: 2
})

// Actualizar un producto
await productService.update(5, {
  precio_unitario: 16000
})

// Eliminar un producto
await productService.delete(5)
```

**¿Cómo funciona internamente?**

Cada función utiliza `api.js` (Axios) para hacer la petición:

```javascript
getById: async (id) => {
  const response = await api.get(`/product/${id}`)
  return response.data
}
```

Ejemplo:
- `id = 5`
- Petición → `GET http://localhost:3001/api/v1/product/5`
- Backend devuelve el producto
- Retorna `response.data` al componente

#### `src/services/userService.js`

**Operaciones disponibles:**

```javascript
// Obtener todos los usuarios
await userService.getAll()

// Obtener un usuario por ID
await userService.getById(1)

// Crear un usuario
await userService.create({
  nombre_usuario: "Juan",
  correo_electronico: "juan@example.com",
  password: "segura123",
  nombre_rol: "vendedor"
})

// Actualizar un usuario
await userService.update(1, {
  nombre_usuario: "Juan Carlos"
})

// Cambiar el rol de un usuario (IMPORTANTE)
await userService.updateRole(1, "administrador")

// Eliminar un usuario
await userService.delete(1)
```

**¿Qué es `updateRole` y por qué es importante?**

Cuando un administrador cambia el rol de un usuario, no se usa la función `update()` normal. Se usa `updateRole()` porque:

1. El backend tiene un endpoint especial: `PUT /user/:id/role`
2. Guarda el cambio en la tabla `usuario_rol` de la base de datos
3. Permite el sistema de notificación: marca al usuario para logout en su próximo refresh

```javascript
updateRole: async (id, newRole) => {
  const response = await api.put(`/user/${id}/role`, {
    nombre_rol: newRole
  })
  return response.data
}
```

#### `src/services/clientService.js`

**Operaciones disponibles:**

```javascript
// Obtener todos los clientes
await clientService.getAll()

// Obtener un cliente por ID
await clientService.getById(3)

// Crear un cliente
await clientService.create({
  nombre_cliente: "María López",
  numero_documento: "1234567890",
  telefono: "3001234567",
  direccion: "Calle 5 #10-20",
  tipo_cliente: "persona_natural"
})

// Actualizar un cliente
await clientService.update(3, {
  telefono: "3009876543"
})

// Eliminar un cliente
await clientService.delete(3)
```

#### `src/services/dataService.js`

**Función especial: Obtener datos paginados y con búsqueda**

Esta es una función **genérica** que se puede usar para cualquier entidad.

```javascript
const { data, count } = await fetchPaginatedData({
  endpoint: 'product',      // Qué entidad (user, product, client, etc)
  page: 1,                  // Página actual
  pageSize: 10,             // Items por página
  searchQuery: 'alimento',  // Término a buscar (opcional)
  searchFields: ['nombre_producto', 'codigo_sku']  // Dónde buscar
})
```

**¿Qué devuelve?**

```javascript
{
  data: [              // Array con los items de esta página
    { id_producto: 1, nombre_producto: "Alimento...", ... },
    { id_producto: 2, nombre_producto: "Alimento...", ... },
    ...
  ],
  count: 45           // Total de items (no solo de esta página)
}
```

**¿Cómo funciona la búsqueda?**

La búsqueda se hace en el **frontend**, no en el backend:

```
Backend devuelve TODOS los productos
     ↓
Frontend filtra los que coinciden con "alimento"
     ↓
Frontend pagina los resultados
```

Por ejemplo, si hay 45 productos y buscas "alimento":
1. Obtiene los 45 productos del backend
2. Filtra quedando con 12 que contienen "alimento"
3. Pagina esos 12 (página 1 = primeros 10)
4. Devuelve esos 10 + count = 12

#### `src/services/recibosDeCajaService.js`

**Operaciones para recibos de venta:**

```javascript
// Crear un recibo (cuando haces una venta)
await recibosDeCajaService.create({
  id_cliente: 5,
  tipo_pago: "Efectivo",  // O "Tarjeta", "Transferencia"
  productos: [
    {
      id_producto: 1,
      cantidad: 2,
      precio_venta: 15000
    },
    {
      id_producto: 3,
      cantidad: 1,
      precio_venta: 5000
    }
  ]
})

// Obtener recibos
await recibosDeCajaService.getAll()

// Obtener un recibo específico
await recibosDeCajaService.getById(10)
```

**Flujo de creación de recibo:**

1. Usuario en RecibosDeCaja.jsx llena el formulario
2. Selecciona cliente, método de pago, y productos con cantidades
3. Da click en "Crear Recibo"
4. Se envía petición POST con la estructura arriba
5. Backend calcula total, crea el recibo, devuelve confirmación
6. Frontend muestra mensaje de éxito
7. Se recarga la lista de recibos

#### `src/services/categoryService.js`

**Operaciones para categorías:**

```javascript
// Obtener todas las categorías
await categoryService.getAll()

// Obtener categoría por ID
await categoryService.getById(2)

// Crear categoría
await categoryService.create({
  nombre_categoria: "Accesorios",
  estado: "activo"
})

// Actualizar categoría
await categoryService.update(2, {
  nombre_categoria: "Accesorios para perros"
})

// Eliminar categoría
await categoryService.delete(2)
```

#### `src/services/errorCodes.js`

**Función:** Mapea códigos de error del backend a mensajes legibles en español.

**Ejemplo:**

Backend devuelve:
```javascript
{
  error: {
    code: 'ERR_NOT_FOUND',
    message: 'Producto no encontrado'
  }
}
```

Este archivo tiene:
```javascript
const ERROR_CODES = {
  ERR_NOT_FOUND: 'El producto que buscas no existe',
  ERR_INVALID_INPUT: 'Los datos ingresados no son válidos',
  ERR_DUPLICATE_SKU: 'El código SKU ya existe',
  // ... más códigos
}
```

#### `src/services/storageService.js`

**Función:** Simplifica lectura/escritura en localStorage.

```javascript
// Guardar algo
storageService.setItem('miDato', { id: 1, nombre: 'test' })

// Obtener algo
const dato = storageService.getItem('miDato')  // { id: 1, nombre: 'test' }

// Eliminar algo
storageService.removeItem('miDato')

// Limpiar todo
storageService.clear()
```

---

### PÁGINAS (Pages)

Las páginas son componentes principales que ocupan toda la pantalla. Cada página está disponible en una ruta.

#### `src/pages/Login.jsx`

**Función:** Pantalla de inicio de sesión.

**¿Qué sucede?**

1. Usuario ve un formulario con email y contraseña
2. Rellena los campos
3. Da click en "Ingresar"
4. Componente llama a `signIn({ email, password })` de AuthContext
5. Si es válido:
   - Se guarda token en localStorage
   - Se guarda usuario en localStorage
   - Se redirige a /dashboard
6. Si es inválido:
   - Se muestra un toast con el error
   - Permanece en la pantalla de login

#### `src/pages/Dashboard.jsx`

**Función:** Panel de control con estadísticas e información general del negocio.

**¿Qué muestra?**

- Total de clientes
- Total de productos
- Ventas del día
- Últimos recibos creados
- Estatus del backend

#### `src/pages/Productos.jsx`

**Función:** Listar todos los productos con búsqueda, paginación y acciones.

**Características:**

- Tabla con productos (nombre, código SKU, precio, stock, categoría)
- Búsqueda en tiempo real
- Paginación
- Modal que muestra detalles del producto
- Botones para editar o eliminar producto
- Botón para crear nuevo producto

**Flujo:**

1. Carga la página
2. Ejecuta `loadProductos()` que llama a `fetchPaginatedData`
3. Obtiene productos y los muestra en tabla
4. Usuario hace click en nombre del producto
5. Se ejecuta `openProductDetail()` que:
   - Llama a `productService.getById()` para obtener detalles completos
   - Abre modal de detalles
   - Muestra nombre, precio, stock, categoría, descripción, etc.

#### `src/pages/CrearProducto.jsx`

**Función:** Formulario para crear un producto nuevo.

**Campos:**

- Nombre del producto (requerido)
- Código SKU (requerido)
- Descripción
- Presentación (libras, unidad, paquete, etc)
- Precio unitario (requerido)
- Categoría (dropdown) (requerido)
- Stock inicial (requerido)
- Imagen (opcional)

**Flujo:**

1. Usuario rellena formulario
2. Da click en "Crear Producto"
3. Se validan campos
4. Si son válidos, se envía a `productService.create()`
5. Backend crea y devuelve confirmación
6. Se muestra toast de éxito
7. Se redirige a `/productos`

#### `src/pages/ModificarProducto.jsx`

**Función:** Formulario para editar un producto existente.

**Diferencia con CrearProducto:**

- Carga automáticamente datos del producto usando la URL (`:id`)
- Llena los campos con los valores actuales
- Al guardar, usa `productService.update()` en lugar de `create()`

#### `src/pages/Clientes.jsx`

**Función:** Listar todos los clientes.

**Características:**

- Tabla con clientes (nombre, documento, teléfono, dirección, tipo)
- Búsqueda
- Paginación
- Botones para editar o eliminar
- Botón para crear cliente

#### `src/pages/CrearCliente.jsx` y `src/pages/EditarCliente.jsx`

**Función:** Crear o editar un cliente.

**Campos:**

- Nombre del cliente
- Tipo de documento (cédula, pasaporte, etc)
- Número de documento
- Teléfono
- Dirección
- Tipo de cliente (persona natural, empresa)

#### `src/pages/Usuarios.jsx`

**Función:** Listar usuarios (SOLO visible para administrador).

**Características:**

- Tabla con usuarios (nombre, email, rol)
- Búsqueda
- Paginación
- Botones para editar o eliminar
- Botón para crear usuario

**Nota:** La ruta está protegida con `allowedRoles={['administrador']}`

#### `src/pages/CrearUsuario.jsx`

**Función:** Crear un usuario nuevo (SOLO admin).

**Campos:**

- Nombre del usuario
- Email
- Contraseña
- Rol (administrador o vendedor)

#### `src/pages/ActualizarUsuario.jsx`

**Función:** Editar un usuario existente (SOLO admin).

**Características especiales:**

- Carga datos del usuario automáticamente
- Permite cambiar rol
- Al cambiar rol, marca al usuario para logout en su próximo acceso
  
**Cómo funciona el cambio de rol:**

```javascript
// Si el rol cambió
if (newRole !== originalRole) {
  // Se guarda en usersToLogout la marca
  const usersToLogout = [..., userId]
  localStorage.setItem('usersToLogout', JSON.stringify(usersToLogout))
  
  // La próxima vez que el usuario recargue la página o navegue,
  // ProtectedRoute lo detecta y lo desloguea con un mensaje
}
```

#### `src/pages/Categorias.jsx`

**Función:** Gestionar categorías de productos.

**Operaciones:**

- Ver todas las categorías
- Crear nueva categoría
- Editar categoría
- Eliminar categoría

#### `src/pages/RecibosDeCaja.jsx`

**Función:** Crear recibos de venta (cuando haces una venta).

**Flujo completo:**

1. Usuario selecciona cliente del dropdown
2. Usuario selecciona productos a vender
3. Para cada producto:
   - Especifica cantidad
   - El precio unitario se carga automáticamente
   - Se calcula subtotal
4. Usuario selecciona método de pago
5. Se muestra total a pagar
6. Usuario hace click en "Crear Recibo"
7. Se envía petición a `recibosDeCajaService.create()`
8. Si es exitoso:
   - Se muestra confirmación con número de recibo
   - Se limpia el formulario
   - Se actualiza el historial

#### `src/pages/HistorialRecibosDeCaja.jsx`

**Función:** Ver todos los recibos creados (historial de ventas).

**Características:**

- Tabla con recibos
- Información: número recibo, cliente, fecha, total, método de pago
- Búsqueda y paginación
- Botón para ver detalles de cada recibo

#### `src/pages/CierresCaja.jsx`

**Función:** Registrar el cierre de caja del día.

**¿Qué es un cierre de caja?**

Al final del día, los vendedores cierran su caja registradora:
- Suman total de dinero recibido
- Agrupan por método de pago (efectivo, tarjeta, transferencia)
- Registran diferencias (si las hay)
- El sistema calcula estadísticas

**Flujo:**

1. Usuario hace click en "Crear Cierre"
2. Sistema obtiene todos los recibos del día actual
3. Calcula automáticamente:
   - Total de ventas
   - Total por método de pago
   - Cantidad de transacciones
   - Promedio de venta
4. Usuario ingresa el monto de efectivo que tiene
5. Sistema compara con lo esperado
6. Si hay diferencia, muestra advertencia
7. Usuario registra el cierre
8. Se crea un registro en la BD

---

### COMPONENTES REUTILIZABLES (Components)

Los componentes reutilizables son "piezas" que se usan en múltiples páginas.

#### `src/components/Layout.jsx`

**Función:** Estructura general de la aplicación.

**Estructura:**

```
┌─────────────────────────────────────┐
│          Header (barra superior)    │
├──────────────┬──────────────────────┤
│              │                      │
│   Sidebar    │  Contenido de       │
│  (menú       │  la página          │
│   izq)       │  (prop children)    │
│              │                      │
├──────────────┴──────────────────────┤
│        Footer (información)          │
└─────────────────────────────────────┘
```

**Props:**

```javascript
<Layout>
  {/* El contenido de cada página va aquí */}
</Layout>
```

#### `src/components/Header.jsx`

**Función:** Barra superior de la aplicación.

**Muestra:**

- Logo/nombre de la app
- Nombre del usuario conectado
- Rol del usuario
- Botón de "Cerrar sesión"
- Estado del backend (si está conectado)

#### `src/components/Sidebar.jsx`

**Función:** Menú lateral de navegación.

**Muestra:**

- Enlaces a todas las páginas
- Menús especiales solo para administrador
- Ícono del usuario
- Rol actual

**Ejemplo de estructura:**

```
MENÚ PRINCIPAL
├─ Dashboard
├─ Clientes
├─ Productos
├─ Categorías
├─ Recibos de Caja
├─ Historial de Recibos
├─ Cierres de Caja
└─ ADMINISTRACIÓN (solo admin)
   ├─ Usuarios
   └─ Crear Usuario
```

#### `src/components/ProtectedRoute.jsx`

**Función:** Protege rutas que requieren autenticación y/o roles específicos.

**¿Cómo funciona?**

```javascript
// En App.jsx
<Route path="/usuarios" 
  element={
    <ProtectedRoute allowedRoles={['administrador']}>
      <Usuarios />
    </ProtectedRoute>
  }
/>
```

ProtectedRoute verifica:

1. ¿El usuario está autenticado? (¿Hay token y usuario?)
   - Si no → Redirige a `/` (login)
   - Si sí → Continúa

2. ¿Se requieren roles específicos? (allowedRoles)
   - Si no se especifican → Deja pasar a cualquiera autenticado
   - Si se especifican → Verifica si el usuario tiene uno de esos roles
     - Si no lo tiene → Redirige a `/dashboard`
     - Si lo tiene → Deja pasar

3. ¿El usuario fue marcado para logout? (usersToLogout)
   - Si sí → Desloguea y muestra alerta

#### `src/components/ProductDetailModal.jsx`

**Función:** Modal que muestra detalles completos de un producto.

**¿Qué muestra?**

- Imagen del producto
- Nombre
- Código SKU
- Descripción
- Precio unitario
- Stock disponible
- Categoría
- Presentación
- Estado (activo/inactivo)

**¿Cómo se abre?**

En Productos.jsx, cuando haces click en el nombre:

```javascript
const openProductDetail = async (prod) => {
  const fullProduct = await productService.getById(prod.id_producto)
  setSelectedProduct(fullProduct)  // Abre el modal
}
```

#### `src/components/Pagination.jsx`

**Función:** Componente de paginación reutilizable.

**Props:**

```javascript
<Pagination
  current={page}              // Página actual
  total={45}                  // Total de items
  pageSize={10}               // Items por página
  onPageChange={(newPage) => setPage(newPage)}
/>
```

**Renderiza:**

```
« Anterior  [1] [2] [3] [4] [5]  Siguiente »
```

#### `src/components/SearchableSelect.jsx`

**Función:** Dropdown mejorado con búsqueda.

**Útil para:**

- Seleccionar cliente (busca por nombre o documento)
- Seleccionar producto (busca por nombre o código)
- Seleccionar categoría (busca por nombre)

**Uso:**

```javascript
<SearchableSelect
  label="Cliente"
  options={clientes}
  optionLabel="nombre_cliente"
  optionValue="id_cliente"
  onChange={(clienteId) => setSelectedClient(clienteId)}
  placeholder="Busca un cliente..."
/>
```

#### `src/components/FormLayout.jsx`

**Función:** Estructura estándar para formularios.

**¿Qué proporciona?**

- Campos de entrada con validación
- Botones de guardar/cancelar
- Estilos consistentes
- Manejo de errores


#### `src/components/BackendStatus.jsx`

**Función:** Indicador visual del estado del backend.

**Muestra:**

- Verde: Backend conectado
- Rojo: Backend desconectado
- Amarillo: Intentando conectar

---

## RUTAS Y NAVEGACIÓN

### Mapa de Rutas

```
http://localhost:5173/
│
├─ / (Login)
│
└─ /dashboard (requiere auth)
   ├─ /clientes
   │  ├─ /clientes/crear
   │  └─ /clientes/editar/:id
   │
   ├─ /productos
   │  ├─ /productos/crear
   │  └─ /productos/editar/:id
   │
   ├─ /categorias
   │
   ├─ /recibos-de-caja
   └─ /recibos-de-caja/historial
   │
   ├─ /cierres-caja
   │
   └─ /usuarios (SOLO admin)
      ├─ /usuarios/crear
      └─ /usuarios/editar/:id
```

### Navegación Programática

Los componentes pueden navegar a otras páginas así:

```javascript
import { useNavigate } from 'react-router-dom'

function MiComponente() {
  const navigate = useNavigate()
  
  const handleCrear = async () => {
    // ... hacer algo ...
    navigate('/productos')  // Ir a la página de productos
  }
  
  const handleEditar = (id) => {
    navigate(`/productos/editar/${id}`)  // Ir a editar producto 5
  }
}
```

---

## MANEJO DE ERRORES

### Niveles de Manejo

**1. Nivel de Axios (api.js)**

El interceptor de respuesta captura todos los errores y:
- Muestra un toast automático
- Registra en logs
- Lanza el error

**2. Nivel de Servicio**

A veces el servicio necesita procesar especialmente el error:

```javascript
// En productService.js
try {
  const response = await api.post('/product', data)
  return response.data
} catch (error) {
  // Procesar error específico
  if (error.response?.status === 409) {
    // Código SKU duplicado
    throw new Error('El código SKU ya existe')
  }
  throw error
}
```

**3. Nivel de Componente**

El componente puede capturar y manejar errores específicos:

```javascript
try {
  await productService.create(formData)
  toast.success('Producto creado exitosamente')
  navigate('/productos')
} catch (error) {
  // Manejar error específicamente aquí
  console.error('Error:', error)
  // El toast ya fue mostrado por el interceptor,
  // pero aquí podemos agregar lógica adicional
}
```

### Función `getErrorMessage()`

En `utils/logger.js` hay una función que extrae el mensaje de error:

```javascript
import { getErrorMessage } from '../utils/logger'

try {
  // ...
} catch (error) {
  const mensaje = getErrorMessage(error)
  toast.error(mensaje)
}
```

Extrae el mensaje del error en el siguiente orden:
1. `error.response.data.error.message` (mensaje del backend)
2. `error.response.data.message`
3. `error.message`
4. Mensaje genérico

---

## ESTADO GLOBAL

### AuthContext

El estado global se maneja con AuthContext. Cualquier componente puede acceder al usuario y funciones de autenticación:

```javascript
import { useAuth } from '../context/AuthContext'

function MiComponente() {
  const { user, signIn, signOut } = useAuth()
  
  return (
    <div>
      Hola {user?.nombre_usuario}
      <button onClick={signOut}>Logout</button>
    </div>
  )
}
```

**¿Qué proporciona AuthContext?**

```javascript
{
  user: {                    // Datos del usuario autenticado
    id_usuario: 1,
    correo_electronico: "admin@example.com",
    nombre_usuario: "Admin",
    nombre_rol: "administrador"
  },
  initializing: false,       // ¿Está cargando la autenticación?
  signIn: async ({ email, password }) => {...},     // Función para login
  signOut: async () => {...},                       // Función para logout
  refreshUser: async () => {...},                   // Recargar datos del usuario
}
```

---

## FLUJO COMPLETO: DE INICIO A FIN

### Escenario: Un vendedor crea una venta (recibo)

**1. Inicio**

```
Usuario abre http://localhost:5173/
AuthContext verifica localStorage
¿Hay token? Sí → va a /dashboard automáticamente
¿Hay token? No → muestra login
```

**2. Usuario hace click en "Recibos de Caja"**

```
React Router redirige a /recibos-de-caja
ProtectedRoute valida autenticación (tiene token)
RecibosDeCaja.jsx se carga y renderiza
```

**3. Usuario selecciona un cliente**

```
RecibosDeCaja.jsx renderiza SearchableSelect
Usuario escribe "Maria" en la búsqueda
SearchableSelect filtra clientes cuyo nombre contiene "Maria"
Usuario hace click en "Maria López"
setSelectedClient(3) actualiza el estado
Componente se re-renderiza
```

**4. Usuario selecciona productos**

```
Abre modal o tabla de productos disponibles
Para cada producto:
  - Hace click para seleccionar
  - Ingresa cantidad (ej: 2)
  - El precio unitario se carga de la BD
  - Sistema calcula subtotal automáticamente
El total se va actualizando en tiempo real
```

**5. Usuario selecciona método de pago**

```
Dropdown con opciones: Efectivo, Tarjeta, Transferencia
Usuario selecciona una
Se actualiza el estado del componente
```

**6. Usuario hace click en "Crear Recibo"**

```
RecibosDeCaja.jsx valida:
  - ¿Hay cliente seleccionado?
  - ¿Hay productos?
  - ¿Hay método de pago?

Si algo falta → muestra toast con error

Si todo está ok → llama a:
  recibosDeCajaService.create({
    id_cliente: 3,
    tipo_pago: "Efectivo",
    productos: [
      { id_producto: 1, cantidad: 2, precio_venta: 15000 },
      { id_producto: 5, cantidad: 1, precio_venta: 5000 }
    ]
  })
```

**7. Petición HTTP**

```
productService internamente ejecuta:
  api.post('/recibos-caja', {
    id_cliente: 3,
    tipo_pago: "Efectivo",
    productos: [...]
  })

Interceptor Request (api.js):
  - Lee token de localStorage
  - Agrega header: Authorization: Bearer [token]
  - Envía petición

Petición HTTP:
  POST http://localhost:3001/api/v1/recibos-caja
  Headers: {
    Authorization: Bearer eyJ...,
    Content-Type: application/json
  }
  Body: { id_cliente: 3, ... }
```

**8. Backend procesa**

```
Backend (/api/v1/recibos-caja):
  - Valida el token
  - Obtiene datos del cliente
  - Obtiene datos de cada producto
  - Calcula total
  - Crea registro en tabla recibos_caja
  - Crea registros en tabla detalle_recibos
  - Devuelve respuesta:
    {
      id_recibo: 107,
      id_cliente: 3,
      numero_recibo: "REC-20251214-107",
      total: 35000,
      fecha_creacion: "2025-12-14T14:30:00Z"
    }
```

**9. Respuesta llega al frontend**

```
Interceptor Response (api.js):
  - Verifica status (201 Created)
  - Registra en logs
  - Devuelve response.data al servicio

recibosDeCajaService devuelve los datos

RecibosDeCaja.jsx captura la respuesta:
  - toast.success("Recibo creado: REC-20251214-107")
  - Limpia el formulario
  - Espera 1-2 segundos
  - Recarga la lista de recibos
  - navigate a página de confirmación (opcional)
```

**10. Usuario ve el resultado**

```
Se muestra notificación verde: "Recibo creado"
El formulario se limpia
Si hay historial, aparece el nuevo recibo
```

---

## RESUMEN DE FLUJOS DE DATOS

### Lectura (GET)

```
Componente
    ↓
fetch/service call (productService.getAll())
    ↓
api.get('/endpoint')
    ↓
[Interceptor Request: agrega token]
    ↓
HTTP GET al backend
    ↓
Backend responde (JSON)
    ↓
[Interceptor Response: valida status]
    ↓
Servicio procesa y devuelve datos
    ↓
Componente recibe datos
    ↓
setState(datos)
    ↓
Re-render con datos nuevos
```

### Escritura (POST/PUT/DELETE)

```
Usuario interactúa (botón, formulario)
    ↓
Componente valida datos
    ↓
Service call (productService.create(datos))
    ↓
api.post('/endpoint', datos)
    ↓
[Interceptor Request: agrega token]
    ↓
HTTP POST al backend
    ↓
Backend valida y procesa
    ↓
Backend guarda en BD
    ↓
Backend devuelve respuesta
    ↓
[Interceptor Response: valida status]
    ↓
Servicio devuelve respuesta
    ↓
Componente muestra toast de éxito
    ↓
Componente redirige o recarga datos
```

---

## VARIABLE DE ENTORNO

En `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
```

Y en `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1'
})
```

Esto conecta al backend que corre en `http://localhost:3001`.

---

## CONCLUSIÓN

El frontend de PetShop es una aplicación completa construida con patrones modernos de React:

- **Componentes React**: Bloques reutilizables de interfaz
- **Hooks**: Gestión de estado y efectos
- **Contexto**: Estado global (autenticación)
- **Servicios**: Capa de comunicación con backend
- **Axios**: Cliente HTTP con interceptores
- **React Router**: Navegación entre páginas
- **localStorage**: Persistencia de sesión

Todos estos elementos trabajan juntos para crear una experiencia fluida donde:

1. Los datos se obtienen del backend
2. Se muestran en la UI
3. El usuario interactúa
4. Se envían cambios al backend
5. Se actualizan los datos en la UI

El flujo es **unidireccional y controlado**, lo que hace la aplicación predecible, mantenible y escalable.










2. Dashboard Actualizado
Ahora muestra datos dinámicos y reales:

Servidor Activo:

Verde - backend responde
Rojo - está offline
Base de Datos:

Azul si está conectada
Rojo si no responde
Rendimiento:

Muestra el tiempo de respuesta en ms
Evalúa: Excelente (<100ms), Bueno (<300ms), Moderado (<500ms), Lento (>500ms)
Ícono y color cambian según el rendimiento
Indicadores secundarios: Los badges también se actualizan:

"API REST Activa/Inactiva"
"Base de Datos Conectada/Desconectada"
"Autenticación JWT Activa/No Disponible"

