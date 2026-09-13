import { api } from './api'

function bearerHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` }
}

/**
 * Registra una nueva compañía en A.T.A.T.
 *
 * @param {Object} data Datos de la compañía según el contrato de NexusBack.
 * @param {string} accessToken Token de acceso vigente.
 * @returns {Promise<Object>} Compañía creada por NexusBack.
 * @version 1.0
 */
export function createCompany(data, accessToken) {
  return api.post('/companies/', data, { headers: bearerHeaders(accessToken) })
}

/**
 * Busca compañías por nombre, razón social o CUIT.
 *
 * @param {string} q Término de búsqueda.
 * @param {string} accessToken Token de acceso vigente.
 * @returns {Promise<Array>} Compañías que coinciden con el término.
 * @version 1.0
 */
export function searchCompanies(q, accessToken) {
  return api.get(`/companies/search/?q=${encodeURIComponent(q)}`, { headers: bearerHeaders(accessToken) })
}