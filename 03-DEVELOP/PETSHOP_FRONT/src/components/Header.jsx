import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ERROR_CODES } from '../services/errorCodes'

export default function Header() {
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    try {
      navigate('/')
      toast.info('Sesión cerrada')
    } catch (e) {
      toast.error(ERROR_CODES.ERR_900)
    }
  }

  return (
    <header className="admin-header d-flex align-items-center justify-content-between shadow-sm">
      <div className="d-flex align-items-center">
        <div className="brand-section me-4">
          <div className="d-flex align-items-center">
            <div className="brand-icon me-3">
              <i className="bi bi-building text-primary fs-2"></i>
            </div>
            <div>
              <h5 className="mb-0 text-primary fw-bold mb-1">
                <i className="bi bi-house-door-fill me-2"></i>
                PETSHOP
              </h5>
              <p className="text-muted mb-0 small">
                Sistema de Gestión Empresarial
              </p>
            </div>
          </div>
        </div>

        <div className="role-indicator">
          {user?.rol || (profile && profile.usuario_rol && profile.usuario_rol.length > 0) ? (
            <div className="role-badge">
              <span className="badge bg-gradient-success text-white px-3 py-2">
                <i className="bi bi-shield-check-fill me-2"></i>
                {(user?.rol || profile.usuario_rol[0].roles.nombre_rol).toUpperCase()}
                <span className="badge-dot"></span>
              </span>
            </div>
          ) : (
            <div className="welcome-message">
              <small className="text-muted">
                <i className="bi bi-person-check me-1"></i>
                {user ? `Bienvenido, ${user.correo_electronico?.split('@')[0] || 'Usuario'}` : 'Usuario'}
              </small>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex align-items-center user-section">
        <div className="user-info text-end me-3">
          <div className="user-name fw-semibold text-dark mb-0">
            {user ? user.email?.split('@')[0] || user.correo_electronico?.split('@')[0] || 'Usuario' : 'Usuario'}
          </div>
          <div className="user-details">
            <small className="text-muted">
              <i className="bi bi-calendar-event me-1"></i>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </small>
            <small className="text-muted ms-3">
              <i className="bi bi-clock me-1"></i>
              {new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </small>
          </div>
        </div>

        <div className="user-avatar">
          <img src="/user_icon.png" alt="user" className="user-icon" />
          <div className="online-indicator"></div>
        </div>
      </div>
    </header>
  )
}
