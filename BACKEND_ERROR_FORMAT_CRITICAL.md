# 🚨 FORMATO DE ERROR CRÍTICO - Backend PETSHOP

**PROBLEMA DETECTADO:** 5 de diciembre de 2025, 05:54 AM

---

## ❌ Error Actual del Backend

El backend está respondiendo así:

```json
{
  "code": "ERR_900",
  "message": "Validation error",
  "timestamp": "2025-12-05T05:54:44.290Z",
  "details": {...}
}
```

### Resultado:
- ✅ Status Code 500 correcto
- ❌ **Formato incorrecto**: Falta wrapper `error`
- ❌ Frontend muestra: "Error interno del servidor"
- ❌ Frontend NO puede extraer el mensaje específico

---

## ✅ Formato Correcto Requerido

**TODOS los errores DEBEN estar envueltos en un objeto `error`:**

```json
{
  "error": {
    "code": "ERR_900",
    "message": "Validation error",
    "timestamp": "2025-12-05T05:54:44.290Z",
    "details": {...}
  }
}
```

---

## 🔧 Cómo el Frontend Procesa Errores

### Interceptor de Axios (src/services/api.js):

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Frontend busca ESPECÍFICAMENTE esto:
    if (response?.data?.error) {  // ← DEBE existir esta propiedad
      const { code, message, field, details } = response.data.error;
      
      // Extrae mensaje específico
      // ...
    }
    
    // Si NO existe response.data.error, muestra mensaje genérico
    else if (response?.status >= 500) {
      toast.error('Error interno del servidor...');  // ← Lo que ves ahora
    }
  }
);
```

### Función getErrorMessage (src/utils/logger.js):

```javascript
export const getErrorMessage = (error) => {
  // Busca el wrapper "error"
  if (error?.response?.data?.error) {  // ← REQUIERE esta estructura
    const { code, message, details, field } = error.response.data.error;
    
    let msg = message || 'Error desconocido';
    
    // Traduce nombres de campos
    if (field) {
      const fieldLabel = fieldNames[field] || field;
      msg = `${fieldLabel}: ${msg}`;
    }
    
    return msg;
  }
  
  // Fallback genérico
  return 'Ha ocurrido un error inesperado';
};
```

---

## 📝 Checklist de Corrección Backend

### ✅ Middleware de Error (errorHandler.js)

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // ✅ CORRECTO: Wrapper "error"
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {  // ← Este wrapper es OBLIGATORIO
        code: err.code,
        message: err.message,
        timestamp: err.timestamp,
        ...(err.field && { field: err.field }),
        ...(err.details && { details: err.details })
      }
    });
  }

  // ✅ CORRECTO: Error de DB con wrapper
  if (err.code === '23505') {
    return res.status(409).json({
      error: {  // ← Este wrapper es OBLIGATORIO
        code: 'ERR_702',
        message: 'Este registro ya existe.',
        timestamp: new Date().toISOString()
      }
    });
  }

  // ✅ CORRECTO: Error genérico con wrapper
  res.status(500).json({
    error: {  // ← Este wrapper es OBLIGATORIO
      code: 'ERR_900',
      message: 'Error interno del servidor.',
      timestamp: new Date().toISOString()
    }
  });
};
```

### ✅ Clase ApiError (utils/ApiError.js)

```javascript
class ApiError extends Error {
  constructor(code, message, field = null, details = null, statusCode = 400) {
    super(message);
    this.code = code;
    this.field = field;
    this.details = details;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  // ✅ Método toJSON incluye wrapper "error"
  toJSON() {
    return {
      error: {  // ← Este wrapper es OBLIGATORIO
        code: this.code,
        message: this.message,
        timestamp: this.timestamp,
        ...(this.field && { field: this.field }),
        ...(this.details && { details: this.details })
      }
    };
  }
}

module.exports = ApiError;
```

### ✅ Respuestas en Controladores

```javascript
// ❌ INCORRECTO
res.status(404).json({
  code: 'ERR_200',
  message: 'Cliente no encontrado'
});

// ✅ CORRECTO
res.status(404).json({
  error: {
    code: 'ERR_200',
    message: 'Cliente no encontrado',
    timestamp: new Date().toISOString()
  }
});

// ✅ MEJOR: Usar ApiError.toJSON()
if (!client) {
  const apiError = new ApiError(
    'ERR_200',
    'Cliente no encontrado. Verifica el ID.',
    null,
    null,
    404
  );
  return res.status(apiError.statusCode).json(apiError.toJSON());
}

// ✅ IDEAL: Throw y dejar que errorHandler lo maneje
if (!client) {
  throw new ApiError(
    'ERR_200',
    'Cliente no encontrado. Verifica el ID.',
    null,
    null,
    404
  );
}
```

---

## 🧪 Testing del Formato

### Test con cURL:

```bash
# Debe responder con wrapper "error"
curl -X POST http://localhost:3001/api/v1/client \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"primer_nombre":"Test","primer_apellido":"Test","numero_documento":12345678}'

# Respuesta esperada:
{
  "error": {
    "code": "ERR_204",
    "message": "Este número de documento ya está registrado.",
    "field": "numero_documento",
    "timestamp": "2025-12-05T..."
  }
}
```

### Test con Postman:

1. Crear request POST a `/api/v1/client`
2. Body con datos duplicados
3. Verificar respuesta JSON:
   - ✅ Tiene propiedad `error` en raíz
   - ✅ `error.code` existe
   - ✅ `error.message` existe
   - ✅ Status code apropiado (400, 404, 409, 500)

---

## 📊 Ejemplos de Respuestas Correctas

### Error 400 - Validación

```json
{
  "error": {
    "code": "ERR_201",
    "message": "El primer nombre del cliente es obligatorio.",
    "field": "primer_nombre",
    "timestamp": "2025-12-05T10:30:00.000Z"
  }
}
```

### Error 404 - No Encontrado

```json
{
  "error": {
    "code": "ERR_200",
    "message": "Cliente no encontrado. Verifica el ID.",
    "timestamp": "2025-12-05T10:30:00.000Z"
  }
}
```

### Error 409 - Duplicado

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

### Error 500 - Servidor

```json
{
  "error": {
    "code": "ERR_900",
    "message": "Error interno del servidor.",
    "details": "Database connection failed",
    "timestamp": "2025-12-05T10:30:00.000Z"
  }
}
```

---

## ⚡ Solución Rápida

Si ya tienen código legacy sin el wrapper, pueden usar este middleware de transformación temporal:

```javascript
// middleware/errorTransformer.js
const errorTransformer = (err, req, res, next) => {
  // Si el error ya está en el formato antiguo sin wrapper
  if (res.statusCode >= 400 && res.headersSent === false) {
    const oldSend = res.json;
    
    res.json = function(data) {
      // Si no tiene wrapper "error", agregarlo
      if (data && !data.error && data.code) {
        data = { error: data };
      }
      
      return oldSend.call(this, data);
    };
  }
  
  next(err);
};

// Aplicar ANTES del errorHandler
app.use(errorTransformer);
app.use(errorHandler);
```

---

## 📞 Resumen para Backend

### Lo que DEBE cambiar INMEDIATAMENTE:

1. **Todos los errores** deben envolver el objeto en `{ error: { ... } }`
2. **Middleware errorHandler** debe usar este formato
3. **Clase ApiError.toJSON()** debe incluir el wrapper
4. **Respuestas manuales** en controladores deben seguir el formato

### Estructura exacta:

```javascript
// Siempre usar este formato:
res.status(statusCode).json({
  error: {
    code: 'ERR_XXX',
    message: 'Mensaje en español',
    timestamp: new Date().toISOString(),
    field: 'campo_opcional',      // solo si aplica
    details: 'info_adicional'     // solo si aplica
  }
});
```

### NO usar NUNCA:

```javascript
// ❌ Frontend no procesará esto
res.status(statusCode).json({
  code: 'ERR_XXX',
  message: 'Mensaje',
  timestamp: '...'
});
```

---

**Prioridad:** 🔴 CRÍTICA  
**Impacto:** Alto - Frontend no puede mostrar mensajes específicos  
**Tiempo estimado de corrección:** 30-60 minutos  
**Archivos a modificar:** errorHandler.js, ApiError.js, todos los controladores que devuelven errores

---

**Última actualización:** 5 de diciembre de 2025, 06:00 AM
