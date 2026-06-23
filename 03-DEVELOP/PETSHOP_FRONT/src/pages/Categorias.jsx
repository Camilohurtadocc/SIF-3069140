// src/pages/Categorias.jsx
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import categoryService from '../services/categoryService'
import logger, { getErrorMessage } from '../utils/logger'
import { validateRequired, validateString } from '../utils/validation'
import api from '../services/api'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        logger.info('Categorias', 'Cargando categorías y productos')
        const categoriesData = await categoryService.getAll()
        if (mounted) {
          setCategorias(categoriesData || [])
          logger.success('Categorias', `${categoriesData?.length || 0} categorías cargadas`)
        }

        // Cargar productos para contar por categoría
        try {
          const productResponse = await api.get('/product', {
            params: { page: 1, pageSize: 1000 }
          })
          let productsData = productResponse.data
          if (!Array.isArray(productsData)) {
            productsData = productsData.data || []
          }
          if (mounted) {
            setProductos(productsData || [])
            logger.success('Categorias', `${productsData?.length || 0} productos cargados`)
          }
        } catch (error) {
          logger.error('Categorias', 'Error al cargar productos', error)
        }
      } catch (error) {
        logger.error('Categorias', 'Error al cargar categorías', error)
        toast.error(getErrorMessage(error))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const validateFieldRealTime = (value) => {
    const error = validateRequired(value, 'Nombre de categoría') || validateString(value, 2, 50, 'Nombre de categoría');
    setErrors({ nombre: error });
    return error;
  };

  const handleFieldChange = (value) => {
    setNombre(value);
    if (touched.nombre) {
      validateFieldRealTime(value);
    }
  };

  const handleFieldBlur = (value) => {
    setTouched({ nombre: true });
    validateFieldRealTime(value);
  };

  async function handleCreate(e) {
    e.preventDefault()
    
    const error = validateRequired(nombre, 'Nombre de categoría') || validateString(nombre, 2, 50, 'Nombre de categoría');
    if (error) {
      setErrors({ nombre: error });
      toast.warn(error);
      return;
    }

    try {
      logger.info('Categorias', `Creando categoría: ${nombre}`)
      await categoryService.create({ nombre_categoria: nombre.trim(), estado: 'activo' })
      logger.success('Categorias', `Categoria "${nombre}" creada exitosamente`)
      toast.success('Categoria creada exitosamente')
      setNombre('')
      setErrors({})
      setTouched({})
      const data = await categoryService.getAll()
      setCategorias(data || [])
    } catch (error) {
      logger.error('Categorias', 'Error al crear categoría', error)
      toast.error(getErrorMessage(error))
    }
  }

  async function handleDelete(id_categoria) {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      logger.info('Categorias', `Eliminando categoría ID: ${id_categoria}`)
      await categoryService.delete(id_categoria)
      logger.success('Categorias', 'Categoria eliminada exitosamente')
      toast.success('Categoria eliminada exitosamente')
      setCategorias((c) => c.filter(x => x.id_categoria !== id_categoria))
    } catch (error) {
      logger.error('Categorias', 'Error al eliminar categoría', error)
      toast.error(getErrorMessage(error))
    }
  }

  async function handleToggleStatus(id_categoria, currentStatus) {
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo'
    try {
      logger.info('Categorias', `Cambiando estado de categoría ID: ${id_categoria} a ${newStatus}`)
      await categoryService.update(id_categoria, { estado: newStatus })
      logger.success('Categorias', `Estado cambiado a ${newStatus}`)
      toast.success(`Categoria ${newStatus === 'activo' ? 'activada' : 'desactivada'} exitosamente`)
      setCategorias((c) =>
        c.map(cat =>
          cat.id_categoria === id_categoria ? { ...cat, estado: newStatus } : cat
        )
      )
    } catch (error) {
      logger.error('Categorias', 'Error al cambiar estado de categoría', error)
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <section className="categorias-section container-fluid py-4">
      {/* Breadcrumb moderno */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house-door me-1"></i>
            <a href="#/dashboard">Inicio</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            <i className="bi bi-tags me-1"></i>
            Categorías
          </li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-xl-10">
          {/* Header Card */}
          <div className="card border-0 shadow-sm mb-4 animate-fade-in">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="icon-box-modern bg-gradient-success text-white me-3">
                    <i className="bi bi-tags fs-3"></i>
                  </div>
                  <div>
                    <h1 className="mb-1 fs-2 fw-bold text-dark">Gestión de Categorías</h1>
                    <p className="mb-0 text-muted">Organiza y administra las categorías de productos</p>
                  </div>
                </div>
                <div className="stats-badge-modern">
                  <span className="badge bg-success" style={{ fontSize: '1.2rem', padding: '0.75rem 1.5rem' }}>
                    <i className="bi bi-collection me-2"></i>
                    {categorias.length} {categorias.length === 1 ? 'Categoría' : 'Categorías'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de creación */}
          <div className="card border-0 shadow-sm mb-4 animate-fade-in" style={{ zIndex: 100 }}>
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-plus-circle-fill text-success me-2"></i>
                Crear Nueva Categoría
              </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleCreate}>
                <div className="row g-3 align-items-start">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-tag me-2"></i>
                      Nombre de la Categoría <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${errors.nombre ? 'is-invalid' : touched.nombre && !errors.nombre ? 'is-valid' : ''}`}
                      placeholder="Ej: Alimentos, Accesorios, Juguetes..."
                      value={nombre}
                      onChange={(e) => handleFieldChange(e.target.value)}
                      onBlur={(e) => handleFieldBlur(e.target.value)}
                      required
                    />
                    {errors.nombre && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        {errors.nombre}
                      </div>
                    )}
                    {touched.nombre && !errors.nombre && nombre.trim() && (
                      <div className="valid-feedback d-block">
                        <i className="bi bi-check-circle me-1"></i>
                        Nombre válido
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-white d-block" style={{ opacity: 0 }}>.</label>
                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100 fw-bold"
                      disabled={!nombre.trim() || errors.nombre}
                      style={{ height: '48px' }}
                    >
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Crear Categoría
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Lista de categorías */}
          <div className="card border-0 shadow-sm animate-fade-in">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-list-ul text-primary me-2"></i>
                Categorías Registradas
              </h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-3 text-muted fw-semibold">Cargando categorías...</p>
                </div>
              ) : categorias.length === 0 ? (
                <div className="empty-state-modern py-5">
                  <div className="empty-icon-circle mb-3">
                    <i className="bi bi-tags"></i>
                  </div>
                  <h5 className="text-muted mb-2">No hay categorías registradas</h5>
                  <p className="text-muted">Crea tu primera categoría usando el formulario superior</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4" style={{ width: '60px' }}>
                          <i className="bi bi-tag-fill text-muted"></i>
                        </th>
                        <th className="fw-semibold">Nombre de la Categoría</th>
                        <th className="fw-semibold text-center" style={{ width: '120px' }}>Productos</th>
                        <th className="fw-semibold text-center" style={{ width: '180px' }}>Estado</th>
                        <th className="fw-semibold text-center" style={{ width: '120px' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.map((cat, index) => (
                        <tr key={cat.id_categoria} className="category-row-modern">
                          <td className="px-4">
                            <div className="category-number-badge">
                              {index + 1}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className={`category-icon-modern ${cat.estado === 'activo' ? 'bg-success' : 'bg-secondary'} bg-opacity-10 me-3`}>
                                <i className={`bi bi-tag-fill ${cat.estado === 'activo' ? 'text-success' : 'text-secondary'}`}></i>
                              </div>
                              <div>
                                <div className="fw-semibold text-dark">{cat.nombre_categoria}</div>
                                <small className="text-muted">ID: {cat.id_categoria}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="badge bg-info text-dark" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                              <i className="bi bi-box-seam me-1"></i>
                              {productos.filter(p => p.id_categoria === cat.id_categoria).length}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center align-items-center gap-2">
                              <span className={`badge ${cat.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                                <i className={`bi ${cat.estado === 'activo' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                                {cat.estado === 'activo' ? 'Activo' : 'Inactivo'}
                              </span>
                              <button
                                className={`btn btn-sm ${cat.estado === 'activo' ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                                onClick={() => handleToggleStatus(cat.id_categoria, cat.estado)}
                                title={cat.estado === 'activo' ? 'Desactivar categoría' : 'Activar categoría'}
                                style={{ width: '36px', height: '36px', padding: 0 }}
                              >
                                <i className={`bi ${cat.estado === 'activo' ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                              </button>
                            </div>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(cat.id_categoria)}
                              title="Eliminar categoría"
                              style={{ width: '36px', height: '36px', padding: 0 }}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
