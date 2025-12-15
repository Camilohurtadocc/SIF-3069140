// src/pages/EditarCliente.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import clientService from '../services/clientService'
import logger, { getErrorMessage } from '../utils/logger'
import {
  validateRequired,
  validateName,
  validateEmail,
  validateDocumento,
  validateTelefono
} from '../utils/validation'

export default function EditarCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    numero_documento: '',
    correo_electronico: '',
    numero_telefono: '',
    id_tipo_documento: '',
  })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        logger.info('EditarCliente', `Cargando datos del cliente ID: ${id}`)
        const data = await clientService.getById(id)
        if (mounted && data) {
          setCliente({
            primer_nombre: data.primer_nombre || '',
            segundo_nombre: data.segundo_nombre || '',
            primer_apellido: data.primer_apellido || '',
            segundo_apellido: data.segundo_apellido || '',
            numero_documento: data.numero_documento || '',
            correo_electronico: data.correo_electronico || '',
            numero_telefono: data.numero_telefono || '',
            id_tipo_documento: data.id_tipo_documento || '',
          })
          logger.success('EditarCliente', 'Datos del cliente cargados correctamente')
        }
      } catch (error) {
        logger.error('EditarCliente', 'Error al cargar datos del cliente', error)
        toast.error(getErrorMessage(error))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  // Validación en tiempo real
  const validateFieldRealTime = (fieldName, value) => {
    let error = null;
    
    switch(fieldName) {
      case 'primer_nombre':
        error = validateRequired(value, 'Primer nombre') || validateName(value, 'Primer nombre');
        break;
      case 'segundo_nombre':
        if (value) error = validateName(value, 'Segundo nombre');
        break;
      case 'primer_apellido':
        error = validateRequired(value, 'Primer apellido') || validateName(value, 'Primer apellido');
        break;
      case 'segundo_apellido':
        if (value) error = validateName(value, 'Segundo apellido');
        break;
      case 'numero_documento':
        error = validateRequired(value, 'Número de documento') || validateDocumento(value);
        break;
      case 'correo_electronico':
        error = validateRequired(value, 'Correo electrónico') || validateEmail(value);
        break;
      case 'numero_telefono':
        error = validateRequired(value, 'Número de teléfono') || validateTelefono(value);
        break;
      case 'id_tipo_documento':
        error = validateRequired(value, 'Tipo de documento');
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
    setCliente(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      validateFieldRealTime(fieldName, value);
    }
  };

  const handleFieldBlur = (fieldName, value) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateFieldRealTime(fieldName, value);
  };

  function validate(c) {
    const e = {}
    
    e.primer_nombre = validateRequired(c.primer_nombre, 'Primer nombre') || validateName(c.primer_nombre, 'Primer nombre');
    if (c.segundo_nombre) e.segundo_nombre = validateName(c.segundo_nombre, 'Segundo nombre');
    e.primer_apellido = validateRequired(c.primer_apellido, 'Primer apellido') || validateName(c.primer_apellido, 'Primer apellido');
    if (c.segundo_apellido) e.segundo_apellido = validateName(c.segundo_apellido, 'Segundo apellido');
    e.numero_documento = validateRequired(c.numero_documento, 'Número de documento') || validateDocumento(c.numero_documento);
    e.correo_electronico = validateRequired(c.correo_electronico, 'Correo electrónico') || validateEmail(c.correo_electronico);
    e.numero_telefono = validateRequired(c.numero_telefono, 'Número de teléfono') || validateTelefono(c.numero_telefono);
    e.id_tipo_documento = validateRequired(c.id_tipo_documento, 'Tipo de documento');
    
    // Filtrar solo errores reales
    return Object.fromEntries(
      Object.entries(e).filter(([_, v]) => v !== null && v !== undefined)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fieldErrors = validate(cliente)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length) {
      logger.warn('EditarCliente', 'Validación fallida', fieldErrors)
      return
    }

    const payload = {
      primer_nombre: cliente.primer_nombre,
      segundo_nombre: cliente.segundo_nombre || null,
      primer_apellido: cliente.primer_apellido,
      segundo_apellido: cliente.segundo_apellido || null,
      numero_documento: Number(cliente.numero_documento),
      correo_electronico: cliente.correo_electronico,
      numero_telefono: Number(cliente.numero_telefono),
      id_tipo_documento: Number(cliente.id_tipo_documento),
    }

    try {
      logger.info('EditarCliente', `Actualizando cliente ID: ${id}`, payload)
      await clientService.update(id, payload)
      logger.success('EditarCliente', `Cliente ${cliente.primer_nombre} ${cliente.primer_apellido} actualizado exitosamente`)
      toast.success('Cliente actualizado exitosamente')
      navigate('/clientes')
    } catch (error) {
      logger.error('EditarCliente', 'Error al actualizar cliente', error)
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
          <p className="mt-3 text-muted">Cargando información del cliente...</p>
        </div>
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
                <a href="/clientes" className="text-decoration-none">
                  <i className="bi bi-people me-1"></i>
                  Clientes
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Editar Cliente</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-1 fw-bold">
                <i className="bi bi-person-lines-fill text-primary me-2"></i>
                Editar Cliente
              </h1>
              <p className="text-muted mb-0">
                <small>Modifica la información del cliente</small>
              </p>
            </div>
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => navigate('/clientes')}
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
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-info-circle text-primary me-2"></i>
                  Información Personal
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Primer nombre <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        className={`form-control ${errors.primer_nombre ? 'is-invalid' : touched.primer_nombre && !errors.primer_nombre ? 'is-valid' : ''}`}
                        value={cliente.primer_nombre}
                        onChange={(e) => handleFieldChange('primer_nombre', e.target.value)}
                        onBlur={(e) => handleFieldBlur('primer_nombre', e.target.value)}
                        placeholder="Ej: Juan"
                        required
                      />
                      {errors.primer_nombre && <div className="invalid-feedback">{errors.primer_nombre}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Segundo nombre</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        className={`form-control ${errors.segundo_nombre ? 'is-invalid' : touched.segundo_nombre && !errors.segundo_nombre ? 'is-valid' : ''}`}
                        value={cliente.segundo_nombre || ''}
                        onChange={(e) => handleFieldChange('segundo_nombre', e.target.value)}
                        onBlur={(e) => handleFieldBlur('segundo_nombre', e.target.value)}
                        placeholder="Opcional"
                      />
                      {errors.segundo_nombre && <div className="invalid-feedback">{errors.segundo_nombre}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Primer apellido <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-person-badge"></i>
                      </span>
                      <input
                        className={`form-control ${errors.primer_apellido ? 'is-invalid' : touched.primer_apellido && !errors.primer_apellido ? 'is-valid' : ''}`}
                        value={cliente.primer_apellido}
                        onChange={(e) => handleFieldChange('primer_apellido', e.target.value)}
                        onBlur={(e) => handleFieldBlur('primer_apellido', e.target.value)}
                        placeholder="Ej: García"
                        required
                      />
                      {errors.primer_apellido && <div className="invalid-feedback">{errors.primer_apellido}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Segundo apellido</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-person-badge"></i>
                      </span>
                      <input
                        className={`form-control ${errors.segundo_apellido ? 'is-invalid' : touched.segundo_apellido && !errors.segundo_apellido ? 'is-valid' : ''}`}
                        value={cliente.segundo_apellido || ''}
                        onChange={(e) => handleFieldChange('segundo_apellido', e.target.value)}
                        onBlur={(e) => handleFieldBlur('segundo_apellido', e.target.value)}
                        placeholder="Opcional"
                      />
                      {errors.segundo_apellido && <div className="invalid-feedback">{errors.segundo_apellido}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Documentación */}
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-card-text text-primary me-2"></i>
                  Documentación
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Tipo de documento <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-card-heading"></i>
                      </span>
                      <select
                        className={`form-select ${errors.id_tipo_documento ? 'is-invalid' : touched.id_tipo_documento && !errors.id_tipo_documento ? 'is-valid' : ''}`}
                        value={cliente.id_tipo_documento}
                        onChange={(e) => handleFieldChange('id_tipo_documento', e.target.value)}
                        onBlur={(e) => handleFieldBlur('id_tipo_documento', e.target.value)}
                        required
                      >
                        <option value="">Seleccione...</option>
                        <option value="1">Cédula de ciudadanía</option>
                        <option value="2">Cédula de extranjería</option>
                        <option value="3">Pasaporte</option>
                      </select>
                      {errors.id_tipo_documento && <div className="invalid-feedback">{errors.id_tipo_documento}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Número de documento <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-hash"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.numero_documento ? 'is-invalid' : touched.numero_documento && !errors.numero_documento ? 'is-valid' : ''}`}
                        value={cliente.numero_documento}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleFieldChange('numero_documento', numericValue);
                        }}
                        onBlur={(e) => handleFieldBlur('numero_documento', e.target.value)}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="10"
                        placeholder="6-10 dígitos"
                        required
                      />
                      {errors.numero_documento && <div className="invalid-feedback">{errors.numero_documento}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Información de Contacto */}
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-telephone text-primary me-2"></i>
                  Información de Contacto
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Correo electrónico <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        className={`form-control ${errors.correo_electronico ? 'is-invalid' : touched.correo_electronico && !errors.correo_electronico ? 'is-valid' : ''}`}
                        type="email"
                        value={cliente.correo_electronico}
                        onChange={(e) => handleFieldChange('correo_electronico', e.target.value)}
                        onBlur={(e) => handleFieldBlur('correo_electronico', e.target.value)}
                        placeholder="correo@ejemplo.com"
                        required
                      />
                      {errors.correo_electronico && <div className="invalid-feedback">{errors.correo_electronico}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Número de teléfono <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-phone"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.numero_telefono ? 'is-invalid' : touched.numero_telefono && !errors.numero_telefono ? 'is-valid' : ''}`}
                        value={cliente.numero_telefono}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleFieldChange('numero_telefono', numericValue);
                        }}
                        onBlur={(e) => handleFieldBlur('numero_telefono', e.target.value)}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="10"
                        placeholder="7-10 dígitos"
                        required
                      />
                      {errors.numero_telefono && <div className="invalid-feedback">{errors.numero_telefono}</div>}
                    </div>
                  </div>
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
                    onClick={() => navigate('/clientes')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg px-5"
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Guardar Cambios
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
