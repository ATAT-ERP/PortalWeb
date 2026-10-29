<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Panel de trabajo</h1>
      <p>Resumen de tus compañías y documentación</p>
    </header>

    <div class="dashboard-card dashboard-grid">
      <section class="dashboard-company" aria-labelledby="active-company-title">
        <div class="dashboard-section-header">
          <span class="dashboard-icon"><Building2 :size="20" aria-hidden="true" /></span>
          <h2 id="active-company-title">Empresa activa</h2>
        </div>
        <p v-if="isLoadingCompanies" class="dashboard-state" role="status">Cargando compañías...</p>
        <p v-else-if="companiesError" class="dashboard-error" role="alert">No se pudieron cargar las compañías.</p>
        <template v-else>
          <template v-if="activeCompany">
            <p class="dashboard-company-name">{{ activeCompany.name }}</p>
            <dl class="dashboard-company-details">
              <div v-if="activeCompany.type"><dt>Tipo de actividad</dt><dd>{{ activeCompany.type === 'organization' ? 'Organización' : 'Autónomo / individual' }}</dd></div>
              <div v-if="activeCompany.tax_id"><dt>CUIT</dt><dd>{{ activeCompany.tax_id }}</dd></div>
            </dl>
          </template>
          <p v-else class="dashboard-state">{{ companies.length ? 'Seleccioná una compañía desde la barra lateral.' : 'Todavía no tenés compañías registradas.' }}</p>
        </template>
      </section>

      <section class="dashboard-recent" aria-labelledby="recent-documents-title">
        <div class="dashboard-section-header">
          <span class="dashboard-icon"><History :size="20" aria-hidden="true" /></span>
          <h2 id="recent-documents-title">Archivos recientes</h2>
        </div>
        <p v-if="isLoadingCompanies || isLoadingDocuments" class="dashboard-state" role="status">Cargando documentos...</p>
        <p v-else-if="companiesError" class="dashboard-state">No se pudo obtener la empresa activa.</p>
        <p v-else-if="!activeCompany" class="dashboard-state">Seleccioná una compañía para ver sus documentos.</p>
        <p v-else-if="documentsError" class="dashboard-error" role="alert">No se pudieron cargar los documentos. Intentá nuevamente desde Cloud.</p>
        <p v-else-if="!documents.length" class="dashboard-state">Todavía no hay documentos en esta compañía.</p>
        <ul v-else class="dashboard-documents">
          <li v-for="document in documents.slice(0, 3)" :key="document.id">
            <span class="dashboard-file-icon" :class="`dashboard-file-${fileType(document.original_name)}`">
              <component :is="fileIcons[fileType(document.original_name)]" :size="18" aria-hidden="true" />
            </span>
            <div class="dashboard-file-name" tabindex="0"><strong :title="document.name || document.original_name">{{ document.name || document.original_name }}</strong><span v-if="document.original_name && document.original_name !== document.name" :title="document.original_name">{{ document.original_name }}</span></div>
            <time :datetime="document.created_at">{{ formatDate(document.created_at) }}</time>
          </li>
        </ul>
      </section>
    </div>

    <section class="dashboard-quick" aria-labelledby="quick-links-title">
      <div class="dashboard-quick-header">
        <LayoutGrid :size="20" aria-hidden="true" />
        <h2 id="quick-links-title">Accesos rápidos</h2>
      </div>
      <div class="dashboard-links">
        <RouterLink v-for="item in quickLinks" :key="item.to" :to="item.to" class="dashboard-link">
          <component :is="item.icon" :size="30" :stroke-width="2.25" aria-hidden="true" />
          <strong>{{ item.label }}</strong>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Building2, Cloud, File, FileImage, FileSpreadsheet, FileText, History, LayoutGrid, Receipt } from '@lucide/vue'
import { getDocuments } from '../../services/document.service'
import { clearSession } from '../../services/session.service'
import { activeCompany, companies, companiesError, isLoadingCompanies } from '../../stores/company.store'
import '../../assets/css/HomePage.css'

const router = useRouter()
const quickLinks = [
  { label: 'Cloud', to: '/documents', icon: Cloud },
  { label: 'Compañías', to: '/companies', icon: Building2 },
  { label: 'Facturación', to: '/billing', icon: Receipt }
]
const fileIcons = { image: FileImage, pdf: FileText, spreadsheet: FileSpreadsheet, document: FileText, other: File }
const documents = ref([])
const isLoadingDocuments = ref(false)
const documentsError = ref(false)
let documentLoadId = 0

watch(() => activeCompany.value?.id, async (companyId) => {
  const loadId = ++documentLoadId
  documents.value = []
  documentsError.value = false
  isLoadingDocuments.value = Boolean(companyId)
  if (!companyId) return

  try {
    const result = await getDocuments(companyId)
    if (loadId === documentLoadId) documents.value = result
  } catch (error) {
    if (loadId !== documentLoadId) return
    if (error.status === 401 && error.code === 'NEX-USR-010') {
      clearSession()
      router.push('/login')
      return
    }
    documentsError.value = true
  } finally {
    if (loadId === documentLoadId) isLoadingDocuments.value = false
  }
}, { immediate: true })

function formatDate(value) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function fileType(name) {
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : ''
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) return 'image'
  if (extension === 'pdf') return 'pdf'
  if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet'
  if (['doc', 'docx'].includes(extension)) return 'document'
  return 'other'
}
</script>
