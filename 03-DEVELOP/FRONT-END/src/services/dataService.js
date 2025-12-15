import api from './api';

/**
 * Función genérica para obtener datos paginados y con búsqueda de una entidad de la API.
 *
 * @param {object} options
 * @param {string} options.endpoint - El endpoint de la API (ej. "user").
 * @param {number} options.page - El número de página actual.
 * @param {number} options.pageSize - El número de ítems por página.
 * @param {string} [options.searchQuery] - El término de búsqueda.
 * @param {string[]} [options.searchFields] - Los campos en los que buscar (ej. ["correo_electronico", "idioma"]).
 * @returns {Promise<{data: any[], count: number}>} - Un objeto con los datos y el conteo total.
 */
export async function fetchPaginatedData({
  endpoint,
  page,
  pageSize,
  searchQuery = '',
  searchFields = [],
}) {
  try {
    // Temporal: llamar sin params hasta que el backend soporte paginación
    const response = await api.get(`/${endpoint}`);
    let data = response.data;

    // Manejar si response.data es array o { data: array }
    if (Array.isArray(response.data)) {
      data = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      data = response.data.data;
    } else {
      data = [];
    }

    // Filtrar búsqueda en frontend
    if (searchQuery && searchFields.length > 0) {
      const termino = searchQuery.toLowerCase();
      data = data.filter(item =>
        searchFields.some(field => item[field]?.toString().toLowerCase().includes(termino))
      );
    }

    // Paginación en frontend
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const paginatedData = data.slice(from, to);
    const count = data.length;

    return { data: paginatedData, count };
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw new Error(`No se pudieron cargar los datos de ${endpoint}.`);
  }
}
