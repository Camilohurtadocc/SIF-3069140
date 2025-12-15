// Sistema de códigos de error estandarizados para VetShop API

export const ERROR_CODES = {
  // Autenticación (ERR_001 - ERR_099)
  ERR_001: 'Credenciales inválidas. Verifica tu correo y contraseña.',
  ERR_002: 'Usuario no encontrado en el sistema.',
  ERR_003: 'Contraseña incorrecta.',
  ERR_004: 'Sesión expirada. Inicia sesión nuevamente.',
  ERR_005: 'Token de autenticación inválido.',
  ERR_006: 'No tienes permiso para acceder a este recurso.',
  ERR_007: 'Sesión expirada. Inicia sesión nuevamente.',

  // Usuarios (ERR_100 - ERR_199)
  ERR_100: 'Usuario no encontrado. Verifica el ID.',
  ERR_101: 'Este correo electrónico ya está registrado.',
  ERR_102: 'El ID de usuario es requerido.',
  ERR_103: 'El formato del correo electrónico no es válido.',
  ERR_104: 'La contraseña debe tener al menos 6 caracteres.',
  ERR_105: 'Debes seleccionar al menos un rol.',
  ERR_106: 'El rol seleccionado no existe.',
  ERR_107: 'Este usuario ya tiene el rol asignado.',
  ERR_108: 'El nombre de usuario es requerido.',
  ERR_109: 'El nombre de usuario debe tener entre 3 y 50 caracteres.',

  // Clientes (ERR_200 - ERR_299)
  ERR_200: 'Cliente no encontrado. Verifica el ID.',
  ERR_201: 'El primer nombre del cliente es obligatorio.',
  ERR_202: 'El primer apellido del cliente es obligatorio.',
  ERR_203: 'El número de documento es obligatorio.',
  ERR_204: 'Este número de documento ya está registrado.',
  ERR_205: 'El correo electrónico es obligatorio.',
  ERR_206: 'El formato del correo electrónico no es válido.',
  ERR_207: 'El número de teléfono es obligatorio.',
  ERR_208: 'El formato del número de teléfono no es válido.',
  ERR_209: 'Debes seleccionar un tipo de documento.',
  ERR_210: 'El tipo de documento seleccionado no existe.',
  ERR_211: 'Este número de teléfono ya está registrado.',
  ERR_212: 'Este correo electrónico ya está registrado.',

  // Productos (ERR_300 - ERR_399)
  ERR_300: 'Producto no encontrado. Verifica el código.',
  ERR_301: 'El código SKU del producto es obligatorio.',
  ERR_302: 'Este código SKU ya está registrado.',
  ERR_303: 'El nombre del producto es obligatorio.',
  ERR_304: 'El stock debe ser un número mayor o igual a 0.',
  ERR_305: 'El precio unitario debe ser mayor o igual a 0.',
  ERR_306: 'Debes seleccionar una categoría.',
  ERR_307: 'La categoría seleccionada no existe.',
  ERR_308: 'No hay suficiente stock disponible.',
  ERR_309: 'La cantidad solicitada excede el stock disponible.',

  // Categorías (ERR_400 - ERR_499)
  ERR_400: 'Categoría no encontrada. Verifica el ID.',
  ERR_401: 'El nombre de la categoría es obligatorio.',
  ERR_402: 'Este nombre de categoría ya existe.',
  ERR_403: 'No se puede eliminar una categoría con productos asociados.',

  // Recibos de Caja (ERR_500 - ERR_599)
  ERR_500: 'Recibo de caja no encontrado.',
  ERR_501: 'Debes seleccionar un cliente.',
  ERR_502: 'Debes seleccionar un método de pago.',
  ERR_503: 'Debes agregar al menos un producto.',
  ERR_504: 'El cliente seleccionado no existe.',
  ERR_505: 'Uno o más productos no existen.',
  ERR_506: 'Stock insuficiente para completar la venta.',
  ERR_507: 'Error al actualizar el inventario.',
  ERR_508: 'Error al generar el número de recibo.',
  ERR_509: 'La cantidad debe ser mayor a 0.',
  ERR_510: 'El total del recibo debe ser mayor a 0.',

  // Cierres de Caja (ERR_600 - ERR_699)
  ERR_600: 'Cierre de caja no encontrado.',
  ERR_601: 'Debes seleccionar el tipo de período.',
  ERR_602: 'La fecha de referencia es obligatoria.',
  ERR_603: 'Usuario no identificado. Inicia sesión.',
  ERR_604: 'Tipo de período inválido. Usa: diario, semanal o mensual.',
  ERR_605: 'El usuario especificado no existe.',
  ERR_606: 'Error al calcular las fechas del período.',
  ERR_607: 'Ya existe un cierre para este período.',
  ERR_608: 'No hay recibos de caja en el período seleccionado.',
  ERR_609: 'No se puede eliminar un cierre con más de 24 horas.',

  // Base de Datos (ERR_700 - ERR_799)
  ERR_700: 'Error de conexión con la base de datos.',
  ERR_701: 'Error al ejecutar la consulta.',
  ERR_702: 'Error de integridad de datos.',
  ERR_703: 'Este registro ya existe.',
  ERR_704: 'Error en la transacción.',
  ERR_705: 'La base de datos no responde.',

  // Validación (ERR_800 - ERR_899)
  ERR_800: 'Faltan datos obligatorios.',
  ERR_801: 'No se proporcionó ningún archivo.',
  ERR_802: 'Formato de imagen no válido. Solo se permiten JPG, PNG, GIF, WEBP.',
  ERR_803: 'El archivo es demasiado grande. Máximo: 5MB.',
  ERR_804: 'El tipo de dato no es correcto.',
  ERR_805: 'La fecha no es válida.',
  ERR_806: 'El número no es válido.',
  ERR_807: 'Uno o más campos exceden la longitud máxima.',
  ERR_808: 'El valor está fuera del rango permitido.',

  // Sistema (ERR_900 - ERR_999)
  ERR_900: 'Error interno del servidor.',
  ERR_901: 'El servicio no está disponible.',
  ERR_902: 'Error de configuración del sistema.',
  ERR_903: 'Memoria insuficiente.',
  ERR_904: 'Error al procesar el archivo.',
  ERR_905: 'Error de conexión de red.',
  ERR_906: 'Solicitud rechazada.',
  ERR_907: 'Operación no permitida.'
};

/**
 * Crea una respuesta de error estandarizada
 * @param {string} code - Código de error (ej: 'ERR_100')
 * @param {string} customMessage - Mensaje personalizado (opcional)
 * @param {any} details - Detalles adicionales (opcional)
 * @param {string} field - Campo específico del error (opcional)
 * @returns {Object} Objeto de error estandarizado
 */
export const createError = (code, customMessage = null, details = null, field = null) => {
  const message = customMessage || ERROR_CODES[code] || 'Error desconocido';

  const error = {
    code,
    message,
    timestamp: new Date().toISOString()
  };

  if (details) error.details = details;
  if (field) error.field = field;

  return { error };
};

/**
 * Respuesta de éxito estandarizada
 * @param {any} data - Datos a retornar
 * @param {string} message - Mensaje opcional
 * @returns {Object} Respuesta de éxito
 */
export const createSuccess = (data, message = null) => ({
  success: true,
  data,
  ...(message && { message }),
  timestamp: new Date().toISOString()
});

/**
 * Respuesta de paginación estandarizada
 * @param {Array} data - Array de items
 * @param {number} totalCount - Total de registros
 * @param {number} currentPage - Página actual
 * @param {number} pageSize - Tamaño de página
 * @param {number} totalPages - Total de páginas
 * @returns {Object} Respuesta paginada
 */
export const createPaginatedResponse = (data, totalCount, currentPage, pageSize, totalPages) => ({
  data,
  pagination: {
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  },
  timestamp: new Date().toISOString()
});