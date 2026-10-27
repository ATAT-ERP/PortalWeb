<template>
  <div class="documents-page">
    <header class="documents-header">
      <div class="documents-header-icon" aria-hidden="true">
        <FileUp :size="24" />
      </div>
      <div>
        <h1>Documentos</h1>
        <p>Consultá y cargá documentos de la compañía activa.</p>
      </div>
    </header>

    <div class="documents-layout">
      <section class="documents-card documents-list-card" aria-labelledby="documents-list-title">
        <header class="documents-list-header">
          <h2 id="documents-list-title" class="documents-card-title">Documentos cargados</h2>
          <span v-if="activeCompany && !isLoadingDocuments && !listError" class="documents-count">
            {{ documents.length }} {{ documents.length === 1 ? 'resultado' : 'resultados' }}
          </span>
        </header>

        <div v-if="activeCompany" class="documents-search">
          <label for="documents-search" class="documents-sr-only">Buscar documentos</label>
          <Search class="documents-search-icon" :size="18" aria-hidden="true" />
          <input id="documents-search" v-model="searchQuery" type="search"
            placeholder="Buscar por nombre" @input="handleSearchInput"/>
        </div>

        <div v-if="!activeCompany" class="documents-empty">
          <span class="documents-empty-icon" aria-hidden="true">
            <FolderOpen :size="26" />
          </span>
          <p class="documents-empty-title">Seleccioná una compañía para ver sus documentos.</p>
        </div>
        <p v-else-if="isLoadingDocuments" class="documents-list-state" role="status">Cargando documentos...</p>
        <p v-else-if="listError" class="documents-message documents-message-error" role="alert">{{ listError }}</p>
        <div v-else-if="documents.length === 0" class="documents-empty">
          <span class="documents-empty-icon" aria-hidden="true">
            <FolderOpen :size="26" />
          </span>
          <p class="documents-empty-title">
            {{ searchQuery ? 'No se encontraron documentos para la búsqueda.' : 'Todavía no hay documentos en esta compañía.' }}
          </p>
        </div>

        <div v-else class="documents-table-wrapper">
          <table class="documents-table">
            <caption class="documents-sr-only">Documentos cargados</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Tipo</th>
                <th scope="col">Tamaño</th>
                <th scope="col">Creado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="document in documents" :key="document.id">
                <td>
                  <strong>{{ document.name || document.original_name }}</strong>
                  <span v-if="document.original_name && document.original_name !== document.name" class="documents-original-name">{{ document.original_name }}</span>
                </td>
                <td><span class="documents-type">{{ formatType(document.mime_type) }}</span></td>
                <td class="documents-nowrap">{{ formatSize(document.size) }}</td>
                <td class="documents-nowrap">{{ formatDate(document.created_at) }}</td>
                <td>
                  <button
                    type="button"
                    class="documents-download-button"
                    :disabled="downloadingDocumentId === document.id"
                    @click="handleDownload(document)"
                  >
                    <Download :size="16" aria-hidden="true" />
                    <span>{{ downloadingDocumentId === document.id ? 'Descargando...' : 'Descargar' }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="documents-card documents-upload-card" aria-labelledby="documents-upload-title">
        <h2 id="documents-upload-title" class="documents-card-title">Subir nuevo documento</h2>

        <form class="documents-form" @submit.prevent="handleSubmit" novalidate>
          <p :class="['documents-company', { 'documents-company-missing': !activeCompany }]">
            <Info class="documents-company-icon" :size="18" aria-hidden="true" />
            <span>
              Compañía activa: <strong>{{ activeCompany ? activeCompany.name : 'Seleccioná una compañía antes de subir un documento.' }}</strong>
            </span>
          </p>

          <div class="documents-field">
            <label for="document-file">Archivo *</label>
            <input
              id="document-file"
              ref="fileInput"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              :disabled="isUploading"
              @change="handleFileChange"
            />
            <span class="documents-hint">PDF, JPG, PNG, DOCX o XLSX. Máximo 6 MiB.</span>
            <span v-if="selectedFile" class="documents-file-name">{{ selectedFile.name }}</span>
          </div>

          <div class="documents-field">
            <label for="document-name">Nombre</label>
            <input
              id="document-name"
              v-model="name"
              type="text"
              placeholder="Opcional"
              :disabled="isUploading"
            />
          </div>

          <p v-if="errorMessage" class="documents-message documents-message-error" role="alert">{{ errorMessage }}</p>
          <p v-if="successMessage" class="documents-message documents-message-success">{{ successMessage }}</p>

          <button type="submit" class="documents-submit-button" :disabled="isUploading">
            <Upload :size="18" aria-hidden="true" />
            <span>{{ isUploading ? 'Subiendo...' : 'Subir documento' }}</span>
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Download, FileUp, FolderOpen, Info, Search, Upload } from '@lucide/vue'
import { downloadDocument, getDocuments, uploadDocument } from '../../services/document.service'
import { clearSession } from '../../services/session.service'
import { activeCompany } from '../../stores/company.store'
import '../../assets/css/DocumentsPage.css'

const MAX_FILE_SIZE = 6 * 1024 * 1024

const MIME_LABELS = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX'
}

const router = useRouter()
const fileInput = ref(null)
const selectedFile = ref(null)
const name = ref('')
const isUploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const documents = ref([])
const isLoadingDocuments = ref(false)
const listError = ref('')
const downloadingDocumentId = ref(null)
const searchQuery = ref('')
let documentLoadId = 0
let searchTimeout

watch(activeCompany, () => {
  searchQuery.value = ''
  window.clearTimeout(searchTimeout)
  loadDocuments()
}, { immediate: true })

async function loadDocuments() {
  const loadId = ++documentLoadId
  documents.value = []
  listError.value = ''

  if (!activeCompany.value) {
    isLoadingDocuments.value = false
    return
  }

  isLoadingDocuments.value = true

  try {
    const result = await getDocuments(activeCompany.value.id, searchQuery.value.trim())
    if (loadId === documentLoadId) documents.value = result
  } catch (error) {
    if (loadId === documentLoadId) {
      if (handleUnauthorizedError(error)) return

      documents.value = []
      listError.value = error instanceof Error ? error.message : 'No se pudieron cargar los documentos. Intentá nuevamente.'
    }
  } finally {
    if (loadId === documentLoadId) isLoadingDocuments.value = false
  }
}

function handleSearchInput() {
  window.clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(loadDocuments, 300)
}

function handleFileChange(event) {
  const file = event.target.files[0]
  errorMessage.value = ''
  successMessage.value = ''

  if (file && file.size > MAX_FILE_SIZE) {
    selectedFile.value = null
    event.target.value = ''
    errorMessage.value = 'El archivo no puede superar los 6 MiB.'
    return
  }

  selectedFile.value = file
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!activeCompany.value) {
    errorMessage.value = 'Seleccioná una compañía antes de subir un documento.'
    return
  }

  if (!selectedFile.value) {
    errorMessage.value = 'Seleccioná un archivo para continuar.'
    return
  }

  isUploading.value = true

  try {
    await uploadDocument({
      company_id: activeCompany.value.id,
      file: selectedFile.value,
      name: name.value.trim()
    })
    selectedFile.value = null
    fileInput.value.value = ''
    name.value = ''
    successMessage.value = 'Documento cargado correctamente.'
    await loadDocuments()
  } catch (error) {
    if (handleUnauthorizedError(error)) return

    errorMessage.value = error instanceof Error ? error.message : 'No se pudo cargar el documento. Intentá nuevamente.'
  } finally {
    isUploading.value = false
  }
}

async function handleDownload(document) {
  errorMessage.value = ''
  downloadingDocumentId.value = document.id

  try {
    const result = await downloadDocument(document.id)
    const link = window.document.createElement('a')
    link.href = result.url
    window.document.body.append(link)
    link.click()
    link.remove()
  } catch (error) {
    if (handleUnauthorizedError(error)) return

    errorMessage.value = error instanceof Error ? error.message : 'No se pudo descargar el documento. Intentá nuevamente.'
  } finally {
    downloadingDocumentId.value = null
  }
}

function handleUnauthorizedError(error) {
  if (error.status !== 401 || error.code !== 'NEX-USR-010') return false

  clearSession()
  router.push('/login')
  return true
}

function formatType(mimeType) {
  return MIME_LABELS[mimeType] ?? mimeType
}

function formatSize(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
</script>