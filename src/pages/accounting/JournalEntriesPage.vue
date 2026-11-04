<template>
  <div class="journal-page">
    <header class="journal-header">
      <span class="journal-header-icon" aria-hidden="true"><ScrollText :size="24" /></span>
      <div class="journal-header-text">
        <h1>Asientos contables</h1>
        <p>Registrá operaciones manuales y consultá el historial de la compañía activa.</p>
      </div>
      <div v-if="activeCompany" class="journal-actions">
        <Button type="button" severity="secondary" outlined @click="setView(view === 'history' ? 'drafts' : 'history')">{{ view === 'history' ? 'Borradores' : 'Historial' }}</Button>
        <Button v-if="view === 'history'" type="button" @click="openCreate"><Plus :size="16" aria-hidden="true" /> Nuevo asiento</Button>
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
        <form v-if="view === 'history'" class="journal-filters" role="search" @submit.prevent="loadEntries">
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

        <form v-else class="journal-filters" role="search" @submit.prevent="loadDrafts">
          <Button type="submit" :loading="isLoadingDrafts" :disabled="isLoadingDrafts"><Search :size="16" aria-hidden="true" /> Actualizar borradores</Button>
        </form>

        <p class="journal-hint">{{ view === 'history' ? 'Se listan los asientos publicados y revertidos, en orden cronológico.' : 'Los borradores no afectan los reportes hasta que se publiquen.' }}</p>

        <p v-if="statusMessage" class="journal-message journal-message-success" role="status">{{ statusMessage }}</p>

        <p v-if="view === 'history' && isLoading && entries.length === 0" class="journal-state" role="status">Cargando asientos...</p>
        <div v-else-if="view === 'history' && listError" class="journal-message journal-message-error" role="alert">
          {{ listError }}
          <button type="button" class="journal-retry" @click="loadEntries">Reintentar</button>
        </div>
        <DataTable v-else-if="view === 'history'" :value="entries" data-key="id" paginator :rows="10" :rows-per-page-options="[10, 25, 50]" scrollable>
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
        <p v-if="view === 'drafts' && isLoadingDrafts" class="journal-state" role="status">Cargando borradores...</p>
        <div v-else-if="view === 'drafts' && draftsError" class="journal-message journal-message-error" role="alert">{{ draftsError }} <button type="button" class="journal-retry" @click="loadDrafts">Reintentar</button></div>
        <DataTable v-else-if="view === 'drafts'" :value="drafts" data-key="id" scrollable>
          <template #empty>No hay borradores en esta compañía.</template>
          <Column field="number" header="N°" />
          <Column header="Fecha contable"><template #body="{ data }">{{ formatDate(data.accounting_date) }}</template></Column>
          <Column field="description" header="Descripción" />
          <Column field="currency" header="Moneda" />
          <Column header="Estado"><template #body="{ data }"><Tag severity="secondary" value="Borrador" /></template></Column>
          <Column header="Detalle"><template #body="{ data }"><Button type="button" size="small" severity="secondary" outlined @click="openDraft(data)"><Eye :size="16" aria-hidden="true" /> Ver</Button></template></Column>
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
          <p v-if="pendingAction === 'publish' && (entry.lines.length < 2 || totals.debit !== totals.credit)" class="journal-message journal-message-error" role="alert">
            {{ entry.lines.length < 2 ? 'Este borrador necesita al menos dos movimientos para publicarse.' : 'Este borrador está desbalanceado y no se puede publicar.' }}
          </p>
          <div class="journal-actions">
            <Button type="button" label="Cancelar" severity="secondary" outlined :disabled="isActing" @click="pendingAction = null" />
            <Button type="button" :loading="isActing" :disabled="isActing || (pendingAction === 'publish' && (entry.lines.length < 2 || totals.debit !== totals.credit))" @click="runAction">
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

    <Dialog v-model:visible="createVisible" modal header="Nuevo asiento" :style="{ width: 'min(1000px, 96vw)' }" @hide="resetDraftForm">
      <form class="journal-detail" @submit.prevent="saveDraft">
        <div v-if="accountsError" class="journal-message journal-message-error" role="alert">{{ accountsError }} <button type="button" class="journal-retry" @click="loadAccounts">Reintentar</button></div>
        <p v-else-if="isLoadingAccounts" class="journal-state" role="status">Cargando cuentas...</p>
        <p v-else-if="activeAccounts.length === 0" class="journal-state">No hay cuentas activas para esta compañía. <RouterLink to="/accounting/chart-of-accounts" class="journal-link">Ir al plan de cuentas</RouterLink></p>
        <div class="journal-form-grid">
          <label>Fecha contable<InputText v-model="draftForm.accounting_date" class="journal-input" type="date" required :disabled="isSavingDraft" /></label>
          <label>Moneda<Select v-model="draftForm.currency" class="journal-input" :options="currencyOptions" option-label="label" option-value="value" :disabled="isSavingDraft" /></label>
          <label class="journal-form-wide">Descripción<InputText v-model="draftForm.description" class="journal-input" required :disabled="isSavingDraft" /></label>
        </div>
        <DataTable :value="draftForm.lines" data-key="rowId" scrollable>
          <Column header="Cuenta"><template #body="{ data }"><Select v-model="data.account" class="journal-input" :options="activeAccountOptions" option-label="label" option-value="value" placeholder="Seleccioná cuenta" filter :disabled="isSavingDraft || isLoadingAccounts" /></template></Column>
          <Column header="Concepto"><template #body="{ data }"><InputText v-model="data.description" class="journal-input" :disabled="isSavingDraft" /></template></Column>
          <Column header="Debe"><template #body="{ data }"><InputText v-model="data.debit" class="journal-input" type="number" min="0" step="0.01" :disabled="isSavingDraft" /></template></Column>
          <Column header="Haber"><template #body="{ data }"><InputText v-model="data.credit" class="journal-input" type="number" min="0" step="0.01" :disabled="isSavingDraft" /></template></Column>
          <Column header=""><template #body="{ index }"><Button type="button" severity="secondary" text label="Quitar" :disabled="isSavingDraft || draftForm.lines.length <= 2" @click="draftForm.lines.splice(index, 1)" /></template></Column>
        </DataTable>
        <div class="journal-totals"><span>Debe {{ moneyText(draftTotals.debit) }}</span><span>Haber {{ moneyText(draftTotals.credit) }}</span><span :class="draftTotals.balanced ? 'journal-balanced' : 'journal-unbalanced'">Diferencia {{ moneyText(draftTotals.difference) }} · {{ draftTotals.balanced ? 'Balanceado' : 'Desbalanceado' }}</span></div>
        <p v-if="draftError" class="journal-message journal-message-error" role="alert">{{ draftError }}</p>
        <div class="journal-actions"><Button type="button" severity="secondary" outlined label="Agregar movimiento" :disabled="isSavingDraft" @click="addLine" /><Button type="button" severity="secondary" outlined label="Cancelar" :disabled="isSavingDraft" @click="createVisible = false" /><Button type="submit" :loading="isSavingDraft" :disabled="isSavingDraft || isLoadingAccounts || activeAccounts.length === 0">{{ isSavingDraft ? 'Guardando...' : 'Guardar borrador' }}</Button></div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Check, Eye, Plus, ScrollText, Search, Undo2 } from '@lucide/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { journalEntrySources, journalEntryStatuses } from '../../constants/accounting.constants'
import { createJournalEntry, getAccounts, getJournalEntries, getJournalEntry, getJournalEntryDraft, getJournalEntryDrafts, publishJournalEntry, reverseJournalEntry } from '../../services/accounting.service'
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
const drafts = ref([])
const view = ref('history')
const draftsError = ref('')
const isLoadingDrafts = ref(false)
const createVisible = ref(false)
const isLoadingAccounts = ref(false)
const accountsError = ref('')
const accounts = ref([])
const isSavingDraft = ref(false)
const draftError = ref('')
const draftForm = reactive({ accounting_date: todayISO(), description: '', currency: 'ARS', lines: [] })
const currencyOptions = [{ label: 'ARS', value: 'ARS' }]
let draftRequest = 0
let accountsRequest = 0
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

const activeAccounts = computed(() => accounts.value.filter(account => account.is_active))
const activeAccountOptions = computed(() => activeAccounts.value.map(account => ({ label: `${account.code} · ${account.name}`, value: account.id })))

const draftTotals = computed(() => {
  const debit = draftForm.lines.reduce((sum, line) => sum + cents(line.debit), 0n)
  const credit = draftForm.lines.reduce((sum, line) => sum + cents(line.credit), 0n)
  return { debit, credit, difference: debit >= credit ? debit - credit : credit - debit, balanced: debit === credit }
})

// Solo para mostrar: se suma en centavos enteros para evitar errores de decimales.
const totals = computed(() => {
  if (!entry.value) return { debit: 0, credit: 0 }
  const sum = key => entry.value.lines.reduce((total, line) => total + Math.round(Number(line[key]) * 100), 0) / 100
  return { debit: sum('debit'), credit: sum('credit') }
})

watch(activeCompany, () => {
  listRequest++
  detailRequest++
  draftRequest++
  accountsRequest++
  Object.assign(filters, emptyFilters())
  entries.value = []
  drafts.value = []
  accounts.value = []
  statusMessage.value = ''
  entry.value = null
  detailVisible.value = false
  pendingAction.value = null
  view.value = 'history'
  createVisible.value = false
  resetDraftForm()
  if (activeCompany.value) loadEntries()
}, { immediate: true })

onBeforeUnmount(() => { listRequest++; detailRequest++; draftRequest++; accountsRequest++ })

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

function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function cents(value) {
  const match = String(value || '0').match(/^(\d+)(?:\.(\d{0,2}))?$/)
  return match ? BigInt(match[1]) * 100n + BigInt((match[2] || '').padEnd(2, '0') || '0') : 0n
}

function validDecimal(value) {
  return /^\d+(?:\.\d{1,2})?$/.test(String(value))
}

function moneyText(value) {
  const amount = value < 0n ? -value : value
  return `${value < 0n ? '-' : ''}${amount / 100n},${String(amount % 100n).padStart(2, '0')}`
}

function addLine() {
  draftForm.lines.push({ rowId: crypto.randomUUID(), account: null, description: '', debit: '0.00', credit: '0.00' })
}

function resetDraftForm() {
  draftForm.accounting_date = todayISO()
  draftForm.description = ''
  draftForm.currency = 'ARS'
  draftForm.lines = []
  draftError.value = ''
}

function openCreate() {
  resetDraftForm()
  addLine()
  addLine()
  createVisible.value = true
  if (accounts.value.length === 0) loadAccounts()
}

/**
 * Consulta las cuentas activas de la compañía y las guarda en el estado.
 * @version 1.0
 * @author Agustin
 */
async function loadAccounts() {
  if (!activeCompany.value) return
  const request = ++accountsRequest
  const companyId = activeCompany.value.id
  isLoadingAccounts.value = true
  accountsError.value = ''
  try {
    const result = await getAccounts(companyId)
    if (request === accountsRequest && activeCompany.value?.id === companyId) accounts.value = result
  } catch (error) {
    if (request === accountsRequest && !handleUnauthorized(error)) accountsError.value = 'No se pudieron cargar las cuentas activas.'
  } finally {
    if (request === accountsRequest) isLoadingAccounts.value = false
  }
}

/**
 * Guarda un borrador de asiento contable con los datos ingresados en el formulario.
 * @version 1.0
 * @author Agustin
 */
async function saveDraft() {
  if (isSavingDraft.value || !activeCompany.value) return
  draftError.value = ''
  const lines = draftForm.lines.map(line => ({
    account: line.account,
    description: line.description.trim() || draftForm.description.trim(),
    debit: decimalText(line.debit),
    credit: decimalText(line.credit)
  }))
  if (!draftForm.accounting_date || !draftForm.description.trim()) { draftError.value = 'Completá la fecha y la descripción.'; return }
  if (lines.some(line => !line.account || line.description.trim() === '' || !validDecimal(line.debit) || !validDecimal(line.credit) || (cents(line.debit) > 0n && cents(line.credit) > 0n) || (cents(line.debit) === 0n && cents(line.credit) === 0n))) { draftError.value = 'Cada movimiento necesita una cuenta, un concepto y un importe válido en Debe o Haber.'; return }
  const companyId = activeCompany.value.id
  isSavingDraft.value = true
  try {
    await createJournalEntry(companyId, { accounting_date: draftForm.accounting_date, description: draftForm.description.trim(), currency: draftForm.currency, lines })
    if (activeCompany.value?.id !== companyId) return
    statusMessage.value = 'Borrador guardado correctamente.'
    createVisible.value = false
    await loadDrafts()
  } catch (error) {
    if (activeCompany.value?.id !== companyId) return
    if (handleUnauthorized(error)) return
    draftError.value = error.status === 400 ? validationErrorText(error.errors) : error.status === 403 ? 'No tenés permiso para crear asientos en esta compañía.' : 'No se pudo guardar el borrador. Revisá la conexión e intentá nuevamente.'
  } finally {
    isSavingDraft.value = false
  }
}

function decimalText(value) {
  const text = String(value || '0').trim()
  if (!/^\d+(?:\.\d{0,2})?$/.test(text)) return ''
  const [whole, fraction = ''] = text.split('.')
  return `${whole}.${fraction.padEnd(2, '0')}`
}

function validationErrorText(errors) {
  const messages = []
  const collect = value => {
    if (typeof value === 'string') messages.push(value)
    else if (Array.isArray(value)) value.forEach(collect)
    else if (value && typeof value === 'object') Object.values(value).forEach(collect)
  }
  collect(errors)
  return messages.length ? `Revisá los datos del asiento: ${messages.join(' ')}` : 'Revisá los datos del asiento y sus movimientos.'
}

function setView(next) {
  view.value = next
  statusMessage.value = ''
  if (next === 'drafts') loadDrafts()
}
/**
 * Consulta los borradores de la compañía activa y los guarda en el estado.
 * @version 1.0
 * @author Agustin
 */
async function loadDrafts() {
  if (!activeCompany.value) return
  const request = ++draftRequest
  const companyId = activeCompany.value.id
  draftsError.value = ''
  isLoadingDrafts.value = true
  try {
    const result = await getJournalEntryDrafts(companyId)
    if (request === draftRequest && activeCompany.value?.id === companyId) drafts.value = result
  } catch (error) {
    if (request === draftRequest && !handleUnauthorized(error)) { drafts.value = []; draftsError.value = error.status === 403 ? 'No tenés permiso para consultar los borradores.' : 'No se pudieron cargar los borradores.' }
  } finally {
    if (request === draftRequest) isLoadingDrafts.value = false
  }
}

/**
 * función para abrir un borrador y mostrar su detalle en el modal.
 * @version 1.0
 * @author Agustin
 * @param row 
 */
async function openDraft(row) {
  const request = ++detailRequest
  const companyId = activeCompany.value.id
  entry.value = null
  detailError.value = ''
  actionError.value = ''
  pendingAction.value = null
  detailVisible.value = true
  loadingDetail.value = true
  try {
    const result = await getJournalEntryDraft(companyId, row.id)
    if (request === detailRequest && activeCompany.value?.id === companyId) entry.value = result
  } catch (error) {
    if (request === detailRequest && !handleUnauthorized(error)) detailError.value = error.status === 404 ? 'El borrador ya no está disponible.' : 'No se pudo cargar el borrador.'
  } finally {
    if (request === detailRequest) loadingDetail.value = false
  }
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
 * @version 1.1
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
    if (activeCompany.value?.id !== companyId) return
    statusMessage.value = action === 'publish'
      ? `Asiento N° ${result.number} publicado correctamente.`
      : `Asiento N° ${target.number} revertido. Se creó el asiento de reversión N° ${result.number}.`
    detailVisible.value = false
    await loadEntries()
    if (action === 'publish') await loadDrafts()
  } catch (error) {
    if (activeCompany.value?.id !== companyId) return
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
