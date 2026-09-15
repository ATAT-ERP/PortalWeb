import { api } from './api'

/**
 * Registra una nueva compañía en A.T.A.T.
 *
 * @param {Object} data Datos de la compañía según el contrato de NexusBack.
 * @returns {Promise<Object>} Compañía creada por NexusBack.
 * @version 1.0
 */
export function createCompany(data) {
  return api.post('/companies/', data, { auth: true })
}

/**
 * Busca compañías por nombre, razón social o CUIT.
 *
 * @param {string} q Término de búsqueda.
 * @returns {Promise<Array>} Compañías que coinciden con el término.
 * @version 1.0
 */
export function searchCompanies(q) {
  return api.get(`/companies/search/?q=${encodeURIComponent(q)}`, { auth: true })
}

export function getCompanies(isActive = null) {
  const params = isActive !== null ? `?is_active=${isActive}` : ''
  return api.get(`/companies/${params}`, { auth: true })
}

export function getCompanyById(id) {
  return api.get(`/companies/${id}/`, { auth: true })
}

export function updateCompany(id, data) {
  return api.patch(`/companies/${id}/`, data, { auth: true })
}

export function deleteCompany(id) {
  return api.delete(`/companies/${id}/`, { auth: true })
}