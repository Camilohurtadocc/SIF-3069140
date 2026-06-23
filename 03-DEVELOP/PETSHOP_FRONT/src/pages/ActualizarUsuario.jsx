// src/pages/ActualizarUsuario.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import userService from '../services/userService'
import { validateRequired, validateEmail, validatePassword } from '../utils/validation'
import logger, { getErrorMessage } from '../utils/logger'

export default function ActualizarUsuario() {
  console.log('ActualizarUsuario componente montado');
  
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, refreshUser } = useAuth()

  console.log('ID del usuario a editar:', id);

  const [usuario, setUsuario] = useState(null)
  const [usuarioOriginal, setUsuarioOriginal] = useState(null) // Guardar datos originales
  const [rolesOptions, setRolesOptions] = useState([])
  const [rolSeleccionado, setRolSeleccionado] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    console.log('useEffect ejecutado para cargar usuario');
    let mounted = true

    async function loadUsuario() {
      setLoading(true)
      try {
        logger.info('ActualizarUsuario', `Cargando datos del usuario ID: ${id}`)
        const data = await userService.getById(id)
        if (mounted && data) {
          setUsuario(data)
          setUsuarioOriginal(data) // Guardar datos originales
          // Extraer el rol si viene en el objeto
          if (data.id_rol) {
            setRolSeleccionado(String(data.id_rol))
          }
        }
        logger.success('ActualizarUsuario', 'Datos del usuario cargados correctamente')
      } catch (e) {
        logger.error('ActualizarUsuario', 'Error al cargar usuario', e)
        toast.error(getErrorMessage(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    async function loadRoles() {
      // Roles estáticos ya que el backend parece tener solo Administrador y Vendedor
      setRolesOptions([
        { id_rol: 1, nombre_rol: 'Administrador' },
        { id_rol: 2, nombre_rol: 'Vendedor' }
      ])
      logger.info('ActualizarUsuario', 'Roles disponibles cargados')
    }

    loadUsuario()
    loadRoles()

    return () => { mounted = false }
  }, [id])

  const validateFieldRealTime = (fieldName, value) => {
    let error = null;
    
    switch(fieldName) {
      case 'correo_electronico':
        error = validateRequired(value, 'Correo electrónico') || validateEmail(value);
        break;
      case 'password':
        if (value) error = validatePassword(value);
        break;
      case 'rol':
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
    if (fieldName === 'correo_electronico') {
      setUsuario(prev => ({ ...prev, correo_electronico: value }));
    } else if (fieldName === 'rol') {
      setRolSeleccionado(value);
    } else if (fieldName === 'password') {
      setPassword(value);
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
    e.preventDefault()
    console.log('handleSubmit ejecutado');
    
    if (!usuario) {
      console.error('No hay usuario para actualizar');
      return;
    }

    console.log('Datos del formulario:', {
      correo: usuario.correo_electronico,
      rolSeleccionado,
      password: password ? '***' : 'sin cambios',
      usuarioCompleto: usuario
    });

    const validationErrors = {}
    validationErrors.correo_electronico = validateRequired(usuario.correo_electronico, 'Correo electrónico') || validateEmail(usuario.correo_electronico);
    validationErrors.rol = validateRequired(rolSeleccionado, 'Rol');
    if (password) {
      validationErrors.password = validatePassword(password);
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(validationErrors).filter(([_, v]) => v !== null && v !== undefined)
    );

    if (Object.keys(filteredErrors).length) {
      console.error('Errores de validación:', filteredErrors);
      setErrors(filteredErrors);
      Object.values(filteredErrors).forEach(m => toast.warn(m))
      logger.warn('ActualizarUsuario', 'Validación fallida', filteredErrors)
      return
    }

    setLoading(true)
    try {
      console.log('========================================');
      console.log('INICIO DE ACTUALIZACIÓN DE USUARIO');
      console.log('========================================');
      
      const payload = {
        correo_electronico: usuario.correo_electronico,
        idioma: usuario.idioma || 'es',
        id_rol: Number(rolSeleccionado)
      }
      
      // Agregar password solo si se proporcionó
      if (password && password.length >= 6) {
        payload.password = password
      }

      // Verificar si el rol cambió
      const rolOriginal = usuarioOriginal?.id_rol ? String(usuarioOriginal.id_rol) : null;
      const rolCambio = rolOriginal !== rolSeleccionado;
      
      console.log('Usuario ID:', id);
      console.log('Datos a enviar:', JSON.stringify(payload, null, 2));
      console.log('Rol cambió:', rolCambio, '(', rolOriginal, '→', rolSeleccionado, ')');
      
      logger.info('ActualizarUsuario', `Actualizando usuario ID: ${id}`, payload)
      
      console.log('Enviando request al backend...');
      
      // Usar endpoint específico para cambio de rol
      let response;
      if (rolCambio) {
        console.log('Usando endpoint /user/:id/role (rol cambió)');
        response = await userService.updateRole(id, payload);
      } else {
        console.log('Usando endpoint /user/:id (solo datos)');
        response = await userService.update(id, payload);
      }
      
      console.log('Response recibida');
      console.log('Status:', response?.status || 'N/A');
      console.log('Success:', response?.success);
      console.log('Data completa:', response);
      
      console.log('Respuesta del backend después de actualizar:', response);
      
      console.log('Verificando cambio de rol:', {
        usuarioEditado: usuario.correo_electronico,
        rolOriginal,
        rolNuevo: rolSeleccionado,
        cambioRol: rolCambio,
        usuarioActualizado: response?.user || response
      });

      // Si cambió el rol, marcar sesión para invalidación
      if (rolCambio) {
        console.log('Rol modificado - El usuario deberá volver a iniciar sesión');
        
        // Guardar en localStorage una marca de que este usuario necesita re-login
        const usersToLogout = JSON.parse(localStorage.getItem('usersToLogout') || '[]');
        if (!usersToLogout.includes(id)) {
          usersToLogout.push(id);
          localStorage.setItem('usersToLogout', JSON.stringify(usersToLogout));
          console.log('Usuario marcado en usersToLogout');
        }
        
        toast.info(`Usuario actualizado. Si "${usuario.correo_electronico}" está conectado, deberá volver a iniciar sesión.`);
      }

      logger.success('ActualizarUsuario', `Usuario ${usuario.correo_electronico} actualizado exitosamente`)
      toast.success('Usuario actualizado exitosamente')
      
      console.log('Actualización completada, navegando a /usuarios');
      console.log('Respuesta final:', response);
      console.log('========================================');
      console.log('FIN DE ACTUALIZACIÓN DE USUARIO');
      console.log('========================================');
      
      // Forzar recarga completa para ver cambios en la tabla
      // Esto asegura que la lista de usuarios se recargue desde el servidor
      setTimeout(() => {
        console.log('Navegando ahora...');
        window.location.href = '/usuarios';
      }, 2000); // 2 segundos para ver los logs
    } catch (err) {
      console.log('========================================');
      console.log('ERROR EN ACTUALIZACIÓN');
      console.log('========================================');
      console.error('Error object:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      console.error('Stack:', err.stack);
      
      logger.error('ActualizarUsuario', 'Error al actualizar usuario', err)
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (loading && !usuario) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando información del usuario...</p>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
          <div>
            <strong>Usuario no encontrado</strong>
            <p className="mb-0">El usuario que buscas no existe o fue eliminado.</p>
          </div>
        </div>
        <button className="btn btn-outline-primary" onClick={() => navigate('/usuarios')}>
          <i className="bi bi-arrow-left me-2"></i>
          Volver a Usuarios
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
                <a href="/usuarios" className="text-decoration-none">
                  <i className="bi bi-person-circle me-1"></i>
                  Usuarios
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Editar Usuario</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h3 mb-1 fw-bold">
                <i className="bi bi-person-gear text-primary me-2"></i>
                Editar Usuario
              </h1>
              <p className="text-muted mb-0">
                <small>Modifica la información del usuario {usuario.correo_electronico}</small>
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
                        value={usuario.correo_electronico || ''}
                        onChange={(e) => handleFieldChange('correo_electronico', e.target.value)}
                        onBlur={(e) => handleFieldBlur('correo_electronico', e.target.value)}
                        placeholder="usuario@ejemplo.com"
                        required
                      />
                      {errors.correo_electronico && <div className="invalid-feedback">{errors.correo_electronico}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Idioma</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-translate"></i>
                      </span>
                      <select className="form-select" value={usuario.idioma || 'es'} onChange={(e)=>setUsuario({...usuario, idioma: e.target.value})}>
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Estado</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-toggle-on"></i>
                      </span>
                      <select className="form-select" value={(Number(usuario.activado) === 1 || usuario.activado === true) ? '1' : '0'} onChange={(e)=>setUsuario({...usuario, activado: e.target.value === '1' ? 1 : 0})}>
                        <option value="1">Activo</option>
                        <option value="0">Inactivo</option>
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
                        className={`form-select ${errors.rol ? 'is-invalid' : touched.rol && !errors.rol ? 'is-valid' : ''}`}
                        value={rolSeleccionado}
                        onChange={(e) => handleFieldChange('rol', e.target.value)}
                        onBlur={(e) => handleFieldBlur('rol', e.target.value)}
                        required
                      >
                        <option value="">-- Seleccione un rol --</option>
                        {rolesOptions.map(r => (
                          <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                        ))}
                      </select>
                      {errors.rol && <div className="invalid-feedback">{errors.rol}</div>}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Nueva contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-key"></i>
                      </span>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : touched.password && !errors.password ? 'is-valid' : ''}`}
                        placeholder="Dejar en blanco para no cambiar (mín. 6 caracteres)"
                        value={password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        onBlur={(e) => handleFieldBlur('password', e.target.value)}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Opcional. Solo completar si deseas cambiar la contraseña.
                    </small>
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
                    className="btn btn-primary btn-lg px-5"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
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
