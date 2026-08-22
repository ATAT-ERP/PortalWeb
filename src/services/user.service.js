import { api } from './api'

function bearerHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}` }
}

/**
 * Inicia sesión con las credenciales del usuario.
 *
 * @param {string} email Correo electrónico del usuario.
 * @param {string} password Contraseña del usuario.
 * @returns {Promise<Object>} Datos de sesión devueltos por NexusBack.
 * @version 1.0
 * @author Agustin
 */
export function login(email, password) {
  return api.post('/users/login/', { email, password })
}

/**
 * Obtiene un usuario por su identificador.
 *
 * @param {string} id Identificador UUID del usuario.
 * @param {string} accessToken Token de acceso vigente.
 * @returns {Promise<Object>} Usuario devuelto por NexusBack.
 * @version 1.0
 * @author Agustin
 */
export function getById(id, accessToken) {
  return api.get(`/users/${id}/`, { headers: bearerHeaders(accessToken) })
}

/**
 * Cierra la sesión remota asociada al token.
 *
 * @param {string} accessToken Token de acceso vigente.
 * @returns {Promise<null>} `null` cuando NexusBack responde sin contenido.
 * @version 1.0
 * @author Agustin
 */
export function logout(accessToken) {
  return api.post('/users/logout/', undefined, { headers: bearerHeaders(accessToken) })
}

/**
 * Cambia la contraseña del usuario autenticado.
 *
 * @param {Object} data Contraseñas requeridas por el endpoint.
 * @param {string} accessToken Token de acceso vigente.
 * @returns {Promise<null>} `null` cuando NexusBack responde sin contenido.
 * @version 1.0
 * @author Agustin
 */
export function changePassword(data, accessToken) {
  return api.post('/users/password/change/', data, { headers: bearerHeaders(accessToken) })
}

/**
 * Actualiza parcialmente un usuario por su identificador.
 *
 * @param {string} id Identificador UUID del usuario.
 * @param {Object} data Campos editables del usuario.
 * @param {string} accessToken Token de acceso vigente.
 * @returns {Promise<Object>} Usuario actualizado por NexusBack.
 * @version 1.0
 * @author Agustin
 */
export function update(id, data, accessToken) {
  return api.patch(`/users/${id}/`, data, { headers: bearerHeaders(accessToken) })
}

/**
 * Registra un usuario con los datos requeridos por NexusBack.
 *
 * @param {Object} data Datos de registro del usuario.
 * @returns {Promise<Object>} Identificador del usuario creado.
 * @version 1.0
 * @author Agustin
 */
export function register(data) {
  return api.post('/users/register/', data)
}
