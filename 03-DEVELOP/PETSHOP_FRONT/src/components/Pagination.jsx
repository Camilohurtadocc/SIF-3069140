import React from 'react';

/**
 * Componente de paginación reutilizable para las tablas de datos.
 *
 * @param {object} props
 * @param {number} props.currentPage - La página actual.
 * @param {number} props.totalItems - El número total de registros en la base de datos.
 * @param {number} props.pageSize - El número de registros por página.
 * @param {function} props.onPageChange - Función que se llama cuando se cambia de página. Recibe el nuevo número de página.
 * @param {string} [props.itemName='registros'] - El nombre de los ítems que se están paginando (ej. "usuarios", "clientes").
 */
export default function Pagination({ currentPage, totalItems, pageSize, onPageChange, itemName = 'registros' }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const handlePrevious = () => {
    if (hasPreviousPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalItems === 0) {
    return null; // No mostrar paginación si no hay ítems
  }

  return (
    <nav aria-label={`Paginación de ${itemName}`}>
      <ul className="pagination justify-content-center mt-3">
        <li className={`page-item${!hasPreviousPage ? ' disabled' : ''}`}>
          <button className="page-link" onClick={handlePrevious}>
            Anterior
          </button>
        </li>
        <li className="page-item disabled">
          <span className="page-link">
            Página {currentPage} de {totalPages}
          </span>
        </li>
        <li className={`page-item${!hasNextPage ? ' disabled' : ''}`}>
          <button className="page-link" onClick={handleNext}>
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  );
}
