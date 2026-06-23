// src/pages/CrearProducto.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormLayout from '../components/FormLayout';
import SearchableSelect from '../components/SearchableSelect';
import storageService from '../services/storageService';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import logger, { getErrorMessage } from '../utils/logger';
import {
  validateRequired,
  validateSKU,
  validateString,
  validatePrecio,
  validateStock,
  validateFecha
} from '../utils/validation';

export default function CrearProducto() {
  const navigate = useNavigate();

  const [codigo_sku, setCodigoSku] = useState('');
  const [nombre_producto, setNombreProducto] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [stock, setStock] = useState(0);
  const [precio_unitario, setPrecioUnitario] = useState(0);
  const [fecha_vencimiento, setFechaVencimiento] = useState('');
  const [id_categoria, setIdCategoria] = useState('');
  const [activo, setActivo] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    async function loadCategorias() {
      try {
        logger.info('CrearProducto', 'Cargando categorías disponibles')
        const data = await categoryService.getAll();
        setCategorias(data);
        logger.success('CrearProducto', `${data.length} categorías disponibles`)
      } catch (error) {
        logger.error('CrearProducto', 'Error al cargar categorías', error)
        toast.error('No se pudieron cargar las categorías.');
      }
    }
    loadCategorias();
  }, []);

  const validateFieldRealTime = (fieldName, value) => {
    let error = null;
    
    switch(fieldName) {
      case 'codigo_sku':
        error = validateRequired(value, 'Código SKU') || validateSKU(value);
        break;
      case 'nombre_producto':
        error = validateRequired(value, 'Nombre del producto') || validateString(value, 3, 100, 'Nombre del producto');
        break;
      case 'presentacion':
        if (value) error = validateString(value, 2, 50, 'Presentación');
        break;
      case 'stock':
        error = validateRequired(value, 'Stock') || validateStock(value);
        break;
      case 'precio_unitario':
        error = validateRequired(value, 'Precio unitario') || validatePrecio(value);
        break;
      case 'fecha_vencimiento':
        if (value) error = validateFecha(value);
        break;
      case 'id_categoria':
        error = validateRequired(value, 'Categoría');
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
    switch(fieldName) {
      case 'codigo_sku':
        setCodigoSku(value);
        break;
      case 'nombre_producto':
        setNombreProducto(value);
        break;
      case 'presentacion':
        setPresentacion(value);
        break;
      case 'stock':
        setStock(value);
        break;
      case 'precio_unitario':
        setPrecioUnitario(value);
        break;
      case 'fecha_vencimiento':
        setFechaVencimiento(value);
        break;
      case 'id_categoria':
        setIdCategoria(value);
        break;
      default:
        break;
    }
    
    if (touched[fieldName]) {
      validateFieldRealTime(fieldName, value);
    }
  };

  const handleFieldBlur = (fieldName, value) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateFieldRealTime(fieldName, value);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = {};
    validationErrors.codigo_sku = validateRequired(codigo_sku, 'Código SKU') || validateSKU(codigo_sku);
    validationErrors.nombre_producto = validateRequired(nombre_producto, 'Nombre del producto') || validateString(nombre_producto, 3, 100, 'Nombre del producto');
    if (presentacion) validationErrors.presentacion = validateString(presentacion, 2, 50, 'Presentación');
    validationErrors.stock = validateRequired(stock, 'Stock') || validateStock(stock);
    validationErrors.precio_unitario = validateRequired(precio_unitario, 'Precio unitario') || validatePrecio(precio_unitario);
    if (fecha_vencimiento) validationErrors.fecha_vencimiento = validateFecha(fecha_vencimiento);
    validationErrors.id_categoria = validateRequired(id_categoria, 'Categoría');

    const filteredErrors = Object.fromEntries(
      Object.entries(validationErrors).filter(([_, v]) => v !== null && v !== undefined)
    );

    if (Object.keys(filteredErrors).length) {
      setErrors(filteredErrors);
      Object.values(filteredErrors).forEach((msg) => toast.warn(msg));
      logger.warn('CrearProducto', 'Validación fallida', filteredErrors);
      return;
    }

    setLoading(true);
    let imageUrl = '';

    try {
      if (imageFile) {
        logger.info('CrearProducto', 'Subiendo imagen del producto')
        imageUrl = await storageService.uploadProductImage(imageFile);
        logger.success('CrearProducto', 'Imagen subida exitosamente')
      }

      const productData = {
        codigo_sku,
        nombre_producto,
        presentacion,
        stock,
        precio_unitario,
        fecha_vencimiento: fecha_vencimiento || null,
        id_categoria,
        activo,
        imagen_url: imageUrl,
      };
      
      logger.info('CrearProducto', `Creando producto: ${nombre_producto}`, productData)
      await productService.create(productData);
      logger.success('CrearProducto', `Producto "${nombre_producto}" creado exitosamente`)
      toast.success('Producto creado exitosamente');
      
      // Dar tiempo para que el toast se muestre
      setTimeout(() => {
        navigate('/productos', { replace: true, state: { refresh: true } });
      }, 1000);
    } catch (error) {
      logger.error('CrearProducto', 'Error al crear producto', error)
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const categoriaOptions = categorias.map(cat => ({
    value: cat.id_categoria,
    label: cat.nombre_categoria,
  }));

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
              <li className="breadcrumb-item active" aria-current="page">Crear Producto</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-1 fw-bold">
                <i className="bi bi-plus-circle text-success me-2"></i>
                Crear Producto
              </h1>
              <p className="text-muted mb-0">
                <small>Registra un nuevo producto en el catálogo</small>
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
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-info-circle text-primary me-2"></i>
                  Información Básica
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Código SKU <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-upc-scan"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.codigo_sku ? 'is-invalid' : touched.codigo_sku && !errors.codigo_sku ? 'is-valid' : ''}`}
                        placeholder="Ej: PROD-001"
                        value={codigo_sku}
                        onChange={(e) => handleFieldChange('codigo_sku', e.target.value)}
                        onBlur={(e) => handleFieldBlur('codigo_sku', e.target.value)}
                        required
                      />
                      {errors.codigo_sku && <div className="invalid-feedback">{errors.codigo_sku}</div>}
                    </div>
                    <small className="text-muted">3-20 caracteres alfanuméricos</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Nombre del Producto <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-tag"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.nombre_producto ? 'is-invalid' : touched.nombre_producto && !errors.nombre_producto ? 'is-valid' : ''}`}
                        placeholder="Nombre descriptivo"
                        value={nombre_producto}
                        onChange={(e) => handleFieldChange('nombre_producto', e.target.value)}
                        onBlur={(e) => handleFieldBlur('nombre_producto', e.target.value)}
                        required
                      />
                      {errors.nombre_producto && <div className="invalid-feedback">{errors.nombre_producto}</div>}
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Presentación</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-inbox"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.presentacion ? 'is-invalid' : touched.presentacion && !errors.presentacion ? 'is-valid' : ''}`}
                        placeholder="Ej: 500g, 1L, Caja x12"
                        value={presentacion}
                        onChange={(e) => handleFieldChange('presentacion', e.target.value)}
                        onBlur={(e) => handleFieldBlur('presentacion', e.target.value)}
                      />
                      {errors.presentacion && <div className="invalid-feedback">{errors.presentacion}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0 mb-4" style={{ position: 'relative', zIndex: 50 }}>
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-cash-coin text-primary me-2"></i>
                  Precio e Inventario
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Stock Inicial <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-box"></i>
                      </span>
                      <input
                        type="number"
                        className={`form-control ${errors.stock ? 'is-invalid' : touched.stock && !errors.stock ? 'is-valid' : ''}`}
                        placeholder="0"
                        value={stock}
                        onChange={(e) => handleFieldChange('stock', Number(e.target.value))}
                        onBlur={(e) => handleFieldBlur('stock', e.target.value)}
                        min="0"
                      />
                      <span className="input-group-text bg-light">unidades</span>
                      {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      Precio Unitario <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">$</span>
                      <input
                        type="number"
                        className={`form-control ${errors.precio_unitario ? 'is-invalid' : touched.precio_unitario && !errors.precio_unitario ? 'is-valid' : ''}`}
                        placeholder="0.00"
                        value={precio_unitario}
                        onChange={(e) => handleFieldChange('precio_unitario', Number(e.target.value))}
                        onBlur={(e) => handleFieldBlur('precio_unitario', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                      {errors.precio_unitario && <div className="invalid-feedback">{errors.precio_unitario}</div>}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Fecha de Vencimiento</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-calendar"></i>
                      </span>
                      <input
                        type="date"
                        className={`form-control ${errors.fecha_vencimiento ? 'is-invalid' : touched.fecha_vencimiento && !errors.fecha_vencimiento ? 'is-valid' : ''}`}
                        value={fecha_vencimiento}
                        onChange={(e) => handleFieldChange('fecha_vencimiento', e.target.value)}
                        onBlur={(e) => handleFieldBlur('fecha_vencimiento', e.target.value)}
                      />
                      {errors.fecha_vencimiento && <div className="invalid-feedback">{errors.fecha_vencimiento}</div>}
                    </div>
                  </div>
                  <div className="col-md-6" style={{ position: 'relative', zIndex: 10 }}>
                    <label className="form-label fw-semibold">
                      Categoría <span className="text-danger">*</span>
                    </label>
                    <SearchableSelect
                      options={categoriaOptions}
                      value={id_categoria}
                      onChange={(value) => {
                        handleFieldChange('id_categoria', value);
                        handleFieldBlur('id_categoria', value);
                      }}
                      placeholder="Busca o selecciona una categoría"
                    />
                    {errors.id_categoria && (
                      <small className="text-danger d-block mt-1">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        {errors.id_categoria}
                      </small>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Estado</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-toggle-on"></i>
                      </span>
                      <select 
                        className="form-select" 
                        value={activo ? 'activo' : 'inactivo'}
                        onChange={(e) => setActivo(e.target.value === 'activo')}
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
                <div className="text-center mb-3">
                  <div 
                    className="position-relative mx-auto" 
                    style={{ 
                      width: '250px', 
                      height: '250px', 
                      borderRadius: '12px',
                      border: imageFile ? '3px solid #0d6efd' : '3px dashed #dee2e6',
                      overflow: 'hidden',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    {imageFile ? (
                      <img 
                        src={URL.createObjectURL(imageFile)} 
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <i className="bi bi-image text-muted" style={{ fontSize: '4rem' }}></i>
                        <p className="text-muted small mt-2">Sin imagen</p>
                      </div>
                    )}
                  </div>
                  {imageFile && (
                    <span className="badge bg-success mt-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Imagen seleccionada
                    </span>
                  )}
                </div>

                <div className="d-grid gap-2">
                  <label className="btn btn-outline-primary" style={{ cursor: 'pointer' }}>
                    <i className="bi bi-upload me-2"></i>
                    {imageFile ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                    <input 
                      type="file" 
                      className="d-none"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                    />
                  </label>
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
                    className="btn btn-success btn-lg px-5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Crear Producto
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
  );
}