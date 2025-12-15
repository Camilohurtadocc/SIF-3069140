import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { hasRole, loading: profileLoading, roles } = useProfile();

  console.log('Sidebar - User roles:', roles);
  console.log('Sidebar - hasRole admin:', hasRole('administrador'));

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (profileLoading) {
    return null;
  }

  return (
    <div className="sidebar d-flex flex-column">
      <div className="sidebar-header text-center py-4">
        <img src="/logo_perro.png" alt="Logo" className="sidebar-logo mb-2" />
        <h1 className="sidebar-title h5 mb-0" style={{ color: '#d4d4d8' }}>PETSHOP</h1>
        <p className="small mb-0" style={{ color: '#a1a1a6' }}>INVENTORY SYSTEM</p>
      </div>

      <div className="sidebar-user px-3 py-2 mb-3">
        <div className="d-flex align-items-center">
          <i className="bi bi-person-circle user-icon me-2 fs-4" style={{ color: '#d4d4d8' }} />
          <div className="flex-grow-1">
            <small className="d-block" style={{ color: '#a1a1a6' }}>Usuario</small>
            <span className="fw-semibold small" style={{ color: '#d4d4d8' }}>{user ? user.correo_electronico : 'Invitado'}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav flex-grow-1 px-2">
        <div className="nav-section mb-3">
          <h6 className="sidebar-section-title text-secondary text-uppercase fw-bold px-3 mb-3 small">Principal</h6>
          <NavLink to="/dashboard" className="nav-item d-flex align-items-center px-3 py-2">
            <i className="bi bi-grid-1x2-fill me-3" /> Menu Principal
          </NavLink>
        </div>

        <div className="nav-section mb-3">
          <h6 className="sidebar-section-title text-secondary text-uppercase fw-bold px-3 mb-3 small">Gestión</h6>
          <NavLink to="/clientes" className="nav-item d-flex align-items-center px-3 py-2">
            <i className="bi bi-people-fill me-3" /> Clientes
          </NavLink>
          <NavLink to="/productos" className="nav-item d-flex align-items-center px-3 py-2">
            <i className="bi bi-box-seam-fill me-3" /> Productos
          </NavLink>
          <NavLink to="/categorias" className="nav-item d-flex align-items-center px-3 py-2">
            <i className="bi bi-tag-fill me-3" /> Categorías
          </NavLink>
        </div>

        <div className="nav-section mb-3">
          <h6 className="sidebar-section-title text-secondary text-uppercase fw-bold px-3 mb-3 small">Caja</h6>
          <NavLink to="/recibos-de-caja" end className="nav-item d-flex align-items-center px-3 py-2">
            <i className="bi bi-receipt-cutoff me-3" /> Recibos de Caja
          </NavLink>
          <NavLink to="/recibos-de-caja/historial" className="nav-item d-flex align-items-center px-3 py-2">
            <i className="bi bi-clock-history me-3" /> Historial
          </NavLink>
          <NavLink to="/cierres-caja" className="nav-item d-flex align-items-center px-3 py-2">
            <i className="bi bi-calculator me-3" /> Cierres de Caja
          </NavLink>
        </div>

        {hasRole('administrador') && (
           <div className="nav-section mb-3">
             <h6 className="sidebar-section-title text-secondary text-uppercase fw-bold px-3 mb-3 small">Admin</h6>
             <NavLink to="/usuarios" className="nav-item d-flex align-items-center px-3 py-2">
               <i className="bi bi-person-badge-fill me-3" /> Usuarios
             </NavLink>
           </div>
         )}
      </nav>

      <div className="sidebar-footer p-3">
        <button className="btn btn-danger w-100 d-flex align-items-center justify-content-center fw-bold" onClick={handleSignOut}>
          <i className="bi bi-box-arrow-left me-2" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}