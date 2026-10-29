import { api } from './api'

export function getFiscalProfile(companyId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/fiscal-profile/`, { auth: true })
}

export function createFiscalProfile(companyId, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/fiscal-profile/`, data, { auth: true })
}

export function updateFiscalProfile(companyId, data) {
  return api.patch(`/billing/companies/${encodeURIComponent(companyId)}/fiscal-profile/`, data, { auth: true })
}

export function getInvoices(companyId, filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null) params.set(key, value)
  }
  const query = params.toString()
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${query ? `?${query}` : ''}`, { auth: true })
}

export function getInvoice(companyId, invoiceId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/`, { auth: true })
}

export function getPointsOfSale(companyId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/points-of-sale/`, { auth: true })
}
