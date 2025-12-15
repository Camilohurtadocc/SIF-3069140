// src/pages/CrearUsuario.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormLayout from '../components/FormLayout';
import api from '../services/api';
import { validateRequired, validateEmail, validatePassword } from '../utils/validation';
import logger, { getErrorMessage } from '../utils/logger';

export default function CrearUsuario() {
  const navigate = useNavigate();

  const [correo_electronico, setCorreoElectronico] = useState('');
  const [idioma, setIdioma] = useState('Español');
  const [password, setPassword] = useState('');
  const [id_rol, setRol] = useState('');

  const [rolesOptions, setRolesOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setRolesOptions([
      { id_rol: 1, nombre_rol: 'Administrador' },
      { id_rol: 2, nombre_rol: 'Vendedor' },
    ]);
  }, []);

  const validateFieldRealTime = (fieldName, value) => {
    let error = null;
    
    switch(fieldName) {
      case 'correo_electronico':
        error = validateRequired(value, 'Correo electrónico') || validateEmail(value);
        break;
      case 'password':
        error = validateRequired(value, 'Contraseña') || validatePassword(value);
        break;
      case 'id_rol':
        error = validateRequired(value, 'Rol');
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
      case 'correo_electronico':
        setCorreoElectronico(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'id_rol':
        setRol(value);
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

    validationErrors.correo_electronico = validateRequired(correo_electronico, 'Correo electrónico') || validateEmail(correo_electronico);
    validationErrors.password = validateRequired(password, 'Contraseña') || validatePassword(password);
    validationErrors.id_rol = validateRequired(id_rol, 'Rol');

    const filteredErrors = Object.fromEntries(
      Object.entries(validationErrors).filter(([_, v]) => v !== null && v !== undefined)
    );

    if (Object.keys(filteredErrors).length) {
      setErrors(filteredErrors);
      Object.values(filteredErrors).forEach((msg) => toast.warn(msg));
      logger.warn('CrearUsuario', 'Validación fallida', filteredErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        correo_electronico,
        password,
        idioma,
        id_rol: Number(id_rol),
      };

      logger.info('CrearUsuario', 'Creando nuevo usuario', { correo_electronico, id_rol })
      await api.post('/user', payload);
      logger.success('CrearUsuario', `Usuario ${correo_electronico} creado exitosamente`)
      toast.success('Usuario creado exitosamente');
      navigate('/usuarios');

    } catch (err) {
      logger.error('CrearUsuario', 'Error al crear usuario', err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
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
                <a href="/usuarios" className="text-decoration-none">
                  <i className="bi bi-person-circle me-1"></i>
                  Usuarios
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Crear Usuario</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-1 fw-bold">
                <i className="bi bi-person-plus text-warning me-2"></i>
                Crear Usuario
              </h1>
              <p className="text-muted mb-0">
                <small>Registra un nuevo usuario en el sistema</small>
              </p>
            </div>
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => navigate('/usuarios')}
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
                  Información de la Cuenta
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-12">
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
                        placeholder="usuario@ejemplo.com"
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
                      Contraseña <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-key"></i>
                      </span>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : touched.password && !errors.password ? 'is-valid' : ''}`}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        onBlur={(e) => handleFieldBlur('password', e.target.value)}
                        required
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                    <small className="text-muted">Mínimo 6 caracteres</small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Idioma</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-translate"></i>
                      </span>
                      <select className="form-select" value={idioma} onChange={(e) => setIdioma(e.target.value)}>
                        <option value="Español">Español</option>
                        <option value="Ingles">Inglés</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">
                      Rol <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-shield-check"></i>
                      </span>
                      <select
                        className={`form-select ${errors.id_rol ? 'is-invalid' : touched.id_rol && !errors.id_rol ? 'is-valid' : ''}`}
                        value={id_rol}
                        onChange={(e) => handleFieldChange('id_rol', e.target.value)}
                        onBlur={(e) => handleFieldBlur('id_rol', e.target.value)}
                        required
                      >
                        <option value="">Seleccione un rol...</option>
                        {rolesOptions.map((r) => (
                          <option key={r.id_rol} value={r.id_rol}>
                            {r.nombre_rol}
                          </option>
                        ))}
                      </select>
                      {errors.id_rol && <div className="invalid-feedback">{errors.id_rol}</div>}
                    </div>
                    {id_rol && (
                      <div className="mt-2">
                        <span className={`badge ${rolesOptions.find(r => r.id_rol == id_rol)?.nombre_rol === 'Administrador' ? 'bg-success' : 'bg-info'}`}>
                          <i className={`bi ${rolesOptions.find(r => r.id_rol == id_rol)?.nombre_rol === 'Administrador' ? 'bi-shield-check' : 'bi-person'} me-1`}></i>
                          {rolesOptions.find(r => r.id_rol == id_rol)?.nombre_rol === 'Administrador' ? 'Acceso completo al sistema' : 'Acceso limitado'}
                        </span>
                      </div>
                    )}
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
                    onClick={() => navigate('/usuarios')}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-warning btn-lg px-5 text-white"
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
                        Crear Usuario
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