# Guía Rápida: Sistema de Logging

## Importación

```javascript
import logger, { getErrorMessage } from '../utils/logger'
```

---

## Uso Básico

### Operación Exitosa
```javascript
logger.success('ComponentName', 'Client created successfully')
```

### Error
```javascript
try {
  // código que puede fallar
} catch (error) {
  logger.error('ComponentName', 'Error creating client', error)
  toast.error(getErrorMessage(error))
}
```

### Información (solo desarrollo)
```javascript
logger.info('ComponentName', 'Loading data', { page, limit })
```

### Advertencia (solo desarrollo)
```javascript
if (!validate()) {
  logger.warn('ComponentName', 'Validation failed', errors)
  return
}
```

### Debug (solo desarrollo)
```javascript
logger.debug('ComponentName', 'Variable X value', valueX)
```

---

## Agrupar Logs

```javascript
logger.group('Validation Process', () => {
  logger.info('Validation', 'Checking required fields')
  logger.info('Validation', 'Checking email format')
  logger.success('Validation', 'All fields valid')
})
```

---

## Medir Tiempo

```javascript
const result = await logger.time('Load Products', async () => {
  return await productService.getAll()
})
// Output: [TIMER] Load Products: 234.56ms
```

---

## Extraer Mensaje de Error

```javascript
const friendlyMessage = getErrorMessage(error)
// Retorna el mensaje más descriptivo disponible del error
```

---

## Template Completo

```javascript
async function handleSubmit(e) {
  e.preventDefault()
  
  // Validación
  if (!validate()) {
    logger.warn('CrearCliente', 'Validation failed', errors)
    return
  }
  
  setLoading(true)
  try {
    // Log de inicio
    logger.info('CrearCliente', 'Creating new client', payload)
    
    // Operación
    await clientService.create(payload)
    
    // Log de éxito
    logger.success('CrearCliente', `Client ${name} created successfully`)
    toast.success('Cliente creado exitosamente')
    
    navigate('/clientes')
  } catch (error) {
    // Log de error
    logger.error('CrearCliente', 'Error creating client', error)
    toast.error(getErrorMessage(error))
  } finally {
    setLoading(false)
  }
}
```

---

## Convenciones

### Nombres de Contexto:
- Usar el nombre del componente: 'CrearCliente', 'Usuarios', 'API'
- Primera letra mayúscula
- Sin espacios (usar CamelCase)

### Mensajes:
- Primera letra mayúscula
- Descriptivos pero concisos
- En inglés para logs internos
- Incluir datos relevantes en variables

### Datos Adicionales:
- Pasar objeto con datos relevantes
- No incluir contraseñas o datos sensibles
- Útil para debugging

---

## Tips

1. Siempre usar logger.error() para errores - No usar console.error()
2. Usar getErrorMessage() en toast de error - Extrae el mejor mensaje
3. Logs de INFO/DEBUG solo en desarrollo - No saturan producción
4. Incluir contexto útil - Ayuda en debugging remoto
5. Evitar logs excesivos - Solo lo necesario

---

## NO Hacer

```javascript
// NO: console.log genérico
console.log('error:', error)

// NO: mensaje poco descriptivo
logger.error('Error', 'Error')

// NO: sin contexto
toast.error(error.message)
```

---

## SÍ Hacer

```javascript
// SÍ: logger con contexto
logger.error('CrearCliente', 'Error validating document number', error)

// SÍ: mensaje descriptivo
logger.success('CrearCliente', `Client ${name} ${lastName} created with ID: ${id}`)

// SÍ: usar getErrorMessage
toast.error(getErrorMessage(error))
```

---

## Niveles de Log - Cuándo Usar

| Nivel | Cuándo Usar | Visible en Producción |
|-------|-------------|----------------------|
| ERROR | Errores que impiden operación | Sí |
| WARN | Validaciones fallidas, advertencias | No |
| INFO | Inicio/fin de operaciones importantes | No |
| DEBUG | Valores de variables, flow de código | No |
| SUCCESS | Confirmación de operaciones exitosas | No |

---

## Debugging en Consola

En DevTools, busca por:
- ERROR - Solo errores
- WARN - Advertencias
- INFO - Información
- SUCCESS - Éxitos
- DEBUG - Debug

---

## Más Información

Ver MEJORAS_SISTEMA_ERRORES.md para documentación completa.

```javascript
import logger, { getErrorMessage } from '../utils/logger'
```

---

## 🎯 Uso Básico

### ✅ Operación Exitosa
```javascript
logger.success('NombreComponente', 'Cliente creado exitosamente')
```

### ❌ Error
```javascript
try {
  // código que puede fallar
} catch (error) {
  logger.error('NombreComponente', 'Error al crear cliente', error)
  toast.error(getErrorMessage(error))
}
```

### ℹ️ Información (solo desarrollo)
```javascript
logger.info('NombreComponente', 'Cargando datos', { page, limit })
```

### ⚠️ Advertencia (solo desarrollo)
```javascript
if (!validar()) {
  logger.warn('NombreComponente', 'Validación fallida', errors)
  return
}
```

### 🔍 Debug (solo desarrollo)
```javascript
logger.debug('NombreComponente', 'Variable X vale', valorX)
```

---

## 📦 Agrupar Logs

```javascript
logger.group('Proceso de Validación', () => {
  logger.info('Validación', 'Verificando campos obligatorios')
  logger.info('Validación', 'Verificando formato de email')
  logger.success('Validación', 'Todos los campos válidos')
})
```

---

## ⏱️ Medir Tiempo

```javascript
const resultado = await logger.time('Cargar Productos', async () => {
  return await productService.getAll()
})
// Output: ⏱️ Cargar Productos: 234.56ms
```

---

## 💡 Extraer Mensaje de Error

```javascript
const mensajeAmigable = getErrorMessage(error)
// Retorna el mensaje más descriptivo disponible del error
```

---

## 📋 Template Completo

```javascript
async function handleSubmit(e) {
  e.preventDefault()
  
  // Validación
  if (!validar()) {
    logger.warn('CrearCliente', 'Validación fallida', errors)
    return
  }
  
  setLoading(true)
  try {
    // Log de inicio
    logger.info('CrearCliente', 'Creando nuevo cliente', payload)
    
    // Operación
    await clientService.create(payload)
    
    // Log de éxito
    logger.success('CrearCliente', `Cliente ${nombre} creado exitosamente`)
    toast.success('✅ Cliente creado exitosamente')
    
    navigate('/clientes')
  } catch (error) {
    // Log de error
    logger.error('CrearCliente', 'Error al crear cliente', error)
    toast.error(getErrorMessage(error))
  } finally {
    setLoading(false)
  }
}
```

---

## 🎨 Convenciones

### Nombres de Contexto:
- Usar el nombre del componente: `'CrearCliente'`, `'Usuarios'`, `'API'`
- Primera letra mayúscula
- Sin espacios (usar CamelCase)

### Mensajes:
- Primera letra mayúscula
- Descriptivos pero concisos
- En español
- Incluir datos relevantes en variables

### Datos Adicionales:
- Pasar objeto con datos relevantes
- No incluir contraseñas o datos sensibles
- Útil para debugging

---

## ⚡ Tips

1. **Siempre usar `logger.error()` para errores** - No usar `console.error()`
2. **Usar `getErrorMessage()` en toast de error** - Extrae el mejor mensaje
3. **Logs de INFO/DEBUG solo en desarrollo** - No saturan producción
4. **Incluir contexto útil** - Ayuda en debugging remoto
5. **Evitar logs excesivos** - Solo lo necesario

---

## 🔴 NO Hacer

```javascript
// ❌ NO: console.log genérico
console.log('error:', error)

// ❌ NO: mensaje poco descriptivo
logger.error('Error', 'Error')

// ❌ NO: sin contexto
toast.error(error.message)
```

---

## ✅ SÍ Hacer

```javascript
// ✅ SÍ: logger con contexto
logger.error('CrearCliente', 'Error al validar número de documento', error)

// ✅ SÍ: mensaje descriptivo
logger.success('CrearCliente', `Cliente ${nombre} ${apellido} creado con ID: ${id}`)

// ✅ SÍ: usar getErrorMessage
toast.error(getErrorMessage(error))
```

---

## 📊 Niveles de Log - Cuándo Usar

| Nivel | Cuándo Usar | Visible en Producción |
|-------|-------------|----------------------|
| **ERROR** | Errores que impiden operación | ✅ Sí |
| **WARN** | Validaciones fallidas, advertencias | ❌ No |
| **INFO** | Inicio/fin de operaciones importantes | ❌ No |
| **DEBUG** | Valores de variables, flow de código | ❌ No |
| **SUCCESS** | Confirmación de operaciones exitosas | ❌ No |

---

## 🔍 Debugging en Consola

En DevTools, filtra por:
- `🔴` - Solo errores
- `⚠️` - Advertencias
- `ℹ️` - Información
- `✅` - Éxitos
- `🔍` - Debug

---

## 📚 Más Información

Ver `MEJORAS_SISTEMA_ERRORES.md` para documentación completa.
