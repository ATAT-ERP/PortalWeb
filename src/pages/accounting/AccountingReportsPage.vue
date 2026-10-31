<template>
  <div class="reports-page">
    <header class="reports-header">
      <span class="reports-header-icon" aria-hidden="true"><ChartColumn :size="24" /></span>
      <div class="reports-header-text">
        <h1>Reportes contables</h1>
        <p>Consultá el Libro Diario, el Libro Mayor y el balance de Sumas y Saldos de la compañía activa.</p>
      </div>
    </header>

    <section class="reports-card" aria-labelledby="reports-title">
      <h2 id="reports-title" class="reports-sr-only">Reporte contable</h2>

      <div v-if="!activeCompany" class="reports-empty">
        <span class="reports-empty-icon" aria-hidden="true"><Building2 :size="26" /></span>
        <p class="reports-empty-title">Seleccioná una compañía para consultar sus reportes contables.</p>
        <RouterLink to="/companies" class="reports-link">Ir a Compañías</RouterLink>
      </div>

      <template v-else>
        <form class="reports-filters" @submit.prevent="loadReport">
          <div class="reports-filter">
            <label for="reports-type">Reporte</label>
            <Select v-model="reportType" class="reports-input" input-id="reports-type" :options="reportOptions" option-label="label" option-value="value" @change="changeReport" />
          </div>
          <div v-if="reportType === 'general-ledger'" class="reports-filter">
            <label for="reports-account">Cuenta</label>
            <Select v-model="accountId" class="reports-input" input-id="reports-account" :options="accountOptions" option-label="label" option-value="value" placeholder="Seleccioná una cuenta" filter :loading="isLoadingAccounts" :disabled="isLoadingAccounts" />
          </div>
          <div class="reports-filter">
            <label for="reports-date-from">Desde</label>
            <InputText id="reports-date-from" v-model="filters.accounting_date_from" class="reports-input" type="date" />
          </div>
          <div class="reports-filter">
            <label for="reports-date-to">Hasta</label>
            <InputText id="reports-date-to" v-model="filters.accounting_date_to" class="reports-input" type="date" />
          </div>
          <div class="reports-actions">
            <Button type="submit" :disabled="isLoading">
              <Search :size="16" aria-hidden="true" /> Buscar
            </Button>
            <Button type="button" label="Limpiar" severity="secondary" outlined :disabled="isLoading" @click="clearFilters" />
          </div>
        </form>

        <div v-if="accountsError" class="reports-message reports-message-error" role="alert">
          {{ accountsError }}
          <button type="button" class="reports-retry" @click="loadAccounts">Reintentar</button>
        </div>

        <p v-if="isLoading" class="reports-state" role="status">Cargando reporte...</p>

        <div v-else-if="reportError" class="reports-message reports-message-error" role="alert">
          {{ reportError }}
          <button type="button" class="reports-retry" @click="loadReport">Reintentar</button>
        </div>

        <p v-else-if="reportType === 'general-ledger' && !accountId" class="reports-state">Seleccioná una cuenta y luego Buscar para consultar su Libro Mayor.</p>

        <DataTable v-else-if="reportType === 'daily-journal'" :value="dailyJournalRows" data-key="id" row-group-mode="subheader" group-rows-by="entry_number" scrollable>
          <template #empty>No hay asientos para el período seleccionado.</template>
          <template #groupheader="{ data }">
            <span class="reports-entry">Asiento N.º {{ data.entry_number }} · {{ formatDate(data.accounting_date) }} · {{ data.entry_description }}</span>
          </template>
          <Column field="entry_number" />
          <Column header="Cuenta">
            <template #body="{ data }">{{ data.account_code }} · {{ data.account_name }}</template>
          </Column>
          <Column header="Debe" header-class="reports-amount-header">
            <template #body="{ data }"><span class="reports-amount">{{ data.debit }}</span></template>
          </Column>
          <Column header="Haber" header-class="reports-amount-header">
            <template #body="{ data }"><span class="reports-amount">{{ data.credit }}</span></template>
          </Column>
        </DataTable>

        <DataTable v-else-if="reportType === 'general-ledger'" :value="rows" scrollable>
          <template #empty>La cuenta no tiene movimientos en el período seleccionado.</template>
          <Column header="Fecha">
            <template #body="{ data }">{{ formatDate(data.accounting_date) }}</template>
          </Column>
          <Column field="entry_number" header="Asiento" />
          <Column field="description" header="Concepto" />
          <Column header="Debe" header-class="reports-amount-header">
            <template #body="{ data }"><span class="reports-amount">{{ data.debit }}</span></template>
          </Column>
          <Column header="Haber" header-class="reports-amount-header">
            <template #body="{ data }"><span class="reports-amount">{{ data.credit }}</span></template>
          </Column>
          <Column header="Saldo" header-class="reports-amount-header">
            <template #body="{ data }"><span class="reports-amount">{{ data.balance }}</span></template>
          </Column>
        </DataTable>

        <DataTable v-else :value="rows" data-key="account" scrollable>
          <template #empty>No hay cuentas con movimientos en el período seleccionado.</template>
          <Column field="code" header="Código" />
          <Column field="name" header="Cuenta" />
          <Column header="Debe" header-class="reports-amount-header">
            <template #body="{ data }"><span class="reports-amount">{{ data.total_debit }}</span></template>
          </Column>
          <Column header="Haber" header-class="reports-amount-header">
            <template #body="{ data }"><span class="reports-amount">{{ data.total_credit }}</span></template>
          </Column>
          <Column header="Saldo" header-class="reports-amount-header">
            <template #body="{ data }"><span class="reports-amount">{{ data.balance }}</span></template>
          </Column>
        </DataTable>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, ChartColumn, Search } from '@lucide/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { getAccounts, getDailyJournal, getGeneralLedger, getTrialBalance } from '../../services/accounting.service'
import { clearSession } from '../../services/session.service'
import { activeCompany } from '../../stores/company.store'
import '../../assets/css/AccountingReportsPage.css'

const reportOptions = [
  { label: 'Libro Diario', value: 'daily-journal' },
  { label: 'Libro Mayor', value: 'general-ledger' },
  { label: 'Sumas y Saldos', value: 'trial-balance' }
]

const router = useRouter()
const reportType = ref('daily-journal')
const filters = reactive({ accounting_date_from: '', accounting_date_to: '' })
const accountId = ref(null)
const accounts = ref([])
const isLoadingAccounts = ref(false)
const accountsError = ref('')
const rows = ref([])
const isLoading = ref(false)
const reportError = ref('')
let reportRequest = 0
let accountsRequest = 0

// El backend ordena por código como texto; acá se ordena numéricamente (1.2 antes de 1.10).
const accountOptions = computed(() =>
  [...accounts.value]
    .sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true }))
    .map(account => ({ label: `${account.code} · ${account.name}`, value: account.id }))
)

// Cada movimiento del Libro Diario se muestra agrupado bajo los datos de su asiento.
const dailyJournalRows = computed(() =>
  rows.value.flatMap(entry => entry.lines.map(line => ({
    ...line,
    entry_number: entry.number,
    accounting_date: entry.accounting_date,
    entry_description: entry.description
  })))
)

watch(activeCompany, () => {
  accounts.value = []
  accountId.value = null
  accountsError.value = ''
  if (reportType.value === 'general-ledger') loadAccounts()
  loadReport()
}, { immediate: true })

onBeforeUnmount(() => {
  reportRequest++
  accountsRequest++
})

/**
 * Gestiona una respuesta de sesión inválida.
 * @version 1.0
 * @author Uziel
 */
function handleUnauthorized(error) {
  if (error.status !== 401 || error.code !== 'NEX-USR-010') return false
  clearSession()
  router.push('/login')
  return true
}

/**
 * Formatea una fecha para mostrarla en pantalla.
 * @version 1.0
 * @author Uziel
 */
function formatDate(value) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Cambia el reporte elegido y lo consulta con los filtros actuales.
 * @version 1.0
 * @author Uziel
 */
function changeReport() {
  if (reportType.value === 'general-ledger' && accounts.value.length === 0) loadAccounts()
  loadReport()
}

/**
 * Consulta las cuentas de la compañía activa para elegir el Libro Mayor.
 * @version 1.0
 * @author Uziel
 */
async function loadAccounts() {
  const request = ++accountsRequest
  accountsError.value = ''
  isLoadingAccounts.value = true
  try {
    const result = await getAccounts(activeCompany.value.id)
    if (request === accountsRequest) accounts.value = result
  } catch (error) {
    if (request === accountsRequest && !handleUnauthorized(error)) {
      accountsError.value = error.status === 403
        ? 'No tenés permiso para consultar las cuentas de esta compañía.'
        : 'No se pudieron cargar las cuentas. Intentá nuevamente.'
    }
  } finally {
    if (request === accountsRequest) isLoadingAccounts.value = false
  }
}

/**
 * Consulta el reporte elegido para la compañía activa con los filtros de fecha.
 * @version 1.0
 * @author Uziel
 */
async function loadReport() {
  const request = ++reportRequest
  rows.value = []
  reportError.value = ''
  if (!activeCompany.value || (reportType.value === 'general-ledger' && !accountId.value)) {
    isLoading.value = false
    return
  }
  const companyId = activeCompany.value.id
  isLoading.value = true
  try {
    let result
    if (reportType.value === 'daily-journal') result = await getDailyJournal(companyId, filters)
    else if (reportType.value === 'general-ledger') result = await getGeneralLedger(companyId, accountId.value, filters)
    else result = await getTrialBalance(companyId, filters)
    if (request === reportRequest) rows.value = result
  } catch (error) {
    if (request === reportRequest && !handleUnauthorized(error)) {
      if (error.status === 400) reportError.value = 'Revisá las fechas ingresadas e intentá nuevamente.'
      else if (error.status === 403) reportError.value = 'No tenés permiso para consultar los reportes de esta compañía.'
      else if (error.status === 404) reportError.value = 'La cuenta seleccionada ya no existe. Elegí otra cuenta.'
      else reportError.value = 'No se pudo cargar el reporte. Intentá nuevamente.'
    }
  } finally {
    if (request === reportRequest) isLoading.value = false
  }
}

/**
 * Limpia las fechas y vuelve a consultar el reporte elegido.
 * @version 1.0
 * @author Uziel
 */
function clearFilters() {
  filters.accounting_date_from = ''
  filters.accounting_date_to = ''
  loadReport()
}
</script>