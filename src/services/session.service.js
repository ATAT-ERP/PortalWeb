const SESSION_KEY = 'atat_session'

/**
 * Guarda la sesión bajo la key `atat_session` de sessionStorage.
 *
 * @param {Object} session Datos de sesión a persistir.
 * @version 1.0
 * @author Agustin
 */
export function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

/**
 * Recupera la sesión almacenada en `atat_session`.
 *
 * @returns {Object|null} Sesión persistida o `null` si no existe.
 * @version 1.0
 * @author Agustin
 */
export function getSession() {
  const value = sessionStorage.getItem(SESSION_KEY)
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    clearSession()
    return null
  }
}

/**
 * Elimina la sesión almacenada en `atat_session`.
 *
 * @version 1.0
 * @author Agustin
 */
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

/**
 * Obtiene el access token de la sesión actual.
 *
 * @returns {string|null} Token de acceso o `null` si no hay sesión.
 * @version 1.0
 * @author Agustin
 */
export function getAccessToken() {
  return getSession()?.access_token ?? null
}

export function getProfile() {
  return getSession()?.profile ?? null
}

export function setProfile(profile) {
  const session = getSession()
  if (!session) return

  saveSession({ ...session, profile })
}
