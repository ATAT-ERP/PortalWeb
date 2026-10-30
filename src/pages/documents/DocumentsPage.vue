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
                  <div class="documents-file-actions">
                    <button v-if="isExcelDocument(document)" type="button" class="documents-download-button" @click="openExcelPreview(document)">
                      <Eye :size="16" aria-hidden="true" />
                      <span>Vista previa</span>
                    </button>
                    <button
                      type="button"
                      class="documents-download-button"
                      :disabled="downloadingDocumentId === document.id"
                      @click="handleDownload(document)"
                    >
                      <Download :size="16" aria-hidden="true" />
                      <span>{{ downloadingDocumentId === document.id ? 'Descargando...' : 'Descargar' }}</span>
                    </button>
                  </div>
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

    <Dialog
      v-model:visible="previewVisible"
      class="documents-excel-dialog"
      modal
      :style="{ width: 'min(1000px, 95vw)', maxHeight: '90vh' }"
    >
      <template #header>
        <div class="documents-preview-dialog-header">
          <span class="documents-preview-dialog-icon" aria-hidden="true"><FileSpreadsheet :size="21" /></span>
          <div>
            <strong>{{ previewDocument ? previewDocument.original_name : '' }}</strong>
            <span>Vista previa de Excel</span>
          </div>
        </div>
      </template>
      <div v-if="previewDocument" class="documents-excel-preview">
        <p v-if="previewLoadingSheets" class="documents-preview-state" role="status">Cargando hojas...</p>
        <div v-else-if="previewSheetsError" class="documents-preview-error" role="alert">
          <p>{{ previewSheetsError }}</p>
          <button type="button" class="documents-download-button" @click="loadPreviewSheets(previewDocument, previewRequestId)">Reintentar</button>
        </div>
        <p v-else-if="!previewSheets.length" class="documents-preview-state">Este libro no contiene hojas para mostrar.</p>
        <div v-else class="documents-preview-content">
          <div class="documents-preview-toolbar">
            <label class="documents-preview-sheet-field" for="documents-preview-sheet">
              <span>Hoja</span>
              <Select
                input-id="documents-preview-sheet"
                v-model="selectedPreviewSheet"
                :options="previewSheets"
                :disabled="previewLoadingSheets"
                @update:model-value="handlePreviewSheetChange"
              />
            </label>
            <p v-if="previewLoadingRows" class="documents-preview-count" role="status">Cargando filas...</p>
            <p v-else-if="!previewSheetError" class="documents-preview-count">{{ visiblePreviewRows.length }} de {{ previewRows.length }} filas</p>
          </div>

          <p v-if="previewSheetError" class="documents-preview-error" role="alert">
            {{ previewSheetError }}
            <button type="button" class="documents-download-button" @click="loadPreviewSheet(selectedPreviewSheet, previewRequestId)">Reintentar</button>
          </p>
          <template v-else-if="!previewLoadingRows">
            <div class="documents-preview-table-wrapper" tabindex="0" aria-label="Datos de la hoja seleccionada">
              <table class="documents-preview-table">
                <caption class="documents-sr-only">Datos de {{ selectedPreviewSheet }}</caption>
                <thead>
                  <tr>
                    <th class="documents-preview-row-number" scope="col">Fila</th>
                    <th v-for="columnIndex in previewColumnCount" :key="columnIndex" scope="col">{{ columnLabel(columnIndex - 1) }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in visiblePreviewRows" :key="rowIndex">
                    <th class="documents-preview-row-number" scope="row">{{ rowIndex + 1 }}</th>
                    <td v-for="columnIndex in previewColumnCount" :key="columnIndex" :class="{ 'is-number': typeof row[columnIndex - 1] === 'number' }">
                      <span class="documents-preview-cell-value">{{ row[columnIndex - 1] ?? '' }}</span>
                    </td>
                  </tr>
                  <tr v-if="!previewRows.length"><td class="documents-preview-empty-cell" :colspan="previewColumnCount + 1">Esta hoja no tiene filas para mostrar.</td></tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </Dialog>

    <BackLink to="/home" label="Volver a Inicio" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BackLink from '../../components/BackLink.vue'
import { Download, Eye, FileSpreadsheet, FileUp, FolderOpen, Info, Search, Upload } from '@lucide/vue'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import { downloadDocument, getDocumentSheet, getDocumentSheets, getDocuments, uploadDocument } from '../../services/document.service'
import { clearSession } from '../../services/session.service'
import { activeCompany } from '../../stores/company.store'
import '../../assets/css/DocumentsPage.css'

const MAX_FILE_SIZE = 6 * 1024 * 1024
const PREVIEW_ROW_LIMIT = 100

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
const previewVisible = ref(false)
const previewDocument = ref(null)
const previewSheets = ref([])
const selectedPreviewSheet = ref(null)
const previewRows = ref([])
const previewLoadingSheets = ref(false)
const previewLoadingRows = ref(false)
const previewSheetsError = ref('')
const previewSheetError = ref('')
const visiblePreviewRows = computed(() => previewRows.value.slice(0, PREVIEW_ROW_LIMIT))
const previewColumnCount = computed(() => previewRows.value.reduce((count, row) => Math.max(count, row.length), 0))
const searchQuery = ref('')
let documentLoadId = 0
let previewRequestId = 0
let previewSheetRequestId = 0
let searchTimeout

watch(activeCompany, () => {
  searchQuery.value = ''
  window.clearTimeout(searchTimeout)
  loadDocuments()
}, { immediate: true })

watch(previewVisible, (visible) => {
  if (!visible) closeExcelPreview()
})

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

function isExcelDocument(document) {
  return document.original_name.toLowerCase().endsWith('.xlsx')
}

function openExcelPreview(document) {
  const requestId = ++previewRequestId
  previewVisible.value = true
  previewDocument.value = document
  previewSheets.value = []
  selectedPreviewSheet.value = null
  previewRows.value = []
  previewSheetsError.value = ''
  previewSheetError.value = ''
  previewLoadingRows.value = false
  loadPreviewSheets(document, requestId)
}

async function loadPreviewSheets(document, requestId) {
  ++previewSheetRequestId
  previewSheets.value = []
  selectedPreviewSheet.value = null
  previewRows.value = []
  previewSheetsError.value = ''
  previewSheetError.value = ''
  previewLoadingSheets.value = true
  previewLoadingRows.value = false

  try {
    const result = await getDocumentSheets(document.id)
    if (!isCurrentPreview(requestId, document.id)) return

    previewSheets.value = result.sheets
    previewLoadingSheets.value = false
    if (!result.sheets.length) return

    selectedPreviewSheet.value = result.sheets[0]
    await loadPreviewSheet(result.sheets[0], requestId)
  } catch (error) {
    if (!isCurrentPreview(requestId, document.id)) return
    if (handleUnauthorizedError(error)) return

    previewSheetsError.value = error instanceof Error ? error.message : 'No se pudieron cargar las hojas del archivo.'
  } finally {
    if (isCurrentPreview(requestId, document.id)) previewLoadingSheets.value = false
  }
}

function handlePreviewSheetChange(sheetName) {
  selectedPreviewSheet.value = sheetName
  loadPreviewSheet(sheetName, previewRequestId)
}

async function loadPreviewSheet(sheetName, requestId) {
  const document = previewDocument.value
  if (!document || !sheetName) return

  const sheetRequestId = ++previewSheetRequestId
  previewRows.value = []
  previewSheetError.value = ''
  previewLoadingRows.value = true

  try {
    const result = await getDocumentSheet(document.id, sheetName)
    if (!isCurrentPreview(requestId, document.id) || sheetRequestId !== previewSheetRequestId || selectedPreviewSheet.value !== sheetName) return

    previewRows.value = result.rows
  } catch (error) {
    if (!isCurrentPreview(requestId, document.id) || sheetRequestId !== previewSheetRequestId || selectedPreviewSheet.value !== sheetName) return
    if (handleUnauthorizedError(error)) return

    previewSheetError.value = error instanceof Error ? error.message : 'No se pudo leer la hoja seleccionada.'
  } finally {
    if (isCurrentPreview(requestId, document.id) && sheetRequestId === previewSheetRequestId) previewLoadingRows.value = false
  }
}

function isCurrentPreview(requestId, documentId) {
  return previewVisible.value && previewRequestId === requestId && previewDocument.value.id === documentId
}

function closeExcelPreview() {
  ++previewRequestId
  ++previewSheetRequestId
  previewDocument.value = null
  previewSheets.value = []
  selectedPreviewSheet.value = null
  previewRows.value = []
  previewLoadingSheets.value = false
  previewLoadingRows.value = false
  previewSheetsError.value = ''
  previewSheetError.value = ''
}

function columnLabel(index) {
  let number = index + 1
  let label = ''

  while (number > 0) {
    const remainder = (number - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    number = Math.floor((number - 1) / 26)
  }

  return label
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
