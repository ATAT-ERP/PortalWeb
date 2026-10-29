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

export function createInvoice(companyId, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/invoices/`, data, { auth: true })
}

export function updateInvoice(companyId, invoiceId, data) {
  return api.patch(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/`, data, { auth: true })
}

export function createInvoiceItem(companyId, invoiceId, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/items/`, data, { auth: true })
}

export function updateInvoiceItem(companyId, invoiceId, itemId, data) {
  return api.patch(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/items/${encodeURIComponent(itemId)}/`, data, { auth: true })
}

export function deleteInvoiceItem(companyId, invoiceId, itemId) {
  return api.delete(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/items/${encodeURIComponent(itemId)}/`, { auth: true })
}

export function issueInvoice(companyId, invoiceId) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/issue/`, undefined, { auth: true })
}

export function getCreditNotes(companyId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/`, { auth: true })
}

export function getCreditNote(companyId, id) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/`, { auth: true })
}

export function createCreditNote(companyId, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/`, data, { auth: true })
}

export function addCreditNoteInvoices(companyId, id, invoices) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/invoices/`, { invoices }, { auth: true })
}

export function deleteCreditNoteInvoice(companyId, id, associationId) {
  return api.delete(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/invoices/${encodeURIComponent(associationId)}/`, { auth: true })
}

export function getCreditNoteItems(companyId, id) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/items/`, { auth: true })
}

export function createCreditNoteItem(companyId, id, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/items/`, data, { auth: true })
}

export function updateCreditNoteItem(companyId, id, itemId, data) {
  return api.patch(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/`, data, { auth: true })
}

export function deleteCreditNoteItem(companyId, id, itemId) {
  return api.delete(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/`, { auth: true })
}

export function issueCreditNote(companyId, id) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/issue/`, undefined, { auth: true })
}

export function getPointsOfSale(companyId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/points-of-sale/`, { auth: true })
}

export function createPointOfSale(companyId) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/points-of-sale/`, undefined, { auth: true })
}

export function activatePointOfSale(companyId, pointId) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/points-of-sale/${encodeURIComponent(pointId)}/activate/`, undefined, { auth: true })
}

export function deactivatePointOfSale(companyId, pointId) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/points-of-sale/${encodeURIComponent(pointId)}/deactivate/`, undefined, { auth: true })
}
