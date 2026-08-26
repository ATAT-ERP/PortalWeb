const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

function buildUrl(path) {
  if (!baseUrl) {
    throw new Error('VITE_API_URL no está configurada. Creá el archivo .env a partir de .env.example.')
  }

  return `${baseUrl}/${String(path).replace(/^\//, '')}`
}

/**
 * Ejecuta una solicitud JSON contra la base configurada de NexusBack.
 *
 * Devuelve `null` para respuestas 204/205 y normaliza errores HTTP con
 * `message`, `status`, `code` y `errors`.
 *
 * @param {string} path Ruta relativa a `VITE_API_URL`.
 * @returns {Promise<unknown>} Respuesta procesada de la API.
 * @version 1.0
 * @author Agustin
 */
async function request(path, options = {}) {
  const { body, headers, ...requestOptions } = options
  const hasJsonBody = body !== undefined && !(body instanceof FormData)
  const response = await fetch(buildUrl(path), {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: hasJsonBody ? JSON.stringify(body) : body } : {}),
  })

  if (response.status === 204 || response.status === 205) return null

  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const detail = typeof data === 'object' && data !== null ? data.detail : undefined
    const message =
      (typeof data === 'object' && data !== null && typeof data.message === 'string' && data.message) ||
      (typeof detail === 'object' && detail !== null && typeof detail.message === 'string' && detail.message) ||
      (typeof detail === 'string' && detail) ||
      `La solicitud falló con estado ${response.status}`
    const error = new Error(message)

    error.status = response.status
    error.code =
      (typeof data === 'object' && data !== null ? data.code : undefined) ||
      (typeof detail === 'object' && detail !== null ? detail.code : undefined)
    error.errors = typeof data === 'object' && data !== null ? data.errors : undefined

    throw error
  }

  return data
}

/**
 * Cliente HTTP genérico para los servicios del frontend.
 *
 * @version 1.0
 * @author Agustin
 */
export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
