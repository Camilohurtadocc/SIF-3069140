import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Carga perezosa de los componentes de las páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clientes = lazy(() => import('./pages/Clientes'));
const Productos = lazy(() => import('./pages/Productos'));
const Usuarios = lazy(() => import('./pages/Usuarios'));
const ActualizarUsuario = lazy(() => import('./pages/ActualizarUsuario'));
const Categorias = lazy(() => import('./pages/Categorias'));
const CrearCliente = lazy(() => import('./pages/CrearCliente'));
const EditarCliente = lazy(() => import('./pages/EditarCliente'));
const CrearProducto = lazy(() => import('./pages/CrearProducto'));
const CrearUsuario = lazy(() => import('./pages/CrearUsuario'));
const RecibosDeCaja = lazy(() => import('./pages/RecibosDeCaja'));
const HistorialRecibosDeCaja = lazy(() => import('./pages/HistorialRecibosDeCaja'));
const CierresCaja = lazy(() => import('./pages/CierresCaja'));
const ModificarProducto = lazy(() => import('./pages/ModificarProducto'));

// Un componente contenedor para las rutas protegidas
const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <div>
      <Suspense fallback={<div className="container mt-5 text-center"><h5>Cargando...</h5></div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/crear" element={<CrearCliente />} />
            <Route path="/clientes/editar/:id" element={<EditarCliente />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/crear" element={<CrearProducto />} />
            <Route path="/productos/modificar" element={<ModificarProducto />} />
            <Route path="/productos/editar/:id" element={<ModificarProducto />} />
            <Route path="/usuarios" element={<ProtectedRoute allowedRoles={['administrador']}><Usuarios /></ProtectedRoute>} />
            <Route path="/usuarios/crear" element={<ProtectedRoute allowedRoles={['administrador']}><CrearUsuario /></ProtectedRoute>} />
            <Route path="/usuarios/editar/:id" element={<ProtectedRoute allowedRoles={['administrador']}><ActualizarUsuario /></ProtectedRoute>} />
            <Route path="/recibos-de-caja" element={<RecibosDeCaja />} />
            <Route path="/recibos-de-caja/historial" element={<HistorialRecibosDeCaja />} />
            <Route path="/cierres-caja" element={<CierresCaja />} />
            <Route path="/categorias" element={<Categorias />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}