<template>
  <div class="journal-page">
    <header class="journal-header">
      <span class="journal-header-icon" aria-hidden="true"><ScrollText :size="24" /></span>
      <div class="journal-header-text">
        <h1>Asientos contables</h1>
        <p>Consultá los asientos de la compañía activa y revertí los que correspondan.</p>
      </div>
    </header>

    <section class="journal-card" aria-labelledby="journal-title">
      <h2 id="journal-title" class="journal-sr-only">Listado de asientos contables</h2>

      <div v-if="!activeCompany" class="journal-empty">
        <span class="journal-empty-icon" aria-hidden="true"><Building2 :size="26" /></span>
        <p class="journal-empty-title">Seleccioná una compañía para ver sus asientos contables.</p>
        <RouterLink to="/companies" class="journal-link">Ir a Compañías</RouterLink>
      </div>

      <template v-else>
        <form class="journal-filters" role="search" @submit.prevent="loadEntries">
          <div class="journal-filter">
            <label for="journal-status">Estado</label>
            <Select v-model="filters.status" class="journal-input" input-id="journal-status" :options="statusOptions" option-label="label" option-value="value" placeholder="Todos" show-clear />
          </div>
          <div class="journal-filter">
            <label for="journal-source">Origen</label>
            <Select v-model="filters.source_type" class="journal-input" input-id="journal-source" :options="journalEntrySources" option-label="label" option-value="value" placeholder="Todos" show-clear />
          </div>
          <div class="journal-filter">
            <label for="journal-from">Desde</label>
            <InputText id="journal-from" v-model="filters.accounting_date_from" class="journal-input" type="date" />
          </div>
          <div class="journal-filter">
            <label for="journal-to">Hasta</label>
            <InputText id="journal-to" v-model="filters.accounting_date_to" class="journal-input" type="date" />
          </div>
          <div class="journal-filter-actions">
            <Button type="submit" :loading="isLoading" :disabled="isLoading">
              <Search :size="16" aria-hidden="true" /> Buscar
            </Button>
            <Button type="button" label="Limpiar" severity="secondary" outlined :disabled="isLoading" @click="clearFilters" />
          </div>
        </form>

        <p class="journal-hint">Se listan los asientos publicados y revertidos, en orden cronológico. Los filtros de fecha usan la fecha contable.</p>

        <p v-if="statusMessage" class="journal-message journal-message-success" role="status">{{ statusMessage }}</p>

        <p v-if="isLoading && entries.length === 0" class="journal-state" role="status">Cargando asientos...</p>
        <div v-else-if="listError" class="journal-message journal-message-error" role="alert">
          {{ listError }}
          <button type="button" class="journal-retry" @click="loadEntries">Reintentar</button>
        </div>
        <DataTable v-else :value="entries" data-key="id" paginator :rows="10" :rows-per-page-options="[10, 25, 50]" scrollable>
          <template #empty>
            {{ hasActiveFilters ? 'No se encontraron asientos con esos filtros.' : 'Todavía no hay asientos publicados en esta compañía.' }}
          </template>
          <Column header="N°">
            <template #body="{ data }"><span class="journal-number">{{ data.number }}</span></template>
          </Column>
          <Column header="Fecha contable">
            <template #body="{ data }">{{ formatDate(data.accounting_date) }}</template>
          </Column>
          <Column header="Descripción">
            <template #body="{ data }">
              <span class="journal-description">{{ data.description }}</span>
              <span v-if="relatedText(data)" class="journal-related">{{ relatedText(data) }}</span>
            </template>
          </Column>
          <Column header="Origen">
            <template #body="{ data }">{{ sourceLabels[data.source_type] }}</template>
          </Column>
          <Column header="Estado">
            <template #body="{ data }"><Tag :severity="statusSeverity[data.status]" :value="statusLabels[data.status]" /></template>
          </Column>
          <Column header="Detalle">
            <template #body="{ data }">
              <Button type="button" size="small" severity="secondary" outlined @click="openEntry(data)">
                <Eye :size="16" aria-hidden="true" /> Ver
              </Button>
            </template>
          </Column>
        </DataTable>
      </template>
    </section>

    <Dialog v-model:visible="detailVisible" modal :header="detailHeader" :style="{ width: 'min(900px, 95vw)' }" @hide="closeDetail">
      <p v-if="loadingDetail" class="journal-state" role="status">Cargando detalle...</p>
      <p v-else-if="detailError" class="journal-message journal-message-error" role="alert">{{ detailError }}</p>

      <div v-else-if="entry" class="journal-detail">
        <dl class="journal-detail-grid">
          <div><dt>Fecha contable</dt><dd>{{ formatDate(entry.accounting_date) }}</dd></div>
          <div><dt>Estado</dt><dd><Tag :severity="statusSeverity[entry.status]" :value="statusLabels[entry.status]" /></dd></div>
          <div>
            <dt>Origen</dt>
            <dd>{{ sourceLabels[entry.source_type] }}<template v-if="entry.source_id !== null"> · ID {{ entry.source_id }}</template></dd>
          </div>
          <div><dt>Moneda</dt><dd>{{ entry.currency }}</dd></div>
          <div><dt>Registrado</dt><dd>{{ formatDateTime(entry.created_at) }}</dd></div>
          <div v-if="relatedText(entry)"><dt>Relacionado</dt><dd>{{ relatedText(entry) }}</dd></div>
          <div class="journal-detail-wide"><dt>Descripción</dt><dd>{{ entry.description }}</dd></div>
        </dl>

        <DataTable :value="entry.lines" data-key="id" scrollable>
          <template #empty>Este asiento no tiene movimientos.</template>
          <Column header="Cuenta">
            <template #body="{ data }"><span class="journal-account-code">{{ data.account_code }}</span> {{ data.account_name }}</template>
          </Column>
          <Column header="Concepto">
            <template #body="{ data }">{{ data.description }}</template>
          </Column>
          <Column header="Debe" header-class="journal-amount-head" body-class="journal-amount">
            <template #body="{ data }">{{ lineAmount(data.debit) }}</template>
          </Column>
          <Column header="Haber" header-class="journal-amount-head" body-class="journal-amount">
            <template #body="{ data }">{{ lineAmount(data.credit) }}</template>
          </Column>
        </DataTable>

        <dl class="journal-totals">
          <div><dt>Total Debe</dt><dd>{{ formatAmount(totals.debit) }}</dd></div>
          <div><dt>Total Haber</dt><dd>{{ formatAmount(totals.credit) }}</dd></div>
        </dl>

        <p v-if="actionError" class="journal-message journal-message-error" role="alert">{{ actionError }}</p>

        <div v-if="pendingAction" class="journal-confirm" role="group" aria-labelledby="journal-confirm-title">
          <h3 id="journal-confirm-title">{{ pendingAction === 'reverse' ? 'Confirmar reversión' : 'Confirmar publicación' }}</h3>
          <p v-if="pendingAction === 'reverse'">
            Se creará un asiento nuevo con los importes de Debe y Haber intercambiados y fecha del día, y este asiento quedará como Revertido. Esta operación no se puede deshacer.
          </p>
          <p v-else>
            Al publicar, el asiento pasa a ser inmutable y forma parte del historial contable. Se valida que tenga al menos dos movimientos, que el Debe sea igual al Haber y que las cuentas estén activas. Esta operación no se puede deshacer.
          </p>
          <div class="journal-actions">
            <Button type="button" label="Cancelar" severity="secondary" outlined :disabled="isActing" @click="pendingAction = null" />
            <Button type="button" :loading="isActing" :disabled="isActing" @click="runAction">
              {{ isActing ? 'Procesando...' : pendingAction === 'reverse' ? 'Revertir asiento' : 'Publicar asiento' }}
            </Button>
          </div>
        </div>
        <div v-else-if="entry.status !== 'REVERSED'" class="journal-actions">
          <Button v-if="entry.status === 'DRAFT'" type="button" @click="pendingAction = 'publish'">
            <Check :size="16" aria-hidden="true" /> Publicar
          </Button>
          <Button v-if="entry.status === 'POSTED'" type="button" severity="secondary" outlined @click="pendingAction = 'reverse'">
            <Undo2 :size="16" aria-hidden="true" /> Revertir
          </Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Check, Eye, ScrollText, Search, Undo2 } from '@lucide/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { journalEntrySources, journalEntryStatuses } from '../../constants/accounting.constants'
import { getJournalEntries, getJournalEntry, publishJournalEntry, reverseJournalEntry } from '../../services/accounting.service'
import { clearSession } from '../../services/session.service'
import { activeCompany } from '../../stores/company.store'
import '../../assets/css/JournalEntriesPage.css'

const statusLabels = Object.fromEntries(journalEntryStatuses.map(option => [option.value, option.label]))
const sourceLabels = Object.fromEntries(journalEntrySources.map(option => [option.value, option.label]))
const statusSeverity = { DRAFT: 'secondary', POSTED: 'success', REVERSED: 'danger' }
// La API no devuelve borradores (el filtro DRAFT siempre da vacío): no se ofrece como filtro.
const statusOptions = journalEntryStatuses.filter(option => option.value !== 'DRAFT')
const amountFormat = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const emptyFilters = () => ({ status: null, source_type: null, accounting_date_from: '', accounting_date_to: '' })

const router = useRouter()
const filters = reactive(emptyFilters())
const entries = ref([])
const isLoading = ref(false)
const listError = ref('')
const hasActiveFilters = ref(false)
const statusMessage = ref('')
const detailVisible = ref(false)
const loadingDetail = ref(false)
const detailError = ref('')
const entry = ref(null)
const pendingAction = ref(null)
const isActing = ref(false)
const actionError = ref('')
let listRequest = 0
let detailRequest = 0

const detailHeader = computed(() => entry.value ? `Asiento N° ${entry.value.number}` : 'Detalle del asiento')

// Solo para mostrar: se suma en centavos enteros para evitar errores de decimales.
const totals = computed(() => {
  if (!entry.value) return { debit: 0, credit: 0 }
  const sum = key => entry.value.lines.reduce((total, line) => total + Math.round(Number(line[key]) * 100), 0) / 100
  return { debit: sum('debit'), credit: sum('credit') }
})

watch(activeCompany, () => {
  Object.assign(filters, emptyFilters())
  entries.value = []
  statusMessage.value = ''
  detailVisible.value = false
  loadEntries()
}, { immediate: true })

onBeforeUnmount(() => { listRequest++; detailRequest++ })

/**
 * Gestiona una respuesta de sesión inválida.
 * @version 1.0
 * @author Thiago
 */
function handleUnauthorized(error) {
  if (error.status !== 401 || error.code !== 'NEX-USR-010') return false
  clearSession()
  router.push('/login')
  return true
}

/**
 * Consulta los asientos de la compañía activa con los filtros ingresados.
 * @version 1.0
 * @author Thiago
 */
async function loadEntries() {
  const request = ++listRequest
  listError.value = ''
  if (!activeCompany.value) { entries.value = []; isLoading.value = false; return }
  hasActiveFilters.value = Object.values(filters).some(Boolean)
  isLoading.value = true
  try {
    const result = await getJournalEntries(activeCompany.value.id, filters)
    if (request === listRequest) entries.value = result
  } catch (error) {
    if (request === listRequest && !handleUnauthorized(error)) {
      entries.value = []
      if (error.status === 400) listError.value = 'Revisá las fechas ingresadas e intentá nuevamente.'
      else if (error.status === 403) listError.value = 'No tenés permiso para consultar los asientos de esta compañía.'
      else listError.value = 'No se pudieron cargar los asientos. Intentá nuevamente.'
    }
  } finally {
    if (request === listRequest) isLoading.value = false
  }
}

/**
 * Limpia los filtros y vuelve a consultar.
 * @version 1.0
 * @author Thiago
 */
function clearFilters() {
  Object.assign(filters, emptyFilters())
  loadEntries()
}

/**
 * Consulta y muestra el detalle de un asiento.
 * @version 1.0
 * @author Thiago
 */
async function openEntry(row) {
  const request = ++detailRequest
  entry.value = null
  detailError.value = ''
  actionError.value = ''
  pendingAction.value = null
  detailVisible.value = true
  loadingDetail.value = true
  try {
    const result = await getJournalEntry(activeCompany.value.id, row.id)
    if (request === detailRequest) entry.value = result
  } catch (error) {
    if (request === detailRequest && !handleUnauthorized(error)) {
      if (error.status === 403) detailError.value = 'No tenés permiso para consultar los asientos de esta compañía.'
      else if (error.status === 404) detailError.value = 'El asiento ya no está disponible. Actualizá el listado.'
      else detailError.value = 'No se pudo cargar el detalle. Intentá nuevamente.'
    }
  } finally {
    if (request === detailRequest) loadingDetail.value = false
  }
}

/**
 * Limpia el detalle y descarta solicitudes pendientes.
 * @version 1.0
 * @author Thiago
 */
function closeDetail() {
  detailRequest++
  entry.value = null
  loadingDetail.value = false
  detailError.value = ''
  actionError.value = ''
  pendingAction.value = null
}

/**
 * Ejecuta la acción confirmada (publicar o revertir) sobre el asiento abierto.
 * @version 1.0
 * @author Thiago
 */
async function runAction() {
  if (isActing.value || !pendingAction.value || !entry.value || !activeCompany.value) return
  const action = pendingAction.value
  const companyId = activeCompany.value.id
  const target = entry.value
  actionError.value = ''
  isActing.value = true
  try {
    const result = action === 'publish'
      ? await publishJournalEntry(companyId, target.id)
      : await reverseJournalEntry(companyId, target.id)
    statusMessage.value = action === 'publish'
      ? `Asiento N° ${result.number} publicado correctamente.`
      : `Asiento N° ${target.number} revertido. Se creó el asiento de reversión N° ${result.number}.`
    detailVisible.value = false
    await loadEntries()
  } catch (error) {
    if (handleUnauthorized(error)) return
    pendingAction.value = null
    actionError.value = actionErrorMessage(error, action)
  } finally {
    isActing.value = false
  }
}

/**
 * Traduce los errores de publicación y reversión a mensajes para el usuario.
 * @version 1.0
 * @author Thiago
 */
function actionErrorMessage(error, action) {
  if (error.code === 'NEX-ACC-003') return 'No se pudo publicar: el asiento debe estar en borrador, tener al menos dos movimientos, estar balanceado y usar cuentas activas de esta compañía.'
  if (error.code === 'NEX-ACC-004') return 'No se pudo revertir: el asiento debe estar publicado y cumplir las reglas contables de la reversión.'
  if (error.status === 403) return 'No tenés permiso para operar sobre los asientos de esta compañía.'
  if (error.status === 404) return 'El asiento ya no está disponible. Cerrá esta ventana y actualizá el listado.'
  return action === 'publish' ? 'No se pudo publicar el asiento. Intentá nuevamente.' : 'No se pudo revertir el asiento. Intentá nuevamente.'
}

/**
 * Describe la relación de un asiento con su reversión, si se conoce.
 * @version 1.0
 * @author Thiago
 */
function relatedText(item) {
  if (item.reversal_of !== null) return `Revierte el asiento ${entryLabel(item.reversal_of)}`
  const reversal = entries.value.find(candidate => candidate.reversal_of === item.id)
  return reversal ? `Revertido por el asiento N° ${reversal.number}` : ''
}

/**
 * Identifica un asiento por su número si está en el listado cargado.
 * @version 1.0
 * @author Thiago
 */
function entryLabel(id) {
  const found = entries.value.find(candidate => candidate.id === id)
  return found ? `N° ${found.number}` : `(ID ${id})`
}

/**
 * Formatea un importe para mostrarlo en pantalla.
 * @version 1.0
 * @author Thiago
 */
function formatAmount(value) {
  return amountFormat.format(Number(value))
}

/**
 * Formatea el importe de un movimiento; el lado vacío se muestra como guion.
 * @version 1.0
 * @author Thiago
 */
function lineAmount(value) {
  return Number(value) === 0 ? '—' : formatAmount(value)
}

/**
 * Formatea una fecha ISO (AAAA-MM-DD) para mostrarla en pantalla.
 * @version 1.0
 * @author Thiago
 */
function formatDate(value) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Formatea una fecha y hora para mostrarla en pantalla.
 * @version 1.0
 * @author Thiago
 */
function formatDateTime(value) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
</script>