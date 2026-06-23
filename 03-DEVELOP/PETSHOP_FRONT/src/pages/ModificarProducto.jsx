// src/pages/ModificarProducto.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import logger, { getErrorMessage } from '../utils/logger'
import storageService from '../services/storageService'
import productService from '../services/productService'
import {
  validateRequired,
  validateSKU,
  validateString,
  validatePrecio,
  validateStock
} from '../utils/validation'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export default function ModificarProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      logger.info('ModificarProducto', `Cargando datos del producto ID: ${id}`)
      try {
        const data = await productService.getById(id)
        if (mounted) {
          setProducto(data)
          logger.success('ModificarProducto', 'Datos del producto cargados')
        }
      } catch (error) {
        logger.error('ModificarProducto', 'Error al cargar producto', error)
        toast.error(getErrorMessage(error))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  const validateFieldRealTime = (fieldName, value) => {
    let error = null;
    const sku = producto?.codigo_sku || producto?.sku;
    const nombre = producto?.nombre_producto || producto?.nombre;
    
    switch(fieldName) {
      case 'codigo_sku':
        error = validateRequired(value, 'Código SKU') || validateSKU(value);
        break;
      case 'nombre_producto':
        error = validateRequired(value, 'Nombre del producto') || validateString(value, 3, 100, 'Nombre del producto');
        break;
      case 'presentacion_producto':
        if (value) error = validateString(value, 2, 50, 'Presentación');
        break;
      case 'stock':
        error = validateRequired(value, 'Stock') || validateStock(value);
        break;
      case 'precio_unitario':
        error = validateRequired(value, 'Precio unitario') || validatePrecio(value);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error;
  };

  const handleFieldChange = (fieldName, value) => {
    setProducto(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      validateFieldRealTime(fieldName, value);
    }
  };

  const handleFieldBlur = (fieldName, value) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateFieldRealTime(fieldName, value);
  };

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveNewImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!producto) return

    const validationErrors = {}
    const sku = producto.codigo_sku || producto.sku;
    const nombre = producto.nombre_producto || producto.nombre;
    const presentacion = producto.presentacion_producto || producto.presentacion;

    validationErrors.codigo_sku = validateRequired(sku, 'Código SKU') || validateSKU(sku);
    validationErrors.nombre_producto = validateRequired(nombre, 'Nombre del producto') || validateString(nombre, 3, 100, 'Nombre del producto');
    if (presentacion) validationErrors.presentacion_producto = validateString(presentacion, 2, 50, 'Presentación');
    validationErrors.stock = validateRequired(producto.stock, 'Stock') || validateStock(producto.stock);
    validationErrors.precio_unitario = validateRequired(producto.precio_unitario, 'Precio unitario') || validatePrecio(producto.precio_unitario);

    const filteredErrors = Object.fromEntries(
      Object.entries(validationErrors).filter(([_, v]) => v !== null && v !== undefined)
    );

    if (Object.keys(filteredErrors).length) {
      setErrors(filteredErrors);
      Object.values(filteredErrors).forEach((msg) => toast.warn(msg));
      logger.warn('ModificarProducto', 'Validación fallida', filteredErrors);
      return;
    }

    // Subir nueva imagen si se seleccionó
    let imageUrl = producto.url_imagen
    if (imageFile) {
      try {
        setUploadingImage(true)
        logger.info('ModificarProducto', 'Subiendo nueva imagen...')
        imageUrl = await storageService.uploadProductImage(imageFile)
        logger.success('ModificarProducto', 'Nueva imagen subida exitosamente')
        toast.success('Nueva imagen subida exitosamente')
      } catch (error) {
        logger.error('ModificarProducto', 'Error al subir imagen', error)
        toast.error(getErrorMessage(error))
        setUploadingImage(false)
        return
      } finally {
        setUploadingImage(false)
      }
    }

    const payload = {
      codigo_sku: sku,
      nombre_producto: nombre,
      stock: Number(producto.stock) || 0,
      presentacion_producto: presentacion || null,
      precio_unitario: Number(producto.precio_unitario) || 0,
      id_categoria: producto.id_categoria ? Number(producto.id_categoria) : null,
      estado: producto.estado || 'activo',
      url_imagen: imageUrl || null
    }

    logger.info('ModificarProducto', `Actualizando producto ID: ${id}`, payload)
    try {
      await productService.update(id, payload)
      logger.success('ModificarProducto', `Producto "${payload.nombre_producto}" actualizado exitosamente`)
      toast.success('Producto actualizado exitosamente')
      
      // Dar tiempo para que el toast se muestre
      setTimeout(() => {
        navigate('/productos', { replace: true, state: { refresh: true } });
      }, 1000);
    } catch (error) {
      logger.error('ModificarProducto', 'Error al actualizar producto', error)
      toast.error(getErrorMessage(error))
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información del producto...</p>
        </div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
          <div>
            <strong>Producto no encontrado</strong>
            <p className="mb-0">El producto que buscas no existe o fue eliminado.</p>
          </div>
        </div>
        <button className="btn btn-outline-primary" onClick={() => navigate('/productos')}>
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Productos
        </button>
      </div>
    )
  }

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header con breadcrumb */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/productos" className="text-decoration-none">
                  <i className="bi bi-box-seam me-1"></i>
                  Productos
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Editar Producto</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-1 fw-bold">
                <i className="bi bi-pencil-square text-primary me-2"></i>
                Editar Producto
              </h1>
              <p className="text-muted mb-0">
                <small>Modifica la información del producto {producto.codigo_sku || producto.sku}</small>
              </p>
            </div>
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => navigate('/productos')}
              type="button"
            >
              <i className="bi bi-x-lg me-2"></i>
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Columna Izquierda - Información del Producto */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-info-circle text-primary me-2"></i>
                  Información General
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {/* Código SKU */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Código SKU <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-upc-scan"></i>
                      </span>
                      <input
                        className={`form-control ${errors.codigo_sku ? 'is-invalid' : touched.codigo_sku && !errors.codigo_sku ? 'is-valid' : ''}`}
                        type="text"
                        placeholder="Ej: PROD-001"
                        value={producto.codigo_sku || producto.sku || ''}
                        onChange={(e) => handleFieldChange('codigo_sku', e.target.value)}
                        onBlur={(e) => handleFieldBlur('codigo_sku', e.target.value)}
                        required
                      />
                      {errors.codigo_sku && <div className="invalid-feedback">{errors.codigo_sku}</div>}
                    </div>
                  </div>

                  {/* Nombre del Producto */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Nombre del Producto <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-tag"></i>
                      </span>
                      <input
                        className={`form-control ${errors.nombre_producto ? 'is-invalid' : touched.nombre_producto && !errors.nombre_producto ? 'is-valid' : ''}`}
                        type="text"
                        placeholder="Nombre descriptivo"
                        value={producto.nombre_producto || producto.nombre || ''}
                        onChange={(e) => handleFieldChange('nombre_producto', e.target.value)}
                        onBlur={(e) => handleFieldBlur('nombre_producto', e.target.value)}
                        required
                      />
                      {errors.nombre_producto && <div className="invalid-feedback">{errors.nombre_producto}</div>}
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Stock <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-box"></i>
                      </span>
                      <input
                        className={`form-control ${errors.stock ? 'is-invalid' : touched.stock && !errors.stock ? 'is-valid' : ''}`}
                        type="number"
                        placeholder="0"
                        value={producto.stock ?? 0}
                        onChange={(e) => handleFieldChange('stock', Number(e.target.value))}
                        onBlur={(e) => handleFieldBlur('stock', e.target.value)}
                        min={0}
                        required
                      />
                      <span className="input-group-text bg-light">unidades</span>
                      {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                    </div>
                  </div>

                  {/* Precio Unitario */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Precio Unitario <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">$</span>
                      <input
                        className={`form-control ${errors.precio_unitario ? 'is-invalid' : touched.precio_unitario && !errors.precio_unitario ? 'is-valid' : ''}`}
                        type="number"
                        placeholder="0.00"
                        value={producto.precio_unitario ?? 0}
                        onChange={(e) => handleFieldChange('precio_unitario', Number(e.target.value))}
                        onBlur={(e) => handleFieldBlur('precio_unitario', e.target.value)}
                        min={0}
                        step="0.01"
                        required
                      />
                      {errors.precio_unitario && <div className="invalid-feedback">{errors.precio_unitario}</div>}
                    </div>
                  </div>

                  {/* Presentación */}
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Presentación</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-inbox"></i>
                      </span>
                      <input
                        className={`form-control ${errors.presentacion_producto ? 'is-invalid' : touched.presentacion_producto && !errors.presentacion_producto ? 'is-valid' : ''}`}
                        type="text"
                        placeholder="Ej: 500g, 1L"
                        value={producto.presentacion_producto || producto.presentacion || ''}
                        onChange={(e) => handleFieldChange('presentacion_producto', e.target.value)}
                        onBlur={(e) => handleFieldBlur('presentacion_producto', e.target.value)}
                      />
                      {errors.presentacion_producto && <div className="invalid-feedback">{errors.presentacion_producto}</div>}
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Estado</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-toggle-on"></i>
                      </span>
                      <select 
                        className="form-select" 
                        value={producto.estado || 'activo'} 
                        onChange={(e) => setProducto({ ...producto, estado: e.target.value })}
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Imagen */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-image text-primary me-2"></i>
                  Imagen del Producto
                </h5>
              </div>
              <div className="card-body p-4">
                {/* Preview de Imagen */}
                <div className="text-center mb-3">
                  <div 
                    className="position-relative mx-auto" 
                    style={{ 
                      width: '250px', 
                      height: '250px', 
                      borderRadius: '12px',
                      border: imagePreview ? '3px solid #0d6efd' : '3px dashed #dee2e6',
                      overflow: 'hidden',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : producto.url_imagen ? (
                      <img 
                        src={getImageUrl(producto.url_imagen)} 
                        alt="Imagen actual"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `
                            <div class="d-flex flex-column align-items-center justify-content-center h-100">
                              <i class="bi bi-image text-muted" style="font-size: 4rem;"></i>
                              <p class="text-muted small mt-2">Sin imagen</p>
                            </div>
                          `
                        }}
                      />
                    ) : (
                      <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <i className="bi bi-image text-muted" style={{ fontSize: '4rem' }}></i>
                        <p className="text-muted small mt-2">Sin imagen</p>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <span className="badge bg-primary mt-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Nueva imagen seleccionada
                    </span>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="d-grid gap-2">
                  <label className="btn btn-outline-primary" style={{ cursor: 'pointer' }}>
                    <i className="bi bi-upload me-2"></i>
                    {imagePreview || producto.url_imagen ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                    <input 
                      type="file" 
                      className="d-none"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                    />
                  </label>
                  
                  {imagePreview && (
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={handleRemoveNewImage}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancelar Cambio
                    </button>
                  )}
                </div>

                <div className="alert alert-info mt-3 mb-0" role="alert">
                  <small>
                    <i className="bi bi-info-circle me-1"></i>
                    <strong>Formatos:</strong> JPG, PNG, GIF, WEBP<br/>
                    <strong>Tamaño máximo:</strong> 5 MB
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campo oculto para id_categoria */}
        <input type="hidden" value={producto.id_categoria || ''} />

        {/* Botones de Acción */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-lg px-5"
                    onClick={() => navigate('/productos')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg px-5"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Subiendo imagen...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
