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