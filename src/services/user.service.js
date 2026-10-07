import { api } from './api'

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
 * @returns {Promise<Object>} Usuario devuelto por NexusBack.
 * @version 1.0
 * @author Agustin
 */
export function getById(id) {
  return api.get(`/users/${id}/`, { auth: true })
}

/**
 * Cierra la sesión remota asociada al token.
 *
 * @returns {Promise<null>} `null` cuando NexusBack responde sin contenido.
 * @version 1.0
 * @author Agustin
 */
export function logout() {
  return api.post('/users/logout/', undefined, { auth: true })
}

/**
 * Cambia la contraseña del usuario autenticado.
 *
 * @param {Object} data Contraseñas requeridas por el endpoint.
 * @returns {Promise<null>} `null` cuando NexusBack responde sin contenido.
 * @version 1.0
 * @author Agustin
 */
export function changePassword(data) {
  return api.post('/users/password/change/', data, { auth: true })
}

/**
 * Actualiza parcialmente un usuario por su identificador.
 *
 * @param {string} id Identificador UUID del usuario.
 * @param {Object} data Campos editables del usuario.
 * @returns {Promise<Object>} Usuario actualizado por NexusBack.
 * @version 1.0
 * @author Agustin
 */
export function update(id, data) {
  return api.patch(`/users/${id}/`, data, { auth: true })
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
