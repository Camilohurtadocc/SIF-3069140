# Mejoras al Sistema de Manejo de Errores y Logging

## Resumen de Cambios

Se ha implementado un sistema completo y profesional de manejo de errores y logging en toda la aplicación PETSHOP, mejorando significativamente la experiencia de debugging y la claridad de los mensajes de error para los usuarios.

---

## Nuevas Características

### 1. Sistema de Logging Profesional (src/utils/logger.js)

Se creó un sistema de logging profesional con múltiples niveles:

#### Niveles de Log:
- **ERROR** - Siempre visible, muestra errores críticos con stack trace completo
- **WARN** - Advertencias en desarrollo
- **INFO** - Información general en desarrollo
- **DEBUG** - Debugging detallado solo en desarrollo
- **SUCCESS** - Confirmaciones de operaciones exitosas

#### Características:
- Timestamps en formato ISO 8601
- Contexto automático (nombre del módulo/componente)
- Agrupación de logs relacionados
- Detección automática del entorno (desarrollo/producción)
- Medición de tiempo de ejecución de funciones

#### Funciones Principales:

```javascript
// Logs de error con contexto completo
logger.error('ComponentName', 'Error description', errorObject)

// Logs informativos (solo desarrollo)
logger.info('ComponentName', 'Operation started', dataObject)

// Logs de éxito
logger.success('ComponentName', 'Operation completed successfully')

// Agrupación de logs
logger.group('Group Name', () => {
  logger.info('...', '...')
  logger.debug('...', '...')
})

// Medición de tiempo
await logger.time('Operation', async () => {
  // código a medir
})

// Extracción de mensajes de error
const message = getErrorMessage(error)
```

---

### 2. Códigos de Error Ampliados (src/services/errorCodes.js)

Se mejoraron y ampliaron los códigos de error con descripciones más detalladas y claras en español:

#### Nuevos Códigos Añadidos:
- ERR_108: Nombre de usuario requerido
- ERR_109: Longitud de nombre de usuario inválida
- ERR_308: Stock insuficiente
- ERR_309: Cantidad excede stock disponible
- ERR_403: No se puede eliminar categoría con productos
- ERR_509: Cantidad debe ser mayor a 0
- ERR_510: Total del recibo debe ser mayor a 0
- ERR_805: Fecha inválida
- ERR_806: Número inválido
- ERR_906: Solicitud rechazada
- ERR_907: Operación no permitida

#### Mensajes Mejorados:
Todos los mensajes ahora son más directos y claros:

**Antes:**
```javascript
ERR_201: 'Primer nombre requerido'
```

**Ahora:**
```javascript
ERR_201: 'El primer nombre del cliente es obligatorio.'
```

---

### 3. API Interceptor Mejorado (src/services/api.js)

El interceptor de Axios ahora incluye:

- Logging automático de todas las peticiones
- Logging detallado de errores con contexto
- Tabla formateada de errores del backend (solo desarrollo)
- Detección inteligente de tipo de error (4xx, 5xx, red)
- Mensajes personalizados según el código de error
- Log de configuración de peticiones fallidas

#### Ejemplo de Log de Error:
```
[2025-12-04T14:32:15.234Z] ERROR - API
Request failed: POST /api/v1/client
├─ HTTP Status: 400
├─ Request data: {...}
└─ Response: {...}

Backend Error Details
┌─────────────┬────────────────────────┐
│ Code        │ ERR_204                │
│ Message     │ Número ya registrado   │
│ Field       │ numero_documento       │
│ HTTP Status │ 400                    │
└─────────────┴────────────────────────┘
```

---

## Archivos Actualizados

### Páginas Principales:
1. src/pages/CrearCliente.jsx
2. src/pages/EditarCliente.jsx
3. src/pages/Clientes.jsx
4. src/pages/CrearUsuario.jsx
5. src/pages/ActualizarUsuario.jsx
6. src/pages/Usuarios.jsx
7. src/pages/Categorias.jsx
8. src/pages/CrearProducto.jsx
9. src/pages/ModificarProducto.jsx
10. src/pages/Inventario.jsx

### Servicios:
- src/services/api.js
- src/services/errorCodes.js

### Nuevos Archivos:
- src/utils/logger.js

---

## Beneficios

### Para Desarrolladores:
1. Debugging más rápido con logs detallados con contexto
2. Trazabilidad completa con stack traces y datos de peticiones
3. Medición de rendimiento con logger.time()
4. Agrupación lógica de logs relacionados

### Para Usuarios:
1. Mensajes claros y descriptivos en español
2. Instrucciones útiles sobre qué hacer
3. Menos frustración con errores comprensibles

---

## Ejemplos de Uso

### Antes:
```javascript
try {
  await clientService.create(payload)
  toast.success('Cliente creado')
} catch (err) {
  console.error(err)
  toast.error('Error creando cliente: ' + err.message)
}
```

### Ahora:
```javascript
try {
  logger.info('CrearCliente', 'Creating new client', payload)
  await clientService.create(payload)
  logger.success('CrearCliente', `Client ${nombre} created successfully`)
  toast.success('Cliente creado exitosamente')
} catch (err) {
  logger.error('CrearCliente', 'Error creating client', err)
  toast.error(getErrorMessage(err))
}
```

---

## Patrones de Implementación

### 1. Importar el Logger:
```javascript
import logger, { getErrorMessage } from '../utils/logger'
```

### 2. Logging de Operaciones:
```javascript
// Inicio de operación
logger.info('Context', 'Description', data)

// Éxito
logger.success('Context', 'Operation successful')

// Error
logger.error('Context', 'Operation failed', error)
toast.error(getErrorMessage(error))
```

### 3. Validaciones:
```javascript
if (!validate()) {
  logger.warn('Context', 'Validation failed', errors)
  return
}
```

---

## Notas Importantes

- Los logs de desarrollo (INFO, DEBUG, WARN) solo se muestran en modo desarrollo
- Los logs de ERROR siempre son visibles para facilitar soporte
- El sistema usa import.meta.env.MODE para detectar el entorno
- Todos los timestamps usan formato ISO 8601

---

## Debugging en Producción

Para debugging en producción:

1. Abrir DevTools (F12)
2. Buscar logs con prefijo "ERROR"
3. Expandir el grupo para ver detalles completos
4. Copiar el stack trace para análisis

---

## Autor
Sistema implementado el 4 de diciembre de 2025

## Licencia
Parte del proyecto PETSHOP 3.0.3.1

#### Nuevos Códigos Añadidos:
- **ERR_108**: Nombre de usuario requerido
- **ERR_109**: Longitud de nombre de usuario inválida
- **ERR_308**: Stock insuficiente
- **ERR_309**: Cantidad excede stock disponible
- **ERR_403**: No se puede eliminar categoría con productos
- **ERR_509**: Cantidad debe ser mayor a 0
- **ERR_510**: Total del recibo debe ser mayor a 0
- **ERR_805**: Fecha inválida
- **ERR_806**: Número inválido
- **ERR_906**: Solicitud rechazada
- **ERR_907**: Operación no permitida

#### Mensajes Mejorados:
Todos los mensajes ahora son más descriptivos y orientados al usuario:

**Antes:**
```javascript
ERR_201: 'Primer nombre requerido'
```

**Ahora:**
```javascript
ERR_201: 'El primer nombre del cliente es obligatorio.'
```

---

### 3. **API Interceptor Mejorado** (`src/services/api.js`)

El interceptor de Axios ahora incluye:

- Logging automático de todas las peticiones
- Logging detallado de errores con contexto
- Muestra tabla formateada de errores del backend
- Detección inteligente de tipo de error (4xx, 5xx, red)
- Mensajes personalizados según el código de error
- Log de configuración de peticiones fallidas

#### Ejemplo de Log de Error:
```
[14:32:15.234] ERROR - API
└─ Error en petición a /api/v1/client
   ├─ Estado HTTP: 400
   ├─ Datos enviados: {...}
   └─ Respuesta: {...}

📦 Detalles del Error del Backend
┌─────────────┬────────────────────────┐
│ Código      │ ERR_204                │
│ Mensaje     │ Número ya registrado   │
│ Campo       │ numero_documento       │
│ Estado HTTP │ 400                    │
└─────────────┴────────────────────────┘
```

---

## Archivos Actualizados

### Páginas Principales:
1. `src/pages/CrearCliente.jsx`
2. `src/pages/EditarCliente.jsx`
3. `src/pages/Clientes.jsx`
4. `src/pages/CrearUsuario.jsx`
5. `src/pages/ActualizarUsuario.jsx`
6. `src/pages/Usuarios.jsx`
7. `src/pages/Categorias.jsx`
8. `src/pages/CrearProducto.jsx`
9. `src/pages/ModificarProducto.jsx`
10. `src/pages/Inventario.jsx`

### Servicios:
- `src/services/api.js`
- `src/services/errorCodes.js`

### Nuevos Archivos:
- `src/utils/logger.js`

---

## Beneficios

### Para Desarrolladores:
1. **Debugging más rápido** - Logs detallados con contexto
2. **Trazabilidad completa** - Stack traces y datos de peticiones
3. **Identificación visual** - Colores y formatos para cada tipo de log
4. **Medición de rendimiento** - Función `logger.time()`
5. **Agrupación lógica** - Logs relacionados agrupados

### Para Usuarios:
1. **Mensajes claros** - Errores descriptivos en español
2. **Indicadores visuales** - Exito, advertencia, etc.
3. **Instrucciones útiles** - Los mensajes indican qué hacer
4. **Menos frustración** - Errores comprensibles

---

## Ejemplos de Uso

### Antes:
```javascript
try {
  await clientService.create(payload)
  toast.success('Cliente creado')
} catch (err) {
  console.error(err)
  toast.error('Error creando cliente: ' + err.message)
}
```

### Ahora:
```javascript
try {
  logger.info('CrearCliente', 'Enviando datos de nuevo cliente', payload)
  await clientService.create(payload)
  logger.success('CrearCliente', `Cliente ${nombre} creado exitosamente`)
  toast.success('Cliente creado exitosamente')
} catch (err) {
  logger.error('CrearCliente', 'Error al crear cliente', err)
  toast.error(getErrorMessage(err))
}
```

---

## Patrones de Implementación

### 1. Importar el Logger:
```javascript
import logger, { getErrorMessage } from '../utils/logger'
```

### 2. Logging de Operaciones:
```javascript
// Inicio de operación
logger.info('Contexto', 'Descripción', datos)

// Éxito
logger.success('Contexto', 'Operación exitosa')

// Error
logger.error('Contexto', 'Error en operación', error)
toast.error(getErrorMessage(error))
```

### 3. Validaciones:
```javascript
if (!validar()) {
  logger.warn('Contexto', 'Validación fallida', errores)
  return
}
```

---

## 🚀 Mejoras Futuras Sugeridas

1. **Telemetría** - Enviar logs de errores a servicio de monitoreo
2. **Analytics** - Rastrear errores más comunes
3. **Retry Logic** - Reintentos automáticos en errores de red
4. **Cache de Mensajes** - Evitar mensajes duplicados
5. **Notificaciones Admin** - Alertas automáticas para errores críticos

---

## Notas Importantes

- Los logs de desarrollo (INFO, DEBUG, WARN) **solo se muestran en modo desarrollo**
- Los logs de ERROR **siempre son visibles** para facilitar soporte
- El sistema usa `import.meta.env.MODE` para detectar el entorno
- Los mensajes de toast proporcionan claridad al usuario

---

## 🐛 Debugging en Producción

Para debugging en producción, puedes:

1. Abrir DevTools (F12)
2. Buscar logs con prefijo "ERROR"
3. Expandir el grupo para ver detalles completos
4. Copiar el stack trace para análisis

---

## ✍️ Autor
Sistema implementado el 4 de diciembre de 2025

## 📄 Licencia
Parte del proyecto PETSHOP 3.0.3.1
