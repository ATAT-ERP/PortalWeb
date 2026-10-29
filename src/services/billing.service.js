import { api } from './api'

/**
 * Consulta el perfil fiscal de una compa??a.
 * @version 1.0
 * @author Agustin
 */
export function getFiscalProfile(companyId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/fiscal-profile/`, { auth: true })
}

/**
 * Crea el perfil fiscal de una compa??a.
 * @version 1.0
 * @author Agustin
 */
export function createFiscalProfile(companyId, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/fiscal-profile/`, data, { auth: true })
}

/**
 * Actualiza el perfil fiscal de una compa??a.
 * @version 1.0
 * @author Agustin
 */
export function updateFiscalProfile(companyId, data) {
  return api.patch(`/billing/companies/${encodeURIComponent(companyId)}/fiscal-profile/`, data, { auth: true })
}

/**
 * Consulta las facturas de una compa??a con filtros opcionales.
 * @version 1.0
 * @author Agustin
 */
export function getInvoices(companyId, filters = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null) params.set(key, value)
  }
  const query = params.toString()
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${query ? `?${query}` : ''}`, { auth: true })
}

/**
 * Consulta el detalle de una factura.
 * @version 1.0
 * @author Agustin
 */
export function getInvoice(companyId, invoiceId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/`, { auth: true })
}

/**
 * Consulta la representaci?n PDF de una factura.
 * @version 1.0
 * @author Agustin
 */
export function getInvoiceRepresentation(companyId, invoiceId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/representation/`, { auth: true })
}

/**
 * Solicita la representaci?n PDF de una factura.
 * @version 1.0
 * @author Agustin
 */
export function generateInvoiceRepresentation(companyId, invoiceId) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/representation/`, undefined, { auth: true })
}

/**
 * Crea un borrador de factura.
 * @version 1.0
 * @author Agustin
 */
export function createInvoice(companyId, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/invoices/`, data, { auth: true })
}

/**
 * Actualiza la cabecera de una factura.
 * @version 1.0
 * @author Agustin
 */
export function updateInvoice(companyId, invoiceId, data) {
  return api.patch(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/`, data, { auth: true })
}

/**
 * Agrega un ?tem a una factura.
 * @version 1.0
 * @author Agustin
 */
export function createInvoiceItem(companyId, invoiceId, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/items/`, data, { auth: true })
}

/**
 * Actualiza un ?tem de una factura.
 * @version 1.0
 * @author Agustin
 */
export function updateInvoiceItem(companyId, invoiceId, itemId, data) {
  return api.patch(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/items/${encodeURIComponent(itemId)}/`, data, { auth: true })
}

/**
 * Elimina un ?tem de una factura.
 * @version 1.0
 * @author Agustin
 */
export function deleteInvoiceItem(companyId, invoiceId, itemId) {
  return api.delete(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/items/${encodeURIComponent(itemId)}/`, { auth: true })
}

/**
 * Solicita la emisi?n interna de una factura.
 * @version 1.0
 * @author Agustin
 */
export function issueInvoice(companyId, invoiceId) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/invoices/${encodeURIComponent(invoiceId)}/issue/`, undefined, { auth: true })
}

/**
 * Consulta las notas de cr?dito de una compa??a.
 * @version 1.0
 * @author Agustin
 */
export function getCreditNotes(companyId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/`, { auth: true })
}

/**
 * Consulta el detalle de una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function getCreditNote(companyId, id) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/`, { auth: true })
}

/**
 * Consulta la representaci?n PDF de una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function getCreditNoteRepresentation(companyId, id) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/representation/`, { auth: true })
}

/**
 * Solicita la representaci?n PDF de una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function generateCreditNoteRepresentation(companyId, id) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/representation/`, undefined, { auth: true })
}

/**
 * Crea un borrador de nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function createCreditNote(companyId, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/`, data, { auth: true })
}

/**
 * Asocia facturas a una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function addCreditNoteInvoices(companyId, id, invoices) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/invoices/`, { invoices }, { auth: true })
}

/**
 * Elimina una asociaci?n de factura de una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function deleteCreditNoteInvoice(companyId, id, associationId) {
  return api.delete(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/invoices/${encodeURIComponent(associationId)}/`, { auth: true })
}

/**
 * Consulta los ?tems de una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function getCreditNoteItems(companyId, id) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/items/`, { auth: true })
}

/**
 * Agrega un ?tem a una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function createCreditNoteItem(companyId, id, data) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/items/`, data, { auth: true })
}

/**
 * Actualiza un ?tem de una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function updateCreditNoteItem(companyId, id, itemId, data) {
  return api.patch(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/`, data, { auth: true })
}

/**
 * Elimina un ?tem de una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function deleteCreditNoteItem(companyId, id, itemId) {
  return api.delete(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/`, { auth: true })
}

/**
 * Solicita la emisi?n interna de una nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
export function issueCreditNote(companyId, id) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/credit-notes/${encodeURIComponent(id)}/issue/`, undefined, { auth: true })
}

/**
 * Consulta los puntos de venta de una compa??a.
 * @version 1.0
 * @author Agustin
 */
export function getPointsOfSale(companyId) {
  return api.get(`/billing/companies/${encodeURIComponent(companyId)}/points-of-sale/`, { auth: true })
}

/**
 * Solicita la creaci?n de un punto de venta.
 * @version 1.0
 * @author Agustin
 */
export function createPointOfSale(companyId) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/points-of-sale/`, undefined, { auth: true })
}

/**
 * Activa un punto de venta.
 * @version 1.0
 * @author Agustin
 */
export function activatePointOfSale(companyId, pointId) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/points-of-sale/${encodeURIComponent(pointId)}/activate/`, undefined, { auth: true })
}

/**
 * Desactiva un punto de venta.
 * @version 1.0
 * @author Agustin
 */
export function deactivatePointOfSale(companyId, pointId) {
  return api.post(`/billing/companies/${encodeURIComponent(companyId)}/points-of-sale/${encodeURIComponent(pointId)}/deactivate/`, undefined, { auth: true })
}
