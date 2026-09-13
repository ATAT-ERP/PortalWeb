import { api } from './api'

/**
 * Carga un documento para una compañía.
 *
 * @param {Object} data Datos del documento según el contrato de NexusBack.
 * @returns {Promise<Object>} Documento creado por NexusBack.
 * @version 1.0
 * @author Agustin
 */
export function uploadDocument({ company_id, file, category_id, name }) {
  const formData = new FormData()
  formData.append('company_id', company_id)
  formData.append('file', file)

  if (category_id) formData.append('category_id', category_id)
  if (name) formData.append('name', name)

  return api.post('/documents/', formData, { auth: true })
}

/**
 * Obtiene los documentos de una compañía.
 *
 * @param {string} companyId Identificador UUID de la compañía.
 * @returns {Promise<Array>} Documentos devueltos por NexusBack.
 * @version 1.0
 * @author Agustin
 */
export function getDocuments(companyId) {
  return api.get(`/documents/?company_id=${encodeURIComponent(companyId)}`)
}
