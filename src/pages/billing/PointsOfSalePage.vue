<template>
  <div class="points-page">
    <header class="points-header">
      <span class="points-header-icon" aria-hidden="true"><Building2 :size="24" /></span>
      <div><h1>Puntos de venta</h1><p>Administrá los puntos de venta de la compañía activa.</p></div>
    </header>

    <section class="points-card" aria-labelledby="points-title">
      <div class="points-card-header">
        <div><h2 id="points-title">Puntos de venta</h2><p>El número se asigna automáticamente al crear cada punto.</p></div>
        <Button v-if="activeCompany && !isLoading && !loadError" type="button" :disabled="isSaving" :loading="isSaving && savingId === null" @click="createPoint">
          <Plus :size="16" aria-hidden="true" /> Crear punto de venta
        </Button>
      </div>

      <p v-if="!activeCompany" class="points-state">Seleccioná una compañía para consultar sus puntos de venta.</p>
      <p v-else-if="isLoading" class="points-state" role="status">Cargando puntos de venta...</p>
      <div v-else-if="loadError" class="points-error" role="alert">
        <p>{{ loadError }}</p>
        <RouterLink v-if="missingProfile" to="/billing/fiscal-profile">Configurar perfil fiscal</RouterLink>
        <Button v-else type="button" label="Reintentar" severity="secondary" outlined @click="loadPoints" />
      </div>
      <template v-else>
        <p v-if="actionError" class="points-error" role="alert">{{ actionError }}</p>
        <p v-if="successMessage" class="points-success" role="status">{{ successMessage }}</p>
        <DataTable :value="points" data-key="id" scrollable>
          <template #empty>Todavía no hay puntos de venta para esta compañía.</template>
          <Column field="number" header="Número" />
          <Column header="Estado"><template #body="{ data }">{{ data.is_active ? 'Activo' : 'Inactivo' }}</template></Column>
          <Column header="Creado"><template #body="{ data }">{{ formatDate(data.created_at) }}</template></Column>
          <Column header="Acciones"><template #body="{ data }">
            <Button type="button" size="small" severity="secondary" outlined :disabled="isSaving" :loading="isSaving && savingId === data.id" :label="data.is_active ? 'Desactivar' : 'Activar'" @click="changeStatus(data)" />
          </template></Column>
        </DataTable>
      </template>
    </section>
    <BackLink to="/billing" label="Volver a Facturación" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BackLink from '../../components/BackLink.vue'
import { Building2, Plus } from '@lucide/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import { activatePointOfSale, createPointOfSale, deactivatePointOfSale, getPointsOfSale } from '../../services/billing.service'
import { clearSession } from '../../services/session.service'
import { activeCompany } from '../../stores/company.store'
import '../../assets/css/PointsOfSalePage.css'

const router = useRouter()
const points = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const savingId = ref(null)
const loadError = ref('')
const actionError = ref('')
const successMessage = ref('')
const missingProfile = ref(false)
let loadId = 0
let companyVersion = 0
let mounted = true

watch(activeCompany, () => {
  companyVersion++
  points.value = []
  loadError.value = ''
  actionError.value = ''
  successMessage.value = ''
  missingProfile.value = false
  loadPoints()
}, { immediate: true, flush: 'sync' })

onBeforeUnmount(() => { mounted = false; loadId++; companyVersion++ })

/**
 * Gestiona una respuesta de sesi?n inv?lida.
 * @version 1.0
 * @author Agustin
 */
function handleUnauthorized(error) {
  if (error.status !== 401 || error.code !== 'NEX-USR-010') return false
  clearSession()
  router.push('/login')
  return true
}

/**
 * Consulta los puntos de venta de la compa??a activa.
 * @version 1.0
 * @author Agustin
 */
async function loadPoints() {
  const request = ++loadId
  loadError.value = ''
  missingProfile.value = false
  if (!activeCompany.value) { isLoading.value = false; return }
  isLoading.value = true
  try {
    const result = await getPointsOfSale(activeCompany.value.id)
    if (request === loadId) points.value = result
  } catch (error) {
    if (request !== loadId || handleUnauthorized(error)) return
    if (error.status === 404 && error.message === 'No FiscalProfile matches the given query.') {
      missingProfile.value = true
      loadError.value = 'Configurá el perfil fiscal de esta compañía para consultar sus puntos de venta.'
    } else if (error.status === 403) {
      loadError.value = 'No tenés permiso para consultar los puntos de venta de esta compañía.'
    } else if (error.status === 404) {
      loadError.value = 'No se encontró el recurso solicitado. Intentá nuevamente.'
    } else {
      loadError.value = 'No se pudieron cargar los puntos de venta. Intentá nuevamente.'
    }
  } finally {
    if (request === loadId) isLoading.value = false
  }
}

/**
 * Solicita la creaci?n de un punto de venta.
 * @version 1.0
 * @author Agustin
 */
function createPoint() {
  runAction(null, createPointOfSale, 'Punto de venta creado correctamente.')
}

/**
 * Solicita el cambio de estado de un punto de venta.
 * @version 1.0
 * @author Agustin
 */
function changeStatus(point) {
  runAction(point.id, point.is_active ? deactivatePointOfSale : activatePointOfSale, point.is_active ? 'Punto de venta desactivado.' : 'Punto de venta activado.')
}

/**
 * Ejecuta una acci?n sobre puntos de venta y actualiza el listado.
 * @version 1.0
 * @author Agustin
 */
async function runAction(pointId, action, message) {
  if (isSaving.value || !activeCompany.value) return
  const companyId = activeCompany.value.id
  const version = companyVersion
  let refresh = true
  isSaving.value = true
  savingId.value = pointId
  actionError.value = ''
  successMessage.value = ''
  try {
    await action(companyId, pointId)
    if (version === companyVersion) successMessage.value = message
  } catch (error) {
    if (version !== companyVersion) return
    if (handleUnauthorized(error)) { refresh = false; return }
    if (error.status === 400) {
      const messages = error.errors && Object.values(error.errors).flat().filter(value => typeof value === 'string')
      actionError.value = messages?.length ? messages.join(' ') : error.message !== 'La solicitud falló con estado 400' ? error.message : 'No se pudo realizar la operación. Revisá los datos e intentá nuevamente.'
    } else if (error.status === 403) {
      actionError.value = 'No tenés permiso para administrar los puntos de venta de esta compañía.'
    } else if (error.status === 404) {
      actionError.value = 'No se encontró el punto de venta o el perfil fiscal. Actualizá el listado e intentá nuevamente.'
    } else {
      actionError.value = 'No se pudo completar la operación. Intentá nuevamente.'
    }
  } finally {
    isSaving.value = false
    savingId.value = null
    if (refresh && mounted && activeCompany.value?.id === companyId) loadPoints()
  }
}

/**
 * Formatea una fecha para mostrarla en pantalla.
 * @version 1.0
 * @author Agustin
 */
function formatDate(value) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
</script>
