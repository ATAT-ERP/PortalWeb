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

    <section class="documents-card">
      <header class="documents-list-header">
        <h2>Documentos cargados</h2>
      </header>

      <p v-if="!activeCompany" class="documents-list-state">Seleccioná una compañía para ver sus documentos.</p>
      <p v-else-if="isLoadingDocuments" class="documents-list-state">Cargando documentos...</p>
      <p v-else-if="listError" class="documents-message documents-message-error" role="alert">{{ listError }}</p>
      <p v-else-if="documents.length === 0" class="documents-list-state">Todavía no hay documentos en esta compañía.</p>

      <div v-else class="documents-table-wrapper">
        <table class="documents-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Tamaño</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="document in documents" :key="document.id">
              <td>
                <strong>{{ document.name || document.original_name }}</strong>
                <span v-if="document.original_name && document.original_name !== document.name" class="documents-original-name">{{ document.original_name }}</span>
              </td>
              <td>{{ document.mime_type }}</td>
              <td>{{ formatSize(document.size) }}</td>
              <td>{{ formatDate(document.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="documents-card">
      <form class="documents-form" @submit.prevent="handleSubmit" novalidate>
        <p class="documents-company">
          Compañía activa: <strong>{{ activeCompany ? activeCompany.name : 'Seleccioná una compañía antes de subir un documento.' }}</strong>
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
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FileUp, Upload } from '@lucide/vue'
import { getDocuments, uploadDocument } from '../../services/document.service'
import { clearSession } from '../../services/session.service'
import { activeCompany } from '../../stores/company.store'
import '../../assets/css/DocumentsPage.css'

const MAX_FILE_SIZE = 6 * 1024 * 1024

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
let documentLoadId = 0

watch(activeCompany, loadDocuments, { immediate: true })

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
    const result = await getDocuments(activeCompany.value.id)
    if (loadId === documentLoadId) documents.value = result
  } catch (error) {
    if (loadId === documentLoadId) {
      if (error.status === 401 && error.code === 'NEX-USR-010') {
        clearSession()
        router.push('/login')
        return
      }

      documents.value = []
      listError.value = error instanceof Error ? error.message : 'No se pudieron cargar los documentos. Intentá nuevamente.'
    }
  } finally {
    if (loadId === documentLoadId) isLoadingDocuments.value = false
  }
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
    if (error.status === 401 && error.code === 'NEX-USR-010') {
      clearSession()
      router.push('/login')
      return
    }

    errorMessage.value = error instanceof Error ? error.message : 'No se pudo cargar el documento. Intentá nuevamente.'
  } finally {
    isUploading.value = false
  }
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
