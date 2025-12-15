// src/pages/Usuarios.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Pagination from '../components/Pagination'
import { fetchPaginatedData } from '../services/dataService'
import userService from '../services/userService'
import { ERROR_CODES } from '../services/errorCodes'
import logger, { getErrorMessage } from '../utils/logger'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const loadUsuarios = useCallback(async () => {
    setLoading(true)
    try {
      logger.info('Usuarios', 'Cargando lista de usuarios', { page, pageSize, search })
      const { data, count } = await fetchPaginatedData({
        endpoint: 'user',
        page,
        pageSize,
        searchQuery: search,
        searchFields: ['correo_electronico', 'idioma'],
      })

      const normalized = data.map(u => {
        const rel = u.usuario_rol
        let nombreRol = u.nombre_rol || u.rol || '-'
        if (Array.isArray(rel) && rel.length > 0) {
          nombreRol = rel[0]?.roles?.nombre_rol ?? nombreRol
        }
        return { ...u, nombre_rol: nombreRol }
      })

      setUsuarios(normalized)
      setTotal(count)
      logger.success('Usuarios', `${count} usuarios cargados (mostrando ${data.length})`)
    } catch (error) {
      logger.error('Usuarios', 'Error al cargar usuarios', error)
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    loadUsuarios()
  }, [loadUsuarios])

  async function handleDelete(id_usuario) {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      logger.info('Usuarios', `Eliminando usuario ID: ${id_usuario}`)
      await userService.delete(id_usuario)
      logger.success('Usuarios', 'Usuario eliminado exitosamente')
      toast.success('Usuario eliminado exitosamente')
      loadUsuarios()
    } catch (error) {
      logger.error('Usuarios', 'Error al eliminar usuario', error)
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="usuarios-section">
      <div className="usuarios-header d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4">Usuarios</h2>
        <button className="btn btn-success" onClick={() => navigate('/usuarios/crear')}>
          <i className="bi bi-person-plus me-1" /> Crear usuario
        </button>
      </div>
      <div className="mb-3 d-flex gap-2 align-items-center">
        <input
          className="form-control"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por correo o idioma..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <label className="form-label mb-0">Mostrar:</label>
        <select className="form-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ width: 80 }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <>
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Correo</th>
                <th>Idioma</th>
                <th>Activo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted">No hay usuarios</td></tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td>{u.correo_electronico}</td>
                    <td>{u.idioma}</td>
                    <td>{Number(u.activado) === 1 || u.activado === true ? 'Sí' : 'No'}</td>
                    <td>{u.nombre_rol || '-'}</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => {
                        console.log('Editando usuario:', u.id_usuario);
                        navigate(`/usuarios/editar/${u.id_usuario}`);
                      }}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id_usuario)}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setPage}
            itemName="usuarios"
          />
        </>
      )}
    </div>
  )
}