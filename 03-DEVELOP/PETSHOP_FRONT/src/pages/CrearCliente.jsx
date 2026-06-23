// src/pages/CrearCliente.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Dropdown } from 'react-bootstrap'
import clientService from '../services/clientService'
import logger, { getErrorMessage } from '../utils/logger'
import {
  validateRequired,
  validateName,
  validateEmail,
  validateDocumento,
  validateTelefono
} from '../utils/validation'

export default function CrearCliente() {
   const [primer_nombre, setPrimerNombre] = useState('')
   const [segundo_nombre, setSegundoNombre] = useState('')
   const [primer_apellido, setPrimerApellido] = useState('')
   const [segundo_apellido, setSegundoApellido] = useState('')
   const [numero_documento, setNumeroDocumento] = useState('')
   const [correo_electronico, setCorreoElectronico] = useState('')
   const [numero_telefono, setNumeroTelefono] = useState('')
   const [id_tipo_documento, setIdTipoDocumento] = useState('')
   const [errors, setErrors] = useState({})
   const [touched, setTouched] = useState({})
   const [loading, setLoading] = useState(false)
   const [hoverTipoDocumento, setHoverTipoDocumento] = useState(false)
   const [hoverItem, setHoverItem] = useState(null)
   const navigate = useNavigate()

  // Validación en tiempo real para cada campo
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
    switch(fieldName) {
      case 'primer_nombre':
        setPrimerNombre(value);
        break;
      case 'segundo_nombre':
        setSegundoNombre(value);
        break;
      case 'primer_apellido':
        setPrimerApellido(value);
        break;
      case 'segundo_apellido':
        setSegundoApellido(value);
        break;
      case 'numero_documento':
        setNumeroDocumento(value);
        break;
      case 'correo_electronico':
        setCorreoElectronico(value);
        break;
      case 'numero_telefono':
        setNumeroTelefono(value);
        break;
      case 'id_tipo_documento':
        setIdTipoDocumento(value);
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

  function validar() {
    const e = {}
    
    e.primer_nombre = validateRequired(primer_nombre, 'Primer nombre') || validateName(primer_nombre, 'Primer nombre');
    if (segundo_nombre) e.segundo_nombre = validateName(segundo_nombre, 'Segundo nombre');
    e.primer_apellido = validateRequired(primer_apellido, 'Primer apellido') || validateName(primer_apellido, 'Primer apellido');
    if (segundo_apellido) e.segundo_apellido = validateName(segundo_apellido, 'Segundo apellido');
    e.numero_documento = validateRequired(numero_documento, 'Número de documento') || validateDocumento(numero_documento);
    e.correo_electronico = validateRequired(correo_electronico, 'Correo electrónico') || validateEmail(correo_electronico);
    e.numero_telefono = validateRequired(numero_telefono, 'Número de teléfono') || validateTelefono(numero_telefono);
    e.id_tipo_documento = validateRequired(id_tipo_documento, 'Tipo de documento');
    
    // Filtrar solo errores reales (no null)
    const filteredErrors = Object.fromEntries(
      Object.entries(e).filter(([_, v]) => v !== null && v !== undefined)
    );
    
    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) {
      logger.warn('CrearCliente', 'Validation failed', errors)
      return
    }
    
    setLoading(true)
    try {
      const payload = {
        primer_nombre,
        segundo_nombre: segundo_nombre || null,
        primer_apellido,
        segundo_apellido: segundo_apellido || null,
        numero_documento: Number(numero_documento),
        correo_electronico,
        numero_telefono: Number(numero_telefono),
        id_tipo_documento: Number(id_tipo_documento),
      }
      
      logger.info('CrearCliente', 'Enviando datos de nuevo cliente', payload)
      await clientService.create(payload)
      logger.success('CrearCliente', `Cliente ${primer_nombre} ${primer_apellido} creado exitosamente`)
      toast.success('Cliente creado exitosamente')
      navigate('/clientes')
    } catch (err) {
      logger.error('CrearCliente', 'Error al crear cliente', err)
      const errorMsg = getErrorMessage(err)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
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
              <li className="breadcrumb-item active" aria-current="page">Crear Cliente</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-1 fw-bold">
                <i className="bi bi-person-plus-fill text-primary me-2"></i>
                Crear Cliente
              </h1>
              <p className="text-muted mb-0">
                <small>Registra un nuevo cliente en el sistema</small>
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
                        type="text"
                        className={`form-control ${errors.primer_nombre ? 'is-invalid' : touched.primer_nombre && !errors.primer_nombre ? 'is-valid' : ''}`}
                        placeholder="Ej: Juan"
                        value={primer_nombre}
                        onChange={(e) => handleFieldChange('primer_nombre', e.target.value)}
                        onBlur={(e) => handleFieldBlur('primer_nombre', e.target.value)}
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
                        type="text"
                        className={`form-control ${errors.segundo_nombre ? 'is-invalid' : touched.segundo_nombre && !errors.segundo_nombre ? 'is-valid' : ''}`}
                        placeholder="Opcional"
                        value={segundo_nombre}
                        onChange={(e) => handleFieldChange('segundo_nombre', e.target.value)}
                        onBlur={(e) => handleFieldBlur('segundo_nombre', e.target.value)}
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
                        type="text"
                        className={`form-control ${errors.primer_apellido ? 'is-invalid' : touched.primer_apellido && !errors.primer_apellido ? 'is-valid' : ''}`}
                        placeholder="Ej: García"
                        value={primer_apellido}
                        onChange={(e) => handleFieldChange('primer_apellido', e.target.value)}
                        onBlur={(e) => handleFieldBlur('primer_apellido', e.target.value)}
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
                        type="text"
                        className={`form-control ${errors.segundo_apellido ? 'is-invalid' : touched.segundo_apellido && !errors.segundo_apellido ? 'is-valid' : ''}`}
                        placeholder="Opcional"
                        value={segundo_apellido}
                        onChange={(e) => handleFieldChange('segundo_apellido', e.target.value)}
                        onBlur={(e) => handleFieldBlur('segundo_apellido', e.target.value)}
                      />
                      {errors.segundo_apellido && <div className="invalid-feedback">{errors.segundo_apellido}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Documentación */}
          <div className="col-12" style={{ position: 'relative', zIndex: 100 }}>
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-card-text text-primary me-2"></i>
                  Documentación
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6" style={{ position: 'relative', zIndex: 10 }}>
                    <label className="form-label fw-semibold">
                      Tipo de documento <span className="text-danger">*</span>
                    </label>
                    <Dropdown onSelect={(eventKey) => {
                      handleFieldChange('id_tipo_documento', eventKey);
                      handleFieldBlur('id_tipo_documento', eventKey);
                    }}>
                      <Dropdown.Toggle
                        variant={id_tipo_documento ? "primary" : hoverTipoDocumento ? "primary" : "light"}
                        className={`form-control w-100 text-start d-flex align-items-center ${errors.id_tipo_documento ? 'is-invalid' : touched.id_tipo_documento && !errors.id_tipo_documento ? 'is-valid' : ''}`}
                        onMouseEnter={() => setHoverTipoDocumento(true)}
                        onMouseLeave={() => setHoverTipoDocumento(false)}
                      >
                        {id_tipo_documento === '1' ? (
                          <>
                            <i className="bi bi-person-badge me-2"></i>
                            Cédula de ciudadanía
                          </>
                        ) : id_tipo_documento === '2' ? (
                          <>
                            <i className="bi bi-globe me-2"></i>
                            Cédula de extranjería
                          </>
                        ) : id_tipo_documento === '3' ? (
                          <>
                            <i className="bi bi-passport me-2"></i>
                            Pasaporte
                          </>
                        ) : (
                          'Seleccione un tipo...'
                        )}
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-100" style={{ zIndex: 1050 }}>
                        <Dropdown.Item
                          eventKey="1"
                          onMouseEnter={() => setHoverItem('1')}
                          onMouseLeave={() => setHoverItem(null)}
                          style={hoverItem === '1' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
                        >
                          <i className="bi bi-person-badge me-2"></i>
                          Cédula de ciudadanía
                        </Dropdown.Item>
                        <Dropdown.Item
                          eventKey="2"
                          onMouseEnter={() => setHoverItem('2')}
                          onMouseLeave={() => setHoverItem(null)}
                          style={hoverItem === '2' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
                        >
                          <i className="bi bi-globe me-2"></i>
                          Cédula de extranjería
                        </Dropdown.Item>
                        <Dropdown.Item
                          eventKey="3"
                          onMouseEnter={() => setHoverItem('3')}
                          onMouseLeave={() => setHoverItem(null)}
                          style={hoverItem === '3' ? { backgroundColor: '#e3f2fd', color: '#1976d2' } : {}}
                        >
                          <i className="bi bi-passport me-2"></i>
                          Pasaporte
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    {errors.id_tipo_documento && (
                      <small className="text-danger d-block mt-1">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        {errors.id_tipo_documento}
                      </small>
                    )}
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
                        placeholder="12345678"
                        value={numero_documento}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleFieldChange('numero_documento', numericValue);
                        }}
                        onBlur={(e) => handleFieldBlur('numero_documento', e.target.value)}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="10"
                        required
                      />
                      {errors.numero_documento && <div className="invalid-feedback">{errors.numero_documento}</div>}
                    </div>
                    <small className="text-muted">6-10 dígitos</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Información de Contacto */}
          <div className="col-12" style={{ position: 'relative', zIndex: 1 }}>
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
                        type="email"
                        className={`form-control ${errors.correo_electronico ? 'is-invalid' : touched.correo_electronico && !errors.correo_electronico ? 'is-valid' : ''}`}
                        placeholder="correo@ejemplo.com"
                        value={correo_electronico}
                        onChange={(e) => handleFieldChange('correo_electronico', e.target.value)}
                        onBlur={(e) => handleFieldBlur('correo_electronico', e.target.value)}
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
                        placeholder="3001234567"
                        value={numero_telefono}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleFieldChange('numero_telefono', numericValue);
                        }}
                        onBlur={(e) => handleFieldBlur('numero_telefono', e.target.value)}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="10"
                        required
                      />
                      {errors.numero_telefono && <div className="invalid-feedback">{errors.numero_telefono}</div>}
                    </div>
                    <small className="text-muted">7-10 dígitos</small>
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
                        Crear Cliente
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
