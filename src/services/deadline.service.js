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

/** Consulta una tarea accesible por su UUID. */
export function getDeadline(id) {
  return api.get(`/deadlines/${encodeURIComponent(id)}/`, { auth: true })
}

/** Crea una tarea para una compañía activa del usuario. */
export function createDeadline(data) {
  return api.post('/deadlines/', data, { auth: true })
}

/** Reemplaza los campos editables de una tarea. */
export function updateDeadline(id, data) {
  return api.put(`/deadlines/${encodeURIComponent(id)}/`, data, { auth: true })
}

/** Actualiza parcialmente una tarea, por ejemplo su estado. */
export function patchDeadline(id, data) {
  return api.patch(`/deadlines/${encodeURIComponent(id)}/`, data, { auth: true })
}

/** Elimina una tarea. */
export function deleteDeadline(id) {
  return api.delete(`/deadlines/${encodeURIComponent(id)}/`, { auth: true })
}
