import { api } from './api'

/**
 * Consulta los vencimientos accesibles para el usuario autenticado.
 * @param {Object} filters Filtros admitidos por NexusBack.
 * @returns {Promise<Array>} Vencimientos ordenados por NexusBack.
 */
export function getDeadlines(filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null) params.set(key, value)
  }
  const query = params.toString()
  return api.get(`/deadlines/${query ? `?${query}` : ''}`, { auth: true })
}
