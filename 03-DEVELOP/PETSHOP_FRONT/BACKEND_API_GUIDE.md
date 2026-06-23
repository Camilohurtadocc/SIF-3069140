# 📘 Guía de Integración Backend - PETSHOP VetShop 3.0

**Versión Frontend:** 3.0.3.1  
**Fecha:** 5 de diciembre de 2025  
**Base URL Esperada:** `http://localhost:3001/api/v1`

---

## 📋 Tabla de Contenidos

1. [Resumen General](#resumen-general)
2. [Estructura de Respuestas](#estructura-de-respuestas)
3. [Sistema de Códigos de Error](#sistema-de-códigos-de-error)
4. [Endpoints Requeridos](#endpoints-requeridos)
5. [Autenticación y Autorización](#autenticación-y-autorización)
6. [Validaciones Críticas](#validaciones-críticas)
7. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## Resumen General

### Frontend Espera:

- **Base URL:** `http://localhost:3001/api/v1`
- **Formato:** JSON para todas las peticiones y respuestas
- **Autenticación:** JWT Bearer Token en header `Authorization`
- **Códigos HTTP:** Estándares RESTful (200, 201, 400, 401, 404, 409, 500)
- **Respuestas:** Formato estandarizado con `error` object o `data` object

---

## 📤 Estructura de Respuestas

### Respuesta de Éxito

#### Operación Simple (POST, PUT, DELETE)
```json
{
  "success": true,
  "data": {
    "id": 123,
    "primer_nombre": "Juan",
    "primer_apellido": "Pérez"
  },
  "message": "Cliente creado exitosamente",
  "timestamp": "2025-12-05T10:30:00.000Z"
}
```

#### Respuesta Paginada (GET con paginación)
```json
{
  "data": [
    { "id": 1, "nombre": "Producto 1" },
    { "id": 2, "nombre": "Producto 2" }
  ],
  "pagination": {
    "totalCount": 150,
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2025-12-05T10:30:00.000Z"
}
```

### Respuesta de Error

```json
{
  "error": {
    "code": "ERR_204",
    "message": "Este número de documento ya está registrado.",
    "field": "numero_documento",
    "details": "Cliente existente con ID: 45",
    "timestamp": "2025-12-05T10:30:00.000Z"
  }
}
```

**IMPORTANTE: El objeto de error DEBE estar envuelto en una propiedad `error`**

INCORRECTO (Frontend no lo procesará):
```json
{
  "code": "ERR_204",
  "message": "Este número de documento ya está registrado.",
  "timestamp": "2025-12-05T10:30:00.000Z"
}
```

**CORRECTO:**
```json
{
  "error": {
    "code": "ERR_204",
    "message": "Este número de documento ya está registrado.",
    "timestamp": "2025-12-05T10:30:00.000Z"
  }
}
```

**Campos del Error:**
- `code` **(requerido)**: Código del catálogo (ej: "ERR_204")
- `message` **(requerido)**: Mensaje en español orientado al usuario
- `field` **(opcional)**: Nombre del campo BD que causó el error
- `details` **(opcional)**: Información técnica adicional
- `timestamp` **(opcional)**: ISO 8601 timestamp

---

## 🔢 Sistema de Códigos de Error

### Autenticación (ERR_001 - ERR_099)
| Código | Mensaje | Cuándo Usar |
|--------|---------|-------------|
| `ERR_001` | Credenciales inválidas | Login fallido |
| `ERR_002` | Usuario no encontrado | Email no existe en BD |
| `ERR_003` | Contraseña incorrecta | Password no coincide |
| `ERR_004` | Sesión expirada | Token JWT expirado |
| `ERR_005` | Token inválido | Token malformado o corrupto |
| `ERR_006` | Sin permisos | Usuario sin rol necesario |

### Usuarios (ERR_100 - ERR_199)
| Código | Mensaje | Cuándo Usar |
|--------|---------|-------------|
| `ERR_100` | Usuario no encontrado | GET/PUT/DELETE con ID inexistente |
| `ERR_101` | Email ya registrado | POST/PUT con email duplicado |
| `ERR_103` | Email inválido | Formato de email incorrecto |
| `ERR_104` | Contraseña muy corta | Password < 6 caracteres |
| `ERR_105` | Falta rol | No se seleccionó ningún rol |
| `ERR_106` | Rol inexistente | ID de rol no existe en BD |

### Clientes (ERR_200 - ERR_299)
| Código | Mensaje | Cuándo Usar |
|--------|---------|-------------|
| `ERR_200` | Cliente no encontrado | GET/PUT/DELETE con ID inexistente |
| `ERR_201` | Primer nombre requerido | Campo vacío |
| `ERR_202` | Primer apellido requerido | Campo vacío |
| `ERR_203` | Documento requerido | Campo vacío |
| `ERR_204` | **Documento duplicado** | Ya existe en BD |
| `ERR_205` | Email requerido | Campo vacío |
| `ERR_206` | Email inválido | Formato incorrecto |
| `ERR_207` | Teléfono requerido | Campo vacío |
| `ERR_208` | Teléfono inválido | Formato incorrecto |
| `ERR_209` | Tipo documento requerido | Campo vacío |
| `ERR_210` | Tipo documento inexistente | FK no existe |
| `ERR_211` | **Teléfono duplicado** | Ya existe en BD |
| `ERR_212` | **Correo duplicado** | Ya existe en BD |

### Productos (ERR_300 - ERR_399)
| Código | Mensaje | Cuándo Usar |
|--------|---------|-------------|
| `ERR_300` | Producto no encontrado | GET/PUT/DELETE con ID inexistente |
| `ERR_301` | SKU requerido | Campo vacío |
| `ERR_302` | **SKU duplicado** | Ya existe en BD |
| `ERR_303` | Nombre requerido | Campo vacío |
| `ERR_304` | Stock inválido | Stock < 0 |
| `ERR_305` | Precio inválido | Precio < 0 |
| `ERR_306` | Categoría requerida | Campo vacío |
| `ERR_307` | Categoría inexistente | FK no existe |
| `ERR_308` | Stock insuficiente | Venta > stock disponible |

### Categorías (ERR_400 - ERR_499)
| Código | Mensaje | Cuándo Usar |
|--------|---------|-------------|
| `ERR_400` | Categoría no encontrada | GET/PUT/DELETE con ID inexistente |
| `ERR_401` | Nombre requerido | Campo vacío |
| `ERR_402` | Nombre duplicado | Ya existe en BD |
| `ERR_403` | Categoría con productos | DELETE con productos asociados |

### Recibos de Caja (ERR_500 - ERR_599)
| Código | Mensaje | Cuándo Usar |
|--------|---------|-------------|
| `ERR_500` | Recibo no encontrado | GET/PUT/DELETE con ID inexistente |
| `ERR_501` | Cliente requerido | Campo vacío |
| `ERR_502` | Método pago requerido | Campo vacío |
| `ERR_503` | Productos requeridos | Array vacío |
| `ERR_504` | Cliente inexistente | FK no existe |
| `ERR_505` | Productos inexistentes | Uno o más IDs no existen |
| `ERR_506` | Stock insuficiente | Cantidad > stock |
| `ERR_507` | Error actualizando inventario | Fallo en UPDATE |
| `ERR_508` | Error generando número | Fallo en secuencia |

### Base de Datos (ERR_700 - ERR_799)
| Código | Mensaje | Cuándo Usar |
|--------|---------|-------------|
| `ERR_700` | Error de conexión | DB no responde |
| `ERR_702` | Error de integridad | Violación FK/UNIQUE |
| `ERR_704` | Error en transacción | ROLLBACK |

### Validación y Archivos (ERR_800 - ERR_899)
| Código | Mensaje | Cuándo Usar |
|--------|---------|-------------|
| `ERR_800` | Faltan datos obligatorios | Campos requeridos vacíos |
| `ERR_801` | No se proporcionó archivo | Upload sin archivo |
| `ERR_802` | Formato de imagen inválido | Tipo MIME no permitido |
| `ERR_803` | Archivo muy grande | Supera límite de tamaño |
| `ERR_804` | Tipo de dato incorrecto | String donde va número, etc |
| `ERR_805` | Fecha inválida | Formato de fecha incorrecto |
| `ERR_806` | Número inválido | Formato numérico incorrecto |

### Sistema (ERR_900 - ERR_999)
| Código | Mensaje | Cuándo Usar |
|--------|---------|-------------|
| `ERR_900` | Error interno | Catch genérico 500 |
| `ERR_901` | Servicio no disponible | DB/Cache down |

---

## 🔗 Endpoints Requeridos

### 🔐 Autenticación

#### `POST /api/v1/auth/login`
```javascript
// Request
{
  "email": "admin@vetshop.com",
  "password": "password123"
}

// Response 200 OK
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@vetshop.com",
      "nombre": "Administrador",
      "roles": ["admin"]
    }
  }
}

// Response 401 Unauthorized
{
  "error": {
    "code": "ERR_001",
    "message": "Credenciales inválidas. Verifica tu correo y contraseña."
  }
}
```

#### `GET /api/v1/auth/profile`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@vetshop.com",
    "nombre": "Administrador",
    "roles": [
      { "id": 1, "nombre": "admin" }
    ]
  }
}
```

---

### 👥 Clientes

#### `GET /api/v1/client?page=1&pageSize=10&search=juan`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "data": [
    {
      "id": 1,
      "primer_nombre": "Juan",
      "segundo_nombre": "Carlos",
      "primer_apellido": "Pérez",
      "segundo_apellido": "González",
      "numero_documento": 12345678,
      "correo_electronico": "juan@example.com",
      "numero_telefono": 555123456,
      "id_tipo_documento": 1,
      "tipo_documento": {
        "id": 1,
        "nombre": "Cédula"
      }
    }
  ],
  "pagination": {
    "totalCount": 150,
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### `POST /api/v1/client`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Request
{
  "primer_nombre": "Juan",
  "segundo_nombre": "Carlos",  // opcional
  "primer_apellido": "Pérez",
  "segundo_apellido": "González",  // opcional
  "numero_documento": 12345678,
  "correo_electronico": "juan@example.com",
  "numero_telefono": 555123456,
  "id_tipo_documento": 1
}

// Response 201 Created
{
  "success": true,
  "data": {
    "id": 45,
    "primer_nombre": "Juan",
    // ... resto de campos
  },
  "message": "Cliente creado exitosamente"
}

// Response 409 Conflict - Documento duplicado
{
  "error": {
    "code": "ERR_204",
    "message": "Este número de documento ya está registrado.",
    "field": "numero_documento",
    "details": "Cliente existente con ID: 23"
  }
}

// Response 409 Conflict - Teléfono duplicado
{
  "error": {
    "code": "ERR_211",
    "message": "Este número de teléfono ya está registrado.",
    "field": "numero_telefono",
    "details": "Pertenece a: Juan Pérez"
  }
}

// Response 409 Conflict - Correo duplicado
{
  "error": {
    "code": "ERR_212",
    "message": "Este correo electrónico ya está registrado.",
    "field": "correo_electronico",
    "details": "Pertenece a: Juan Pérez"
  }
}
```

#### `GET /api/v1/client/:id`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "success": true,
  "data": {
    "id": 45,
    "primer_nombre": "Juan",
    // ... campos completos
  }
}

// Response 404 Not Found
{
  "error": {
    "code": "ERR_200",
    "message": "Cliente no encontrado. Verifica el ID."
  }
}
```

#### `PUT /api/v1/client/:id`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Request (mismo formato que POST)
// Response 200 OK (mismo formato que GET)
// Errors 404, 409 (documentos/teléfonos duplicados)
```

#### `DELETE /api/v1/client/:id`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "success": true,
  "message": "Cliente eliminado exitosamente"
}

// Response 404 Not Found
{
  "error": {
    "code": "ERR_200",
    "message": "Cliente no encontrado. Verifica el ID."
  }
}
```

---

### 📦 Productos

#### `GET /api/v1/product?page=1&pageSize=10&search=comida`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "data": [
    {
      "id": 1,
      "codigo_sku": "PROD-001",
      "nombre": "Comida para perros",
      "descripcion": "Alimento premium",
      "stock": 50,
      "precio_unitario": 25000,
      "id_categoria": 1,
      "categoria": {
        "id": 1,
        "nombre": "Alimentos"
      }
    }
  ],
  "pagination": { /* ... */ }
}
```

#### `POST /api/v1/product`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Request
{
  "codigo_sku": "PROD-001",
  "nombre": "Comida para perros",
  "descripcion": "Alimento premium",  // opcional
  "stock": 50,
  "precio_unitario": 25000,
  "id_categoria": 1
}

// Response 201 Created
{
  "success": true,
  "data": {
    "id": 123,
    "codigo_sku": "PROD-001",
    // ... resto de campos
  },
  "message": "Producto creado exitosamente"
}

// Response 409 Conflict - SKU duplicado
{
  "error": {
    "code": "ERR_302",
    "message": "Este código SKU ya está registrado.",
    "field": "codigo_sku",
    "details": "Producto existente con ID: 45"
  }
}

// Response 404 Not Found - Categoría no existe
{
  "error": {
    "code": "ERR_307",
    "message": "La categoría seleccionada no existe.",
    "field": "id_categoria"
  }
}
```

#### `PUT /api/v1/product/:id`
#### `DELETE /api/v1/product/:id`
**Similar a clientes**

---

### 🏷️ Categorías

#### `GET /api/v1/category`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "data": [
    { "id": 1, "nombre": "Alimentos" },
    { "id": 2, "nombre": "Juguetes" },
    { "id": 3, "nombre": "Medicamentos" }
  ]
}
```

#### `POST /api/v1/category`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Request
{
  "nombre": "Accesorios"
}

// Response 201 Created
{
  "success": true,
  "data": {
    "id": 4,
    "nombre": "Accesorios"
  }
}

// Response 409 Conflict - Nombre duplicado
{
  "error": {
    "code": "ERR_402",
    "message": "Este nombre de categoría ya existe.",
    "field": "nombre"
  }
}
```

#### `DELETE /api/v1/category/:id`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 409 Conflict - Tiene productos
{
  "error": {
    "code": "ERR_403",
    "message": "No se puede eliminar una categoría con productos asociados.",
    "details": "5 productos asociados a esta categoría"
  }
}
```

---

### 📤 Upload de Imágenes

#### `POST /api/v1/upload/product`
**Headers:** 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Descripción:** Sube una imagen para productos y retorna la URL donde quedó almacenada.

```javascript
// Request (multipart/form-data)
FormData:
  image: [File] // Archivo de imagen (JPG, PNG, GIF, WEBP)

// Response 201 Created
{
  "success": true,
  "data": {
    "url": "/uploads/products/1733395200000_producto.jpg"
  },
  "message": "Imagen subida exitosamente"
}

// Response 400 Bad Request - Sin archivo
{
  "error": {
    "code": "ERR_801",
    "message": "No se proporcionó ningún archivo.",
    "field": "image"
  }
}

// Response 400 Bad Request - Formato inválido
{
  "error": {
    "code": "ERR_802",
    "message": "Formato de imagen no válido. Solo se permiten JPG, PNG, GIF, WEBP.",
    "field": "image"
  }
}

// Response 413 Payload Too Large - Archivo muy grande
{
  "error": {
    "code": "ERR_803",
    "message": "El archivo es demasiado grande. Máximo: 5MB.",
    "field": "image"
  }
}
```

**Notas de Implementación:**
- Usar biblioteca como `multer` (Node.js) IMPLEMENTADO
- Validar tipo MIME: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Validar tamaño máximo: 5MB
- Generar nombre único: `${Date.now()}_${filename}`
- Almacenar en carpeta `./uploads/products/`
- Retornar URL relativa: `/uploads/products/nombrearchivo.jpg`
- Archivos estáticos servidos en `http://localhost:3001/uploads/`

**Ejemplo con Multer (Node.js):**
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/products/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new ApiError('ERR_802', 'Formato de imagen no válido.', 'image', null, 400));
    }
  }
});

router.post('/upload/image', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    throw new ApiError('ERR_801', 'No se proporcionó ningún archivo.', 'image', null, 400);
  }
  
  const url = `/uploads/products/${req.file.filename}`;
  // O URL completa: `${process.env.BASE_URL}/uploads/products/${req.file.filename}`
  
  res.status(201).json({
    success: true,
    data: { url },
    message: 'Imagen subida exitosamente'
  });
});
```

---

### 👤 Usuarios

#### `GET /api/v1/user?page=1&pageSize=10`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "data": [
    {
      "id": 1,
      "email": "admin@vetshop.com",
      "nombre": "Administrador",
      "roles": [
        { "id": 1, "nombre": "admin" }
      ]
    }
  ],
  "pagination": { /* ... */ }
}
```

#### `POST /api/v1/user`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Request
{
  "email": "nuevo@vetshop.com",
  "nombre": "Nuevo Usuario",
  "password": "password123",
  "role_ids": [2]  // Array de IDs de roles
}

// Response 201 Created
{
  "success": true,
  "data": {
    "id": 10,
    "email": "nuevo@vetshop.com",
    "nombre": "Nuevo Usuario",
    "roles": [
      { "id": 2, "nombre": "cajero" }
    ]
  }
}

// Response 409 Conflict - Email duplicado
{
  "error": {
    "code": "ERR_101",
    "message": "Este correo electrónico ya está registrado.",
    "field": "email"
  }
}

// Response 400 Bad Request - Password muy corto
{
  "error": {
    "code": "ERR_104",
    "message": "La contraseña debe tener al menos 6 caracteres.",
    "field": "password"
  }
}
```

#### `PUT /api/v1/user/:id`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Request (password es opcional en UPDATE)
{
  "email": "actualizado@vetshop.com",
  "nombre": "Nombre Actualizado",
  "password": "newpassword123",  // opcional
  "role_ids": [1, 2]
}

// Response similar a POST
```

---

### 🧾 Recibos de Caja

#### `GET /api/v1/recibo-caja?page=1&pageSize=10&startDate=2025-12-01&endDate=2025-12-31`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "data": [
    {
      "id": 1,
      "numero_recibo": "RC-2025-001",
      "fecha": "2025-12-05T10:30:00.000Z",
      "total": 125000,
      "metodo_pago": "Efectivo",
      "id_cliente": 45,
      "id_usuario": 1,
      "cliente": {
        "id": 45,
        "primer_nombre": "Juan",
        "primer_apellido": "Pérez"
      },
      "detalles": [
        {
          "id": 1,
          "id_producto": 10,
          "cantidad": 2,
          "precio_unitario": 25000,
          "subtotal": 50000,
          "producto": {
            "id": 10,
            "nombre": "Comida para perros"
          }
        }
      ]
    }
  ],
  "pagination": { /* ... */ }
}
```

#### `POST /api/v1/recibo-caja`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Request
{
  "id_cliente": 45,
  "metodo_pago": "Efectivo",  // "Efectivo", "Tarjeta", "Transferencia"
  "detalles": [
    {
      "id_producto": 10,
      "cantidad": 2,
      "precio_unitario": 25000
    },
    {
      "id_producto": 15,
      "cantidad": 1,
      "precio_unitario": 75000
    }
  ]
}

// Response 201 Created
{
  "success": true,
  "data": {
    "id": 100,
    "numero_recibo": "RC-2025-100",
    "total": 125000,
    // ... resto de campos
  },
  "message": "Recibo de caja creado exitosamente"
}

// Response 400 Bad Request - Stock insuficiente
{
  "error": {
    "code": "ERR_506",
    "message": "Stock insuficiente para completar la venta.",
    "details": "Producto 'Comida para perros': stock disponible 1, solicitado 2"
  }
}

// Response 404 Not Found - Cliente no existe
{
  "error": {
    "code": "ERR_504",
    "message": "El cliente seleccionado no existe.",
    "field": "id_cliente"
  }
}
```

---

### 📊 Cierres de Caja

#### `GET /api/v1/cierre-caja?page=1&pageSize=10`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "data": [
    {
      "id": 1,
      "tipo_periodo": "diario",  // "diario", "semanal", "mensual"
      "fecha_referencia": "2025-12-05",
      "fecha_inicio": "2025-12-05T00:00:00.000Z",
      "fecha_fin": "2025-12-05T23:59:59.999Z",
      "total_ventas": 1250000,
      "cantidad_recibos": 15,
      "id_usuario": 1,
      "usuario": {
        "id": 1,
        "nombre": "Administrador"
      }
    }
  ],
  "pagination": { /* ... */ }
}
```

#### `POST /api/v1/cierre-caja`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Request
{
  "tipo_periodo": "diario",  // "diario", "semanal", "mensual"
  "fecha_referencia": "2025-12-05"  // YYYY-MM-DD
}

// Response 201 Created
{
  "success": true,
  "data": {
    "id": 10,
    "tipo_periodo": "diario",
    "fecha_inicio": "2025-12-05T00:00:00.000Z",
    "fecha_fin": "2025-12-05T23:59:59.999Z",
    "total_ventas": 1250000,
    "cantidad_recibos": 15
  }
}

// Response 409 Conflict - Ya existe cierre
{
  "error": {
    "code": "ERR_607",
    "message": "Ya existe un cierre para este período.",
    "details": "Cierre ID: 8 para el día 2025-12-05"
  }
}

// Response 400 Bad Request - Sin recibos
{
  "error": {
    "code": "ERR_608",
    "message": "No hay recibos de caja en el período seleccionado."
  }
}
```

---

### 📊 Historial de Recibos de Caja

#### `GET /api/v1/historial-recibos?startDate=2025-12-01&endDate=2025-12-31&id_cliente=45`
**Headers:** `Authorization: Bearer {token}`

```javascript
// Response 200 OK
{
  "data": [
    {
      "id": 1,
      "numero_recibo": "RC-2025-001",
      "fecha": "2025-12-05T10:30:00.000Z",
      "total": 125000,
      "metodo_pago": "Efectivo",
      "cliente": {
        "id": 45,
        "primer_nombre": "Juan",
        "primer_apellido": "Pérez"
      },
      "usuario": {
        "id": 1,
        "nombre": "Administrador"
      }
    }
  ]
}
```

---

## 🔐 Autenticación y Autorización

### JWT Token

**El frontend envía:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Payload del JWT debe incluir:**
```json
{
  "userId": 1,
  "email": "admin@vetshop.com",
  "roles": ["admin"],
  "iat": 1733395200,
  "exp": 1733481600
}
```

### Respuestas de Autenticación

#### Token Expirado (401)
```json
{
  "error": {
    "code": "ERR_004",
    "message": "Sesión expirada. Inicia sesión nuevamente."
  }
}
```

#### Token Inválido (401)
```json
{
  "error": {
    "code": "ERR_005",
    "message": "Token de autenticación inválido."
  }
}
```

#### Sin Permisos (403)
```json
{
  "error": {
    "code": "ERR_006",
    "message": "No tienes permiso para acceder a este recurso.",
    "details": "Se requiere rol: admin"
  }
}
```

---

## Validaciones Críticas

### Clientes

#### Validación de Documento Duplicado
```sql
-- Verificar antes de INSERT
SELECT id, primer_nombre, primer_apellido 
FROM clientes 
WHERE numero_documento = :numero_documento;

-- Si existe → Error ERR_204
```

#### Validación de Teléfono Duplicado
```sql
-- Verificar antes de INSERT
SELECT id, primer_nombre, primer_apellido 
FROM clientes 
WHERE numero_telefono = :numero_telefono;

-- Si existe → Error ERR_211
```

#### Validación de Correo Duplicado
```sql
-- Verificar antes de INSERT
SELECT id, primer_nombre, primer_apellido 
FROM clientes 
WHERE correo_electronico = :correo_electronico;

-- Si existe → Error ERR_212
```

#### Validación en UPDATE
```sql
-- Verificar que no exista en OTRO cliente
SELECT id FROM clientes 
WHERE numero_documento = :numero_documento 
AND id != :id_cliente_actual;

-- Si existe → Error ERR_204
```

### Productos

#### Validación de SKU Duplicado
```sql
SELECT id, nombre FROM productos 
WHERE codigo_sku = :codigo_sku;

-- Si existe → Error ERR_302
```

#### Validación de Stock en Venta
```sql
-- Antes de crear recibo de caja
SELECT stock FROM productos WHERE id = :id_producto;

-- Si stock < cantidad_solicitada → Error ERR_506
```

### Usuarios

#### Validación de Email Duplicado
```sql
SELECT id, nombre FROM usuarios 
WHERE email = :email;

-- Si existe → Error ERR_101
```

---

## Ejemplos de Implementación

### Node.js/Express - Clase de Error Personalizada

```javascript
// utils/ApiError.js
class ApiError extends Error {
  constructor(code, message, field = null, details = null, statusCode = 400) {
    super(message);
    this.code = code;
    this.field = field;
    this.details = details;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    const error = {
      code: this.code,
      message: this.message,
      timestamp: this.timestamp
    };

    if (this.field) error.field = this.field;
    if (this.details) error.details = this.details;

    return { error };
  }
}

module.exports = ApiError;
```

### Middleware de Manejo de Errores

```javascript
// middleware/errorHandler.js
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Si es un ApiError, responder con formato estándar
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Error de base de datos - violación de unique constraint
  if (err.code === '23505') {  // PostgreSQL unique violation
    return res.status(409).json({
      error: {
        code: 'ERR_702',
        message: 'Este registro ya existe.',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Error genérico
  res.status(500).json({
    error: {
      code: 'ERR_900',
      message: 'Error interno del servidor.',
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
```

**NOTA CRITICA:** Todos los errores DEBEN estar envueltos en `{ error: { ... } }`. El frontend busca específicamente `response.data.error` y NO procesará errores sin este wrapper.

### Controlador de Clientes - Ejemplo Completo

```javascript
// controllers/clientController.js
const ApiError = require('../utils/ApiError');
const Client = require('../models/Client');

exports.createClient = async (req, res, next) => {
  try {
    const {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      numero_documento,
      correo_electronico,
      numero_telefono,
      id_tipo_documento
    } = req.body;

    // 1. Validar campos requeridos
    if (!primer_nombre) {
      throw new ApiError(
        'ERR_201',
        'El primer nombre del cliente es obligatorio.',
        'primer_nombre',
        null,
        400
      );
    }

    if (!primer_apellido) {
      throw new ApiError(
        'ERR_202',
        'El primer apellido del cliente es obligatorio.',
        'primer_apellido',
        null,
        400
      );
    }

    if (!numero_documento) {
      throw new ApiError(
        'ERR_203',
        'El número de documento es obligatorio.',
        'numero_documento',
        null,
        400
      );
    }

    // 2. Validar documento duplicado
    const existingDoc = await Client.findByDocumento(numero_documento);
    if (existingDoc) {
      throw new ApiError(
        'ERR_204',
        'Este número de documento ya está registrado.',
        'numero_documento',
        `Cliente existente: ${existingDoc.primer_nombre} ${existingDoc.primer_apellido} (ID: ${existingDoc.id})`,
        409
      );
    }

    // 3. Validar teléfono duplicado
    const existingPhone = await Client.findByTelefono(numero_telefono);
    if (existingPhone) {
      throw new ApiError(
        'ERR_211',
        'Este número de teléfono ya está registrado.',
        'numero_telefono',
        `Pertenece a: ${existingPhone.primer_nombre} ${existingPhone.primer_apellido}`,
        409
      );
    }

    // 4. Validar correo duplicado
    const existingEmail = await Client.findByEmail(correo_electronico);
    if (existingEmail) {
      throw new ApiError(
        'ERR_212',
        'Este correo electrónico ya está registrado.',
        'correo_electronico',
        `Pertenece a: ${existingEmail.primer_nombre} ${existingEmail.primer_apellido}`,
        409
      );
    }

    // 5. Validar que el tipo de documento existe
    const tipoDoc = await TipoDocumento.findById(id_tipo_documento);
    if (!tipoDoc) {
      throw new ApiError(
        'ERR_210',
        'El tipo de documento seleccionado no existe.',
        'id_tipo_documento',
        null,
        404
      );
    }

    // 6. Crear cliente
    const newClient = await Client.create({
      primer_nombre,
      segundo_nombre: segundo_nombre || null,
      primer_apellido,
      segundo_apellido: segundo_apellido || null,
      numero_documento,
      correo_electronico,
      numero_telefono,
      id_tipo_documento
    });

    // 7. Respuesta exitosa
    res.status(201).json({
      success: true,
      data: newClient,
      message: 'Cliente creado exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);  // Pasar al middleware de errores
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { numero_documento, numero_telefono } = req.body;

    // 1. Verificar que el cliente existe
    const client = await Client.findById(id);
    if (!client) {
      throw new ApiError(
        'ERR_200',
        'Cliente no encontrado. Verifica el ID.',
        null,
        null,
        404
      );
    }

    // 2. Validar documento duplicado (excluyendo el cliente actual)
    if (numero_documento) {
      const existingDoc = await Client.findByDocumento(numero_documento);
      if (existingDoc && existingDoc.id != id) {
        throw new ApiError(
          'ERR_204',
          'Este número de documento ya está registrado.',
          'numero_documento',
          `Cliente existente con ID: ${existingDoc.id}`,
          409
        );
      }
    }

    // 3. Validar teléfono duplicado (excluyendo el cliente actual)
    if (numero_telefono) {
      const existingPhone = await Client.findByTelefono(numero_telefono);
      if (existingPhone && existingPhone.id != id) {
        throw new ApiError(
          'ERR_211',
          'Este número de teléfono ya está registrado.',
          'numero_telefono',
          `Pertenece a cliente ID: ${existingPhone.id}`,
          409
        );
      }
    }

    // 4. Validar correo duplicado (excluyendo el cliente actual)
    if (correo_electronico) {
      const existingEmail = await Client.findByEmail(correo_electronico);
      if (existingEmail && existingEmail.id != id) {
        throw new ApiError(
          'ERR_212',
          'Este correo electrónico ya está registrado.',
          'correo_electronico',
          `Pertenece a cliente ID: ${existingEmail.id}`,
          409
        );
      }
    }

    // 5. Actualizar cliente
    const updatedClient = await Client.update(id, req.body);

    // 6. Respuesta exitosa
    res.status(200).json({
      success: true,
      data: updatedClient,
      message: 'Cliente actualizado exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};
```

### Controlador de Productos

```javascript
// controllers/productController.js
const ApiError = require('../utils/ApiError');
const Product = require('../models/Product');

exports.createProduct = async (req, res, next) => {
  try {
    const { codigo_sku, nombre, stock, precio_unitario, id_categoria } = req.body;

    // 1. Validar SKU requerido
    if (!codigo_sku) {
      throw new ApiError(
        'ERR_301',
        'El código SKU del producto es obligatorio.',
        'codigo_sku',
        null,
        400
      );
    }

    // 2. Validar SKU duplicado
    const existingSKU = await Product.findBySKU(codigo_sku);
    if (existingSKU) {
      throw new ApiError(
        'ERR_302',
        'Este código SKU ya está registrado.',
        'codigo_sku',
        `Producto existente: ${existingSKU.nombre} (ID: ${existingSKU.id})`,
        409
      );
    }

    // 3. Validar categoría existe
    const categoria = await Category.findById(id_categoria);
    if (!categoria) {
      throw new ApiError(
        'ERR_307',
        'La categoría seleccionada no existe.',
        'id_categoria',
        null,
        404
      );
    }

    // 4. Validar stock >= 0
    if (stock < 0) {
      throw new ApiError(
        'ERR_304',
        'El stock debe ser un número mayor o igual a 0.',
        'stock',
        null,
        400
      );
    }

    // 5. Crear producto
    const newProduct = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Producto creado exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};
```

### Controlador de Recibos de Caja

```javascript
// controllers/reciboController.js
exports.createRecibo = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id_cliente, metodo_pago, detalles } = req.body;

    // 1. Validar cliente existe
    const cliente = await Client.findById(id_cliente);
    if (!cliente) {
      throw new ApiError(
        'ERR_504',
        'El cliente seleccionado no existe.',
        'id_cliente',
        null,
        404
      );
    }

    // 2. Validar productos y stock
    let total = 0;
    for (const detalle of detalles) {
      const producto = await Product.findById(detalle.id_producto);
      
      if (!producto) {
        throw new ApiError(
          'ERR_505',
          'Uno o más productos no existen.',
          'detalles',
          `Producto ID ${detalle.id_producto} no encontrado`,
          404
        );
      }

      if (producto.stock < detalle.cantidad) {
        throw new ApiError(
          'ERR_506',
          'Stock insuficiente para completar la venta.',
          'detalles',
          `Producto '${producto.nombre}': stock disponible ${producto.stock}, solicitado ${detalle.cantidad}`,
          400
        );
      }

      total += detalle.cantidad * detalle.precio_unitario;
    }

    // 3. Crear recibo
    const recibo = await Recibo.create({
      id_cliente,
      id_usuario: req.user.id,  // Del JWT
      metodo_pago,
      total,
      fecha: new Date()
    }, connection);

    // 4. Crear detalles y actualizar stock
    for (const detalle of detalles) {
      await ReciboDetalle.create({
        id_recibo: recibo.id,
        ...detalle
      }, connection);

      await Product.decrementStock(
        detalle.id_producto,
        detalle.cantidad,
        connection
      );
    }

    await connection.commit();

    // 5. Obtener recibo completo con relaciones
    const reciboCompleto = await Recibo.findByIdWithDetails(recibo.id);

    res.status(201).json({
      success: true,
      data: reciboCompleto,
      message: 'Recibo de caja creado exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
```

---

## 🧪 Testing

### Herramientas Recomendadas

- **Postman/Insomnia:** Para pruebas manuales
- **Jest/Mocha:** Para tests automatizados
- **Supertest:** Para tests de integración

### Casos de Prueba Críticos

#### 1. Cliente con Documento Duplicado
```
POST /api/v1/client
Body: { numero_documento: 12345678, ... }

Expected:
- Status: 409 Conflict
- Body.error.code: "ERR_204"
- Body.error.field: "numero_documento"
```

#### 2. Cliente con Teléfono Duplicado
```
POST /api/v1/client
Body: { numero_telefono: 555123456, ... }

Expected:
- Status: 409 Conflict
- Body.error.code: "ERR_211"
- Body.error.field: "numero_telefono"
```

#### 3. Producto con SKU Duplicado
```
POST /api/v1/product
Body: { codigo_sku: "PROD-001", ... }

Expected:
- Status: 409 Conflict
- Body.error.code: "ERR_302"
- Body.error.field: "codigo_sku"
```

#### 4. Venta sin Stock Suficiente
```
POST /api/v1/recibo-caja
Body: { detalles: [{ id_producto: 1, cantidad: 100 }] }
(Producto solo tiene stock: 5)

Expected:
- Status: 400 Bad Request
- Body.error.code: "ERR_506"
- Body.error.details: "stock disponible 5, solicitado 100"
```

---

## 📞 Contacto y Soporte

**Equipo Frontend:** PETSHOP VetShop v3.0.3.1

**Documentos Relacionados:**
- `/src/services/errorCodes.js` - Catálogo completo de códigos
- `/src/services/api.js` - Configuración de axios y interceptores
- `/src/utils/logger.js` - Sistema de logging

**Notas Importantes:**
- Todos los endpoints requieren autenticación JWT excepto `/auth/login`
- Las fechas deben estar en formato ISO 8601
- Los números de teléfono y documento son numéricos (INTEGER)
- El campo `field` en errores debe usar nombres de columnas de BD

---

**Última actualización:** 5 de diciembre de 2025
