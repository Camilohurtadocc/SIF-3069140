//  src/pages/Login.jsx
import React, { useState, useRef, useEffect } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { user, initializing } = useAuth()
  const { signIn } = useAuth()
  const DEV_BYPASS = import.meta.env?.VITE_DEV_BYPASS_LOGIN === 'true'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Limpiar tokens inválidos y redirigir si ya está logueado
  useEffect(() => {
    // Limpiar cualquier token almacenado al llegar al login
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    if (!initializing && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, initializing, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    const errors = {}
    const DEV_BYPASS = import.meta.env?.VITE_DEV_BYPASS_LOGIN === 'true'

    if (!email) errors.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Correo no válido'
    if (!DEV_BYPASS) {
      if (!password) errors.password = 'La contraseña es requerida'
      else if (password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setLoading(true)
    const result = await signIn({ email, password })
    setLoading(false)

    // signIn puede devolver { data, error } o { data: { user }, error }
    const signError = result?.error || (result?.data?.error) || null
    if (signError) {
      setError(signError.message || String(signError))
      return
    }
    navigate('/dashboard')
  }

  // Referencia para el logo y el audio
  const logoRef = useRef(null)
  const audioRef = useRef(null)

  // Animar cabeza y reproducir sonido
  const handleLogoClick = () => {
    if (logoRef.current) {
      logoRef.current.classList.remove('dog-head-animate')
      // Forzar reflow para reiniciar animación
      void logoRef.current.offsetWidth
      logoRef.current.classList.add('dog-head-animate')
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }

  // Mostrar loading mientras se verifica la sesión
  if (initializing) {
    return (
      <div className="login-bg d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-white">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-bg d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow-lg p-4 login-card-glass" style={{ maxWidth: 420, width: '100%', borderRadius: 24, border: '1px solid #e0eafc' }}>
        <div className="text-center mb-4">
          <div className="logo-circle mx-auto mb-2 d-flex align-items-center justify-content-center">
            <img
              ref={logoRef}
              src="/logo_perro.png"
              alt="Logo del Petshop"
              className="dog-head animated-logo"
              style={{ width: 100, height: 100, objectFit: 'contain', cursor: 'pointer' }}
              onClick={handleLogoClick}
              title="¡Hazme ladrar!"
            />
            <audio
              ref={audioRef}
              src="/big-dog-barking-300504.mp3"
              preload="auto"
              onError={() => alert('No se pudo cargar el sonido de ladrido. Verifica que big-dog-barking-300504.mp3 esté en la carpeta public.')}
            />
          </div>
          <h1 className="login-title mb-1">PETSHOP <span className="text-primary">"ENTRE PERROS Y GATOS"</span></h1>
          <h2 className="h6 text-secondary mb-3" style={{ fontWeight: 400 }}>INICIO DE SESIÓN</h2>
        </div>
        <form onSubmit={onSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text bg-white"><i className="bi bi-person" /></span>
            <input type="email" id="email" name="email" className="form-control" placeholder="Correo electrónico" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {fieldErrors.email && <div className="form-text text-danger mb-2">{fieldErrors.email}</div>}
          <div className="mb-3 input-group">
            <span className="input-group-text bg-white"><i className="bi bi-lock" /></span>
            <input type="password" id="password" name="password" className="form-control" placeholder="Contraseña" required={!DEV_BYPASS} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {fieldErrors.password && <div className="form-text text-danger mb-2">{fieldErrors.password}</div>}
          {DEV_BYPASS && (
            <div className="alert alert-warning py-2">
              Modo desarrollo: inicio de sesión bypass activado. Se aceptará cualquier correo y contraseña vacía.
            </div>
          )}
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <div className="mb-3 text-end">
            <a href="#" className="link-secondary small">¿Olvidó su contraseña?</a>
          </div>
          <button type="submit" className="btn btn-gradient w-100 py-2" disabled={loading}>
            {loading ? 'Iniciando...' : 'INICIAR'}
          </button>
        </form>
        <div className="text-center mt-4 text-muted small">
          ¡Bienvenido! Ingresa tus datos para acceder al mejor sistema de gestión 🐾
        </div>
      </div>
    </div>
  )
}
