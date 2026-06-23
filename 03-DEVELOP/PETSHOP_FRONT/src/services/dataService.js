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
    // Llamar al backend CON parámetros de paginación y búsqueda
    const params = {
      page,
      pageSize,
    };
    
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    const response = await api.get(`/${endpoint}`, { params });
    let data = response.data;

    // Manejar si response.data es array o { data: array }
    if (Array.isArray(response.data)) {
      data = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      data = response.data.data;
    } else {
      data = [];
    }

    // Ya no hacer paginación en frontend si el backend la soporta
    // Solo usar count del backend si está disponible
    let count = data.length;
    if (response.data && response.data.totalCount !== undefined) {
      count = response.data.totalCount;
    } else if (response.data && response.data.count !== undefined) {
      count = response.data.count;
    }

    return { data: data, count };
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw new Error(`No se pudieron cargar los datos de ${endpoint}.`);
  }
}
