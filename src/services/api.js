const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

function buildUrl(path) {
  if (!baseUrl) {
    throw new Error('VITE_API_URL no está configurada. Creá el archivo .env a partir de .env.example.')
  }

  return `${baseUrl}/${String(path).replace(/^\//, '')}`
}

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
    const detail = typeof data === 'object' && data?.detail ? `: ${data.detail}` : ''
    const message = `La solicitud falló con estado ${response.status}${detail}`
    throw new Error(message)
  }

  return data
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
