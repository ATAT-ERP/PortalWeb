import { api } from './api'

/**
 * Consulta el plan de cuentas de una compañía.
 * @version 1.0
 * @author Thiago
 */
export function getAccounts(companyId) {
  return api.get(`/accounting/companies/${encodeURIComponent(companyId)}/accounts/`, { auth: true })
}

/**
 * Crea una cuenta contable en una compañía.
 * @version 1.0
 * @author Thiago
 */
export function createAccount(companyId, data) {
  return api.post(`/accounting/companies/${encodeURIComponent(companyId)}/accounts/`, data, { auth: true })
}

/**
 * Actualiza parcialmente una cuenta contable.
 * @version 1.0
 * @author Thiago
 */
export function updateAccount(companyId, accountId, data) {
  return api.patch(`/accounting/companies/${encodeURIComponent(companyId)}/accounts/${encodeURIComponent(accountId)}/`, data, { auth: true })
}

/**
 * Consulta el Libro Diario de una compañía con filtros de fecha opcionales.
 * @version 1.0
 * @author Uziel
 */
export function getDailyJournal(companyId, filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null) params.set(key, value)
  }
  const query = params.toString()
  return api.get(`/accounting/companies/${encodeURIComponent(companyId)}/reports/daily-journal/${query ? `?${query}` : ''}`, { auth: true })
}

/**
 * Consulta el Libro Mayor de una cuenta con filtros de fecha opcionales.
 * @version 1.0
 * @author Uziel
 */
export function getGeneralLedger(companyId, accountId, filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null) params.set(key, value)
  }
  const query = params.toString()
  return api.get(`/accounting/companies/${encodeURIComponent(companyId)}/reports/general-ledger/${encodeURIComponent(accountId)}/${query ? `?${query}` : ''}`, { auth: true })
}

/**
 * Consulta el balance de Sumas y Saldos de una compañía con filtros de fecha opcionales.
 * @version 1.0
 * @author Uziel
 */
export function getTrialBalance(companyId, filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null) params.set(key, value)
  }
  const query = params.toString()
  return api.get(`/accounting/companies/${encodeURIComponent(companyId)}/reports/trial-balance/${query ? `?${query}` : ''}`, { auth: true })
}

/**
 * Descarga el Libro Diario en CSV con filtros de fecha opcionales.
 * @version 1.0
 * @author Uziel
 */
export function exportDailyJournal(companyId, filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null) params.set(key, value)
  }
  const query = params.toString()
  return api.get(`/accounting/companies/${encodeURIComponent(companyId)}/reports/daily-journal/export/${query ? `?${query}` : ''}`, { auth: true, responseType: 'blob' })
}

/**
 * Descarga el Libro Mayor de una cuenta en CSV con filtros de fecha opcionales.
 * @version 1.0
 * @author Uziel
 */
export function exportGeneralLedger(companyId, accountId, filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null) params.set(key, value)
  }
  const query = params.toString()
  return api.get(`/accounting/companies/${encodeURIComponent(companyId)}/reports/general-ledger/${encodeURIComponent(accountId)}/export/${query ? `?${query}` : ''}`, { auth: true, responseType: 'blob' })
}

/**
 * Descarga el balance de Sumas y Saldos en CSV con filtros de fecha opcionales.
 * @version 1.0
 * @author Uziel
 */
export function exportTrialBalance(companyId, filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null) params.set(key, value)
  }
  const query = params.toString()
  return api.get(`/accounting/companies/${encodeURIComponent(companyId)}/reports/trial-balance/export/${query ? `?${query}` : ''}`, { auth: true, responseType: 'blob' })
}