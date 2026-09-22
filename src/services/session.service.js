const SESSION_KEY = 'atat_session'
const ACTIVE_COMPANY_KEY = 'active_company_id'

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
  sessionStorage.removeItem(ACTIVE_COMPANY_KEY)
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

/**
 * Obtiene el identificador de la compañía activa de la sesión actual.
 *
 * @returns {string|null} Identificador de la compañía activa o `null` si no existe.
 * @version 1.0
 * @author Agustin
 */
export function getActiveCompanyId() {
  return sessionStorage.getItem(ACTIVE_COMPANY_KEY)
}

/**
 * Guarda o elimina el identificador de la compañía activa de la sesión actual.
 *
 * @param {string|null} id Identificador de la compañía activa.
 * @version 1.0
 * @author Agustin
 */
export function saveActiveCompanyId(id) {
  if (id) {
    sessionStorage.setItem(ACTIVE_COMPANY_KEY, id)
    return
  }

  sessionStorage.removeItem(ACTIVE_COMPANY_KEY)
}

export function getProfile() {
  return getSession()?.profile ?? null
}

export function setProfile(profile) {
  const session = getSession()
  if (!session) return

  saveSession({ ...session, profile })
}
