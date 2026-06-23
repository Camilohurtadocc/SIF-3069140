import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import ProtectedRoute from './ProtectedRoute'

export default function Layout() {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <Header />
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  )
}
