# 🔢 Tipos de Datos Exactos - Backend PETSHOP

**PROBLEMA COMÚN:** Backend recibe error 500 al crear cliente

**CAUSA:** Diferencia entre tipos de datos que envía el frontend vs lo que espera el backend

---

## 📊 Tipos de Datos por Endpoint

### 👥 Cliente - POST/PUT `/api/v1/client`

#### Request Body del Frontend:

```javascript
{
  "primer_nombre": "Juan",              // STRING
  "segundo_nombre": "Carlos",            // STRING | null
  "primer_apellido": "Pérez",           // STRING
  "segundo_apellido": "González",        // STRING | null
  "numero_documento": 12345678,          // INTEGER (sin comillas)
  "correo_electronico": "juan@mail.com", // STRING
  "numero_telefono": 3254788566,         // INTEGER (sin comillas)
  "id_tipo_documento": 1                 // INTEGER (sin comillas)
}
```

#### ⚠️ IMPORTANTE - Tipos Numéricos:

El frontend envía **números SIN comillas**:
- ✅ `"numero_documento": 12345678` (número)
- ❌ `"numero_documento": "12345678"` (string)

#### Validación Backend:

```javascript
// ❌ INCORRECTO - Asume que viene como string
const numero_documento = parseInt(req.body.numero_documento);

// ✅ CORRECTO - Ya viene como número
const numero_documento = req.body.numero_documento;

// ✅ MEJOR - Validar tipo
if (typeof req.body.numero_documento !== 'number') {
  throw new ApiError('ERR_804', 'El tipo de dato no es correcto.', 'numero_documento');
}
```

#### Schema de Validación (Joi/Yup):

```javascript
const clientSchema = Joi.object({
  primer_nombre: Joi.string().min(2).max(50).required(),
  segundo_nombre: Joi.string().min(2).max(50).allow(null, '').optional(),
  primer_apellido: Joi.string().min(2).max(50).required(),
  segundo_apellido: Joi.string().min(2).max(50).allow(null, '').optional(),
  numero_documento: Joi.number().integer().min(1).max(9999999999).required(),
  correo_electronico: Joi.string().email().max(100).required(),
  numero_telefono: Joi.number().integer().min(1000000).max(9999999999).required(),
  id_tipo_documento: Joi.number().integer().positive().required()
});
```

#### Query SQL (PostgreSQL):

```sql
INSERT INTO clientes (
  primer_nombre,
  segundo_nombre,
  primer_apellido,
  segundo_apellido,
  numero_documento,
  correo_electronico,
  numero_telefono,
  id_tipo_documento
) VALUES (
  $1,  -- STRING
  $2,  -- STRING | NULL
  $3,  -- STRING
  $4,  -- STRING | NULL
  $5,  -- INTEGER
  $6,  -- STRING
  $7,  -- BIGINT
  $8   -- INTEGER
)
```

---

### 📦 Producto - POST/PUT `/api/v1/product`

#### Request Body del Frontend:

```javascript
{
  "codigo_sku": "PROD-001",              // STRING
  "nombre": "Comida para perros",        // STRING
  "descripcion": "Alimento premium",     // STRING | null
  "stock": 50,                           // INTEGER (sin comillas)
  "precio_unitario": 25000,              // INTEGER o DECIMAL (sin comillas)
  "id_categoria": 1                      // INTEGER (sin comillas)
}
```

#### Schema de Validación:

```javascript
const productSchema = Joi.object({
  codigo_sku: Joi.string().max(50).required(),
  nombre: Joi.string().min(3).max(100).required(),
  descripcion: Joi.string().max(500).allow(null, '').optional(),
  stock: Joi.number().integer().min(0).required(),
  precio_unitario: Joi.number().min(0).required(),  // Acepta decimales
  id_categoria: Joi.number().integer().positive().required()
});
```

---

### 🧾 Recibo de Caja - POST `/api/v1/recibo-caja`

#### Request Body del Frontend:

```javascript
{
  "id_cliente": 45,                      // INTEGER
  "metodo_pago": "Efectivo",             // STRING ("Efectivo", "Tarjeta", "Transferencia")
  "detalles": [                          // ARRAY
    {
      "id_producto": 10,                 // INTEGER
      "cantidad": 2,                     // INTEGER
      "precio_unitario": 25000           // INTEGER o DECIMAL
    },
    {
      "id_producto": 15,
      "cantidad": 1,
      "precio_unitario": 75000
    }
  ]
}
```

#### Schema de Validación:

```javascript
const reciboSchema = Joi.object({
  id_cliente: Joi.number().integer().positive().required(),
  metodo_pago: Joi.string().valid('Efectivo', 'Tarjeta', 'Transferencia').required(),
  detalles: Joi.array().min(1).items(
    Joi.object({
      id_producto: Joi.number().integer().positive().required(),
      cantidad: Joi.number().integer().min(1).required(),
      precio_unitario: Joi.number().min(0).required()
    })
  ).required()
});
```

---

### 👤 Usuario - POST/PUT `/api/v1/user`

#### Request Body del Frontend:

```javascript
{
  "email": "nuevo@vetshop.com",          // STRING
  "nombre": "Nuevo Usuario",             // STRING
  "password": "password123",             // STRING
  "role_ids": [2, 3]                     // ARRAY de INTEGERS
}
```

#### Schema de Validación:

```javascript
const userSchema = Joi.object({
  email: Joi.string().email().max(100).required(),
  nombre: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(6).max(100).required(),
  role_ids: Joi.array().min(1).items(
    Joi.number().integer().positive()
  ).required()
});

// Para UPDATE, password es opcional
const userUpdateSchema = Joi.object({
  email: Joi.string().email().max(100).required(),
  nombre: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(6).max(100).optional(),
  role_ids: Joi.array().min(1).items(
    Joi.number().integer().positive()
  ).required()
});
```

---

## 🚨 Errores Comunes y Soluciones

### Error 1: "Cannot convert undefined to number"

**Causa:** Campo requerido falta en el body

```javascript
// ❌ PROBLEMA
const { numero_documento } = req.body;
// Si numero_documento no viene, es undefined

// ✅ SOLUCIÓN
if (!req.body.numero_documento) {
  throw new ApiError('ERR_203', 'El número de documento es obligatorio.', 'numero_documento');
}
```

### Error 2: "Invalid input syntax for integer"

**Causa:** Frontend envía número pero backend lo trata como string

```javascript
// ❌ PROBLEMA
const query = `INSERT INTO clientes (numero_documento) VALUES ('${numero_documento}')`;
// Genera: VALUES ('12345678') en vez de VALUES (12345678)

// ✅ SOLUCIÓN
const query = `INSERT INTO clientes (numero_documento) VALUES ($1)`;
const values = [numero_documento];  // Parametrizado, mantiene el tipo
```

### Error 3: "null value in column violates not-null constraint"

**Causa:** Frontend envía `null` o `""` para campos obligatorios

```javascript
// ✅ VALIDACIÓN
if (!primer_nombre || primer_nombre.trim() === '') {
  throw new ApiError('ERR_201', 'El primer nombre es obligatorio.', 'primer_nombre');
}

// Para campos opcionales
const segundo_nombre = req.body.segundo_nombre || null;
```

### Error 4: "value too long for type character varying(50)"

**Causa:** Frontend no valida longitud máxima

```javascript
// ✅ VALIDACIÓN BACKEND
if (primer_nombre.length > 50) {
  throw new ApiError('ERR_802', 'Uno o más campos exceden la longitud máxima.', 'primer_nombre');
}
```

---

## 📝 Middleware de Validación Recomendado

### Usando Joi:

```javascript
// middleware/validateRequest.js
const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,     // Validar todos los campos
      stripUnknown: true,    // Remover campos no definidos
      convert: false         // NO convertir tipos automáticamente
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: {
          code: 'ERR_801',
          message: 'El formato de los datos no es válido.',
          details: details,
          timestamp: new Date().toISOString()
        }
      });
    }

    req.body = value;  // Usar valor validado
    next();
  };
};

module.exports = validateRequest;
```

### Uso en Rutas:

```javascript
const validateRequest = require('../middleware/validateRequest');
const { clientSchema } = require('../validators/clientValidator');

router.post('/client', 
  authenticate,
  validateRequest(clientSchema),
  clientController.createClient
);
```

---

## 🔍 Debugging del Request

### Middleware de Logging:

```javascript
// middleware/requestLogger.js
const requestLogger = (req, res, next) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Body Types:');
  
  Object.entries(req.body).forEach(([key, value]) => {
    console.log(`  ${key}: ${typeof value} - ${value}`);
  });
  
  console.log('========================\n');
  next();
};

// Aplicar en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}
```

### Salida Esperada para Cliente:

```
=== INCOMING REQUEST ===
Method: POST
Path: /api/v1/client
Body: {
  "primer_nombre": "Juan",
  "segundo_nombre": "Carlos",
  "primer_apellido": "Pérez",
  "segundo_apellido": "González",
  "numero_documento": 12345678,
  "correo_electronico": "juan@mail.com",
  "numero_telefono": 3254788566,
  "id_tipo_documento": 1
}
Body Types:
  primer_nombre: string - Juan
  segundo_nombre: string - Carlos
  primer_apellido: string - Pérez
  segundo_apellido: string - González
  numero_documento: number - 12345678
  correo_electronico: string - juan@mail.com
  numero_telefono: number - 3254788566
  id_tipo_documento: number - 1
========================
```

---

## ✅ Checklist de Validación Backend

### Para cada endpoint POST/PUT:

- [ ] **Validar tipos de datos** con Joi/Yup o manualmente
- [ ] **Verificar campos requeridos** antes de procesar
- [ ] **Usar queries parametrizadas** para mantener tipos
- [ ] **Manejar valores null** correctamente para campos opcionales
- [ ] **Validar longitudes máximas** antes de INSERT
- [ ] **Convertir tipos solo cuando sea necesario** y de forma explícita
- [ ] **Loggear requests en desarrollo** para debugging
- [ ] **Responder con códigos de error apropiados**:
  - 400: Datos inválidos (ERR_801, ERR_804)
  - 409: Duplicados (ERR_204, ERR_211, ERR_302)
  - 404: No encontrado (ERR_200, ERR_300)
  - 500: Error interno (ERR_900)

---

## 🧪 Test de Tipos de Datos

### Usando cURL:

```bash
# Correcto: números sin comillas
curl -X POST http://localhost:3001/api/v1/client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "primer_nombre": "Juan",
    "primer_apellido": "Pérez",
    "numero_documento": 12345678,
    "correo_electronico": "juan@mail.com",
    "numero_telefono": 3254788566,
    "id_tipo_documento": 1
  }'

# Incorrecto: números como strings (puede causar error)
curl -X POST http://localhost:3001/api/v1/client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "primer_nombre": "Juan",
    "primer_apellido": "Pérez",
    "numero_documento": "12345678",
    "correo_electronico": "juan@mail.com",
    "numero_telefono": "3254788566",
    "id_tipo_documento": "1"
  }'
```

---

## 📊 Mapeo de Tipos: Frontend → Backend → Database

### Cliente:

| Campo | Frontend | Backend (Body) | Backend (Validado) | PostgreSQL |
|-------|----------|----------------|-------------------|------------|
| `primer_nombre` | string | string | string | VARCHAR(50) |
| `segundo_nombre` | string\|null | string\|null | string\|null | VARCHAR(50) NULL |
| `numero_documento` | **number** | **number** | **number** | INTEGER |
| `correo_electronico` | string | string | string | VARCHAR(100) |
| `numero_telefono` | **number** | **number** | **number** | BIGINT |
| `id_tipo_documento` | **number** | **number** | **number** | INTEGER (FK) |

### Producto:

| Campo | Frontend | Backend (Body) | Backend (Validado) | PostgreSQL |
|-------|----------|----------------|-------------------|------------|
| `codigo_sku` | string | string | string | VARCHAR(50) UNIQUE |
| `nombre` | string | string | string | VARCHAR(100) |
| `descripcion` | string\|null | string\|null | string\|null | TEXT NULL |
| `stock` | **number** | **number** | **number** | INTEGER |
| `precio_unitario` | **number** | **number** | **number** | DECIMAL(10,2) |
| `id_categoria` | **number** | **number** | **number** | INTEGER (FK) |

---

## 💡 Tips Finales

1. **NUNCA asumir tipos**: Siempre validar antes de usar
2. **Usar queries parametrizadas**: Mantienen tipos y previenen SQL injection
3. **Loggear en desarrollo**: Ver exactamente qué llega del frontend
4. **Validar en ambos lados**: Frontend para UX, Backend para seguridad
5. **Respuestas claras**: Usar códigos de error específicos con `field` indicado

---

**Última actualización:** 5 de diciembre de 2025
