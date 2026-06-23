// src/utils/validation.js

/**
 * Valida que un campo requerido no esté vacío
 * @param {any} value - Valor a validar
 * @param {string} fieldName - Nombre del campo para el mensaje
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateRequired = (value, fieldName = 'Campo') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} es obligatorio`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} es obligatorio`;
  }
  return null;
};

/**
 * Valida formato de correo electrónico
 * @param {string} value - Correo a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateEmail = (value) => {
  if (!value) return null;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return 'El formato del correo electrónico no es válido';
  }
  return null;
};

/**
 * Valida que sea un string con longitud específica
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @param {number} maxLength - Longitud máxima
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateString = (value, minLength = 1, maxLength = 255, fieldName = 'Campo') => {
  if (!value) return null;
  if (typeof value !== 'string') {
    return `${fieldName} debe ser texto`;
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  if (maxLength && trimmed.length > maxLength) {
    return `${fieldName} no puede exceder ${maxLength} caracteres`;
  }
  return null;
};

/**
 * Valida nombres (solo letras, espacios y caracteres acentuados)
 * @param {string} value - Nombre a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateName = (value, fieldName = 'Nombre') => {
  if (!value) return null;
  if (typeof value !== 'string') {
    return `${fieldName} debe ser texto`;
  }
  const nameRegex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ\s]+$/;
  if (!nameRegex.test(value.trim())) {
    return `${fieldName} solo puede contener letras y espacios`;
  }
  if (value.trim().length < 2) {
    return `${fieldName} debe tener al menos 2 caracteres`;
  }
  return null;
};

/**
 * Valida que sea un número dentro de un rango
 * @param {any} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateNumber = (value, min = null, max = null, fieldName = 'Campo') => {
  if (!value && value !== 0) return null;
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`;
  }
  if (min !== null && num < min) {
    return `${fieldName} debe ser mayor o igual a ${min}`;
  }
  if (max !== null && num > max) {
    return `${fieldName} debe ser menor o igual a ${max}`;
  }
  return null;
};

/**
 * Valida número de documento (6-10 dígitos numéricos)
 * @param {string} value - Documento a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateDocumento = (value) => {
  if (!value) return null;
  const strValue = String(value).trim();
  
  // Solo números
  if (!/^\d+$/.test(strValue)) {
    return 'El número de documento solo puede contener dígitos';
  }
  
  // Longitud entre 6 y 10
  if (strValue.length < 6) {
    return 'El número de documento debe tener al menos 6 dígitos';
  }
  if (strValue.length > 10) {
    return 'El número de documento no puede exceder 10 dígitos';
  }
  
  return null;
};

/**
 * Valida número de teléfono (7-10 dígitos numéricos)
 * @param {string} value - Teléfono a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateTelefono = (value) => {
  if (!value) return null;
  const strValue = String(value).trim();
  
  // Solo números
  if (!/^\d+$/.test(strValue)) {
    return 'El número de teléfono solo puede contener dígitos';
  }
  
  // Longitud entre 7 y 10
  if (strValue.length < 7) {
    return 'El número de teléfono debe tener al menos 7 dígitos';
  }
  if (strValue.length > 10) {
    return 'El número de teléfono no puede exceder 10 dígitos';
  }
  
  return null;
};

/**
 * Valida contraseña (mínimo 6 caracteres)
 * @param {string} value - Contraseña a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validatePassword = (value) => {
  if (!value) return null;
  if (typeof value !== 'string') {
    return 'La contraseña debe ser texto';
  }
  if (value.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  if (value.length > 100) {
    return 'La contraseña no puede exceder 100 caracteres';
  }
  return null;
};

/**
 * Valida código SKU (3-20 caracteres alfanuméricos)
 * @param {string} value - SKU a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateSKU = (value) => {
  if (!value) return null;
  const strValue = String(value).trim();
  
  if (strValue.length < 3) {
    return 'El código SKU debe tener al menos 3 caracteres';
  }
  if (strValue.length > 20) {
    return 'El código SKU no puede exceder 20 caracteres';
  }
  
  // Alfanumérico y algunos caracteres especiales
  if (!/^[a-zA-Z0-9-_]+$/.test(strValue)) {
    return 'El código SKU solo puede contener letras, números, guiones y guiones bajos';
  }
  
  return null;
};

/**
 * Valida precio (número positivo con hasta 2 decimales)
 * @param {any} value - Precio a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validatePrecio = (value) => {
  if (!value && value !== 0) return null;
  
  const num = Number(value);
  if (isNaN(num)) {
    return 'El precio debe ser un número válido';
  }
  
  if (num < 0) {
    return 'El precio no puede ser negativo';
  }
  
  if (num > 99999999.99) {
    return 'El precio excede el límite permitido';
  }
  
  // Verificar máximo 2 decimales
  const decimals = (value.toString().split('.')[1] || '').length;
  if (decimals > 2) {
    return 'El precio solo puede tener hasta 2 decimales';
  }
  
  return null;
};

/**
 * Valida stock (número entero no negativo)
 * @param {any} value - Stock a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateStock = (value) => {
  if (!value && value !== 0) return null;
  
  const num = Number(value);
  if (isNaN(num)) {
    return 'El stock debe ser un número válido';
  }
  
  if (!Number.isInteger(num)) {
    return 'El stock debe ser un número entero';
  }
  
  if (num < 0) {
    return 'El stock no puede ser negativo';
  }
  
  if (num > 999999) {
    return 'El stock excede el límite permitido';
  }
  
  return null;
};

/**
 * Valida fecha (formato ISO o válida)
 * @param {string} value - Fecha a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateFecha = (value) => {
  if (!value) return null;
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return 'La fecha no es válida';
  }
  
  return null;
};

/**
 * Valida URL (formato básico)
 * @param {string} value - URL a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateURL = (value) => {
  if (!value) return null;
  
  try {
    new URL(value);
    return null;
  } catch {
    return 'La URL no es válida';
  }
};

/**
 * Función general para validar un campo con múltiples reglas
 * @param {any} value - Valor a validar
 * @param {Array} rules - Array de funciones de validación
 * @returns {string|null} Primer mensaje de error encontrado o null si válido
 */
export const validateField = (value, rules) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

/**
 * Valida dirección (texto entre 5 y 200 caracteres)
 * @param {string} value - Dirección a validar
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validateDireccion = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  
  if (trimmed.length < 5) {
    return 'La dirección debe tener al menos 5 caracteres';
  }
  if (trimmed.length > 200) {
    return 'La dirección no puede exceder 200 caracteres';
  }
  
  return null;
};

/**
 * Valida número positivo entero
 * @param {any} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de error o null si válido
 */
export const validatePositiveInteger = (value, fieldName = 'Campo') => {
  if (!value && value !== 0) return null;
  
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`;
  }
  
  if (!Number.isInteger(num)) {
    return `${fieldName} debe ser un número entero`;
  }
  
  if (num <= 0) {
    return `${fieldName} debe ser mayor que 0`;
  }
  
  return null;
};