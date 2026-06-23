// src/pages/Clientes.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Pagination from '../components/Pagination'
import { fetchPaginatedData } from '../services/dataService'
import clientService from '../services/clientService'
import logger, { getErrorMessage } from '../utils/logger'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const loadClientes = useCallback(async () => {
    setLoading(true)
    try {
      logger.info('Clientes', 'Cargando lista de clientes', { page, pageSize, search })
      const { data, count } = await fetchPaginatedData({
        endpoint: 'client',
        page,
        pageSize,
        searchQuery: search,
        searchFields: ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'numero_documento', 'correo_electronico'],
      })

      // Crear nombre completo para cada cliente
      const clientesConNombreCompleto = data.map(cliente => ({
        ...cliente,
        nombre_completo: `${cliente.primer_nombre} ${cliente.segundo_nombre || ''} ${cliente.primer_apellido} ${cliente.segundo_apellido || ''}`.trim()
      }))

      setClientes(clientesConNombreCompleto)
      setTotal(count)
      logger.success('Clientes', `${count} clientes cargados (mostrando ${data.length})`)
    } catch (error) {
      logger.error('Clientes', 'Error al cargar clientes', error)
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    loadClientes()
  }, [loadClientes])


  return (
    <div className="clientes-section">
      <div className="clientes-header d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4">Clientes</h2>
        <button className="btn btn-success" onClick={() => navigate('/clientes/crear')}>
          <i className="bi bi-person-plus me-1" /> Crear cliente
        </button>
      </div>

      <div className="mb-3 d-flex gap-2 align-items-center">
        <input className="form-control" style={{ maxWidth: 220 }} placeholder="Buscar clientes..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <label className="form-label mb-0">Mostrar:</label>
        <select className="form-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ width: 80 }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando clientes...</p>
      ) : (
        <>
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Número de documento</th>
                <th>Correo electrónico</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted">No hay clientes</td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id_cliente}>
                    <td>{c.nombre_completo}</td>
                    <td>{c.numero_documento}</td>
                    <td>{c.correo_electronico}</td>
                    <td>{c.numero_telefono}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => navigate(`/clientes/editar/${c.id_cliente}`)}>
                        <i className="bi bi-pencil" />
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
            itemName="clientes"
          />
        </>
      )}
    </div>
  )
}