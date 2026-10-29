<template>
  <div class="invoices-page">
    <header class="invoices-header">
      <span class="invoices-header-icon" aria-hidden="true"><FileText :size="24" /></span>
      <div><h1>Comprobantes</h1><p>Consultá las facturas y notas de crédito de la compañía activa.</p></div>
    </header>

    <section class="invoices-card" aria-labelledby="invoices-title">
      <h2 id="invoices-title">Historial de comprobantes</h2>
      <p v-if="!activeCompany" class="invoices-state">Seleccioná una compañía para ver sus facturas.</p>
      <template v-else>
        <form class="invoices-filters" @submit.prevent="loadInvoices">
          <label>Comprobante<Select v-model="documentKind" :options="documentKinds" option-label="label" option-value="value" /></label>
          <label v-if="documentKind === 'invoice'">Receptor<InputText v-model="filters.receiver" placeholder="Nombre o documento" /></label>
          <label v-if="documentKind === 'invoice'">Número<InputText v-model="filters.number" placeholder="00001-00000015" /></label>
          <label>Estado<Select v-model="filters.status" :options="statuses" option-label="label" option-value="value" placeholder="Todos" show-clear /></label>
          <label>Tipo<Select v-model="filters.invoice_type" :options="documentKind === 'invoice' ? invoiceTypes : creditNoteTypes" option-label="label" option-value="value" placeholder="Todos" show-clear /></label>
          <label v-if="documentKind === 'invoice'">Punto de venta<Select v-model="filters.point_of_sale" :options="pointsOfSale" option-label="number" option-value="id" placeholder="Todos" show-clear :disabled="loadingPoints || !!pointsError" /></label>
          <label>Desde<input v-model="filters.issue_date_from" type="date" /></label>
          <label>Hasta<input v-model="filters.issue_date_to" type="date" /></label>
          <div class="invoices-actions"><Button type="submit" label="Buscar"><Search :size="16" aria-hidden="true" /> Buscar</Button><Button type="button" label="Limpiar" severity="secondary" outlined @click="clearFilters" /></div>
        </form>
        <p v-if="pointsError && documentKind === 'invoice'" class="invoices-error" role="alert">{{ pointsError }} <button type="button" class="invoices-retry" @click="loadPoints">Reintentar</button></p>
        <p v-if="documentKind === 'credit'" class="invoices-state">Los filtros de notas de crédito se aplican localmente.</p>
        <p v-if="loadingInvoices" class="invoices-state" role="status">Cargando comprobantes...</p>
        <p v-else-if="listError" class="invoices-error" role="alert">{{ listError }}</p>
        <p v-else-if="filtersChanged" class="invoices-state">Seleccioná Buscar para aplicar los filtros.</p>
        <DataTable v-else :value="invoices" data-key="id" paginator :rows="10" :rows-per-page-options="[10, 25, 50]" scrollable>
          <template #empty>No se encontraron comprobantes.</template>
          <Column header="Tipo"><template #body="{ data }">{{ documentKind === 'invoice' ? data.invoice_type_display : creditTypeLabels[data.credit_note_type] }}</template></Column>
          <Column header="Número"><template #body="{ data }">{{ documentKind === 'invoice' ? (data.formatted_number ?? 'Sin número') : (data.number ?? 'Sin número') }}</template></Column>
          <Column v-if="documentKind === 'credit'" header="Punto de venta"><template #body="{ data }">{{ pointNumber(data.point_of_sale) }}</template></Column>
          <Column header="Fecha de emisión"><template #body="{ data }">{{ formatDate(data.issue_date) }}</template></Column>
          <Column header="Receptor"><template #body="{ data }">{{ data.receiver_name ?? '—' }}</template></Column>
          <Column header="Estado"><template #body="{ data }"><Tag :severity="statusSeverity[data.status]" :value="statusLabels[data.status]" /></template></Column>
          <Column header="Total"><template #body="{ data }">{{ data.total }}</template></Column>
          <Column header="Detalle"><template #body="{ data }"><Button type="button" size="small" severity="secondary" outlined @click="openInvoice(data.id)"><Eye :size="16" aria-hidden="true" /> Ver</Button></template></Column>
        </DataTable>
      </template>
    </section>

    <Dialog v-model:visible="detailVisible" modal :header="documentKind === 'invoice' ? 'Detalle de factura' : 'Detalle de nota de crédito'" :style="{ width: 'min(900px, 95vw)' }" @hide="closeDetail">
      <p v-if="loadingDetail" class="invoices-state" role="status">Cargando detalle...</p>
      <p v-else-if="detailError" class="invoices-error" role="alert">{{ detailError }}</p>
      <div v-else-if="invoice && documentKind === 'invoice'" class="invoice-detail">
        <h3>{{ invoice.invoice_type_display }} · {{ invoice.formatted_number ?? 'Sin número' }}</h3>
        <dl class="invoice-detail-grid">
          <div><dt>Estado</dt><dd><Tag :severity="statusSeverity[invoice.status]" :value="statusLabels[invoice.status]" /></dd></div>
          <div><dt>Punto de venta</dt><dd>{{ invoice.point_of_sale_number }}</dd></div>
          <div><dt>Fecha de emisión</dt><dd>{{ formatDate(invoice.issue_date) }}</dd></div>
          <div><dt>Concepto</dt><dd>{{ invoice.concept_display }}</dd></div>
          <div><dt>Servicio desde</dt><dd>{{ formatDate(invoice.service_date_from) }}</dd></div>
          <div><dt>Servicio hasta</dt><dd>{{ formatDate(invoice.service_date_to) }}</dd></div>
          <div><dt>Vencimiento</dt><dd>{{ formatDate(invoice.due_date) }}</dd></div>
        </dl>
        <h3>Receptor</h3>
        <dl class="invoice-detail-grid">
          <div><dt>Nombre</dt><dd>{{ invoice.receiver_name }}</dd></div>
          <div><dt>Documento</dt><dd>{{ documentLabels[invoice.receiver_document_type] }} {{ invoice.receiver_document_number }}</dd></div>
          <div><dt>Condición IVA</dt><dd>{{ vatConditions[invoice.receiver_vat_condition] }}</dd></div>
          <div><dt>Domicilio</dt><dd>{{ invoice.receiver_address }}</dd></div>
        </dl>
        <h3>Emisor</h3>
        <dl class="invoice-detail-grid">
          <div><dt>Razón social</dt><dd>{{ invoice.issuer_legal_name ?? '—' }}</dd></div>
          <div><dt>CUIT</dt><dd>{{ invoice.issuer_tax_id ?? '—' }}</dd></div>
          <div><dt>Domicilio</dt><dd>{{ invoice.issuer_address ?? '—' }}</dd></div>
          <div><dt>Condición IVA</dt><dd>{{ invoice.issuer_vat_condition === null ? '—' : vatConditions[invoice.issuer_vat_condition] }}</dd></div>
          <div><dt>Ingresos brutos</dt><dd>{{ invoice.issuer_gross_income || '—' }}</dd></div>
          <div><dt>Inicio de actividad</dt><dd>{{ formatDate(invoice.issuer_activity_start_date) }}</dd></div>
        </dl>
        <h3>Ítems</h3>
        <DataTable :value="invoice.items" scrollable>
          <template #empty>Sin ítems.</template>
          <Column field="description" header="Descripción" /><Column field="quantity" header="Cantidad" /><Column field="unit_price" header="Precio unitario" /><Column field="discount" header="Descuento (%)" />
          <Column header="Tratamiento"><template #body="{ data }">{{ treatments[data.tax_treatment] }}</template></Column>
          <Column header="IVA"><template #body="{ data }">{{ data.vat_rate === null ? '—' : vatRates[data.vat_rate] }}</template></Column>
        </DataTable>
        <h3>Tributos</h3>
        <DataTable :value="invoice.taxes" scrollable>
          <template #empty>Sin tributos.</template>
          <Column header="Tipo"><template #body="{ data }">{{ data.tax_type === 'vat' ? 'IVA' : data.tax_type }}</template></Column>
          <Column header="Alícuota"><template #body="{ data }">{{ data.vat_rate === null ? '—' : vatRates[data.vat_rate] }}</template></Column>
          <Column field="base_amount" header="Base" /><Column field="amount" header="Importe" />
        </DataTable>
        <h3>Importes</h3>
        <dl class="invoice-detail-grid">
          <div><dt>Neto gravado</dt><dd>{{ invoice.net_taxed }}</dd></div><div><dt>Neto no gravado</dt><dd>{{ invoice.net_untaxed }}</dd></div>
          <div><dt>Exento</dt><dd>{{ invoice.net_exempt }}</dd></div><div><dt>IVA</dt><dd>{{ invoice.vat_amount }}</dd></div><div><dt>Total</dt><dd>{{ invoice.total }}</dd></div>
        </dl>
      </div>
      <div v-else-if="invoice" class="invoice-detail">
        <h3>{{ creditTypeLabels[invoice.credit_note_type] }} · {{ invoice.number ?? 'Sin número' }}</h3>
        <dl class="invoice-detail-grid">
          <div><dt>Estado</dt><dd><Tag :severity="statusSeverity[invoice.status]" :value="statusLabels[invoice.status]" /></dd></div>
          <div><dt>Punto de venta</dt><dd>{{ pointNumber(invoice.point_of_sale) }}</dd></div>
          <div><dt>Fecha de emisión</dt><dd>{{ formatDate(invoice.issue_date) }}</dd></div>
          <div><dt>Receptor</dt><dd>{{ invoice.receiver_name ?? '—' }}</dd></div>
          <div><dt>Documento</dt><dd>{{ invoice.receiver_document_type === null ? '—' : documentLabels[invoice.receiver_document_type] + ' ' + invoice.receiver_document_number }}</dd></div>
          <div><dt>Condición IVA</dt><dd>{{ invoice.receiver_vat_condition === null ? '—' : vatConditions[invoice.receiver_vat_condition] }}</dd></div>
          <div><dt>Domicilio receptor</dt><dd>{{ invoice.receiver_address ?? '—' }}</dd></div>
          <div><dt>Emisor</dt><dd>{{ invoice.issuer_legal_name ?? '—' }}</dd></div>
          <div><dt>CUIT emisor</dt><dd>{{ invoice.issuer_tax_id ?? '—' }}</dd></div>
          <div><dt>Domicilio emisor</dt><dd>{{ invoice.issuer_address ?? '—' }}</dd></div>
          <div><dt>Condición IVA emisor</dt><dd>{{ invoice.issuer_vat_condition === null ? '—' : vatConditions[invoice.issuer_vat_condition] }}</dd></div>
          <div><dt>Ingresos brutos</dt><dd>{{ invoice.issuer_gross_income || '—' }}</dd></div>
          <div><dt>Inicio de actividad</dt><dd>{{ formatDate(invoice.issuer_activity_start_date) }}</dd></div>
        </dl>
        <h3>Facturas asociadas</h3>
        <DataTable :value="invoice.credit_note_invoices" scrollable><template #empty>Sin facturas asociadas.</template><Column field="invoice" header="ID de factura" /><Column field="total" header="Total acreditado" /></DataTable>
        <h3>Ítems</h3>
        <DataTable :value="creditItems" scrollable><template #empty>Sin ítems.</template><Column field="credit_note_invoice" header="ID de asociación" /><Column field="description" header="Descripción" /><Column field="quantity" header="Cantidad" /><Column field="unit_price" header="Precio unitario" /><Column field="discount" header="Descuento (%)" /><Column header="Tratamiento"><template #body="{ data }">{{ treatments[data.tax_treatment] }}</template></Column><Column header="IVA"><template #body="{ data }">{{ data.vat_rate === null ? '—' : vatRates[data.vat_rate] }}</template></Column></DataTable>
        <h3>Importes</h3><dl class="invoice-detail-grid"><div><dt>Neto gravado</dt><dd>{{ invoice.net_taxed }}</dd></div><div><dt>Neto no gravado</dt><dd>{{ invoice.net_untaxed }}</dd></div><div><dt>Exento</dt><dd>{{ invoice.net_exempt }}</dd></div><div><dt>IVA</dt><dd>{{ invoice.vat_amount }}</dd></div><div><dt>Total</dt><dd>{{ invoice.total }}</dd></div></dl>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, FileText, Search } from '@lucide/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { getCreditNote, getCreditNoteItems, getCreditNotes, getInvoice, getInvoices, getPointsOfSale } from '../../services/billing.service'
import { clearSession } from '../../services/session.service'
import { activeCompany } from '../../stores/company.store'
import '../../assets/css/InvoicesPage.css'

const statuses = [{ label: 'Borrador', value: 'draft' }, { label: 'Emitida', value: 'issued' }, { label: 'Cancelada', value: 'cancelled' }]
const statusLabels = { draft: 'Borrador', issued: 'Emitida', cancelled: 'Cancelada' }
const statusSeverity = { draft: 'secondary', issued: 'success', cancelled: 'danger' }
const invoiceTypes = [{ label: 'Factura A', value: 1 }, { label: 'Factura B', value: 6 }, { label: 'Factura C', value: 11 }]
const creditNoteTypes = [{ label: 'Nota de crédito A', value: 3 }, { label: 'Nota de crédito B', value: 8 }, { label: 'Nota de crédito C', value: 13 }]
const creditTypeLabels = { 3: 'Nota de crédito A', 8: 'Nota de crédito B', 13: 'Nota de crédito C' }
const documentKinds = [{ label: 'Facturas', value: 'invoice' }, { label: 'Notas de crédito', value: 'credit' }]
const documentKind = ref('invoice')
const documentLabels = { 80: 'CUIT', 86: 'CUIL', 87: 'CDI', 96: 'DNI' }
const vatConditions = { 1: 'IVA Responsable Inscripto', 4: 'IVA Sujeto Exento', 5: 'Consumidor Final', 6: 'Responsable Monotributo', 13: 'Monotributista Social', 15: 'IVA No Alcanzado', 16: 'Monotributo Trabajador Independiente Promovido' }
const vatRates = { 3: '0%', 9: '2,5%', 8: '5%', 4: '10,5%', 5: '21%', 6: '27%' }
const treatments = { taxed: 'Gravado', exempt: 'Exento', untaxed: 'No gravado', not_discriminated: 'No discriminado' }
const emptyFilters = () => ({ receiver: '', number: '', status: null, invoice_type: null, point_of_sale: null, issue_date_from: '', issue_date_to: '' })
const filters = reactive(emptyFilters())
const router = useRouter()
const invoices = ref([])
const pointsOfSale = ref([])
const invoice = ref(null)
const creditItems = ref([])
const loadingInvoices = ref(false)
const loadingPoints = ref(false)
const loadingDetail = ref(false)
const listError = ref('')
const pointsError = ref('')
const detailError = ref('')
const detailVisible = ref(false)
const filtersChanged = ref(false)
let listRequest = 0
let pointsRequest = 0
let detailRequest = 0

watch(filters, () => {
  listRequest++
  invoices.value = []
  listError.value = ''
  loadingInvoices.value = false
  filtersChanged.value = true
}, { deep: true, flush: 'sync' })

watch(documentKind, () => {
  Object.assign(filters, emptyFilters())
  detailVisible.value = false
  closeDetail()
  loadInvoices()
}, { flush: 'sync' })

watch(activeCompany, () => {
  Object.assign(filters, emptyFilters())
  detailVisible.value = false
  closeDetail()
  loadInvoices()
  loadPoints()
}, { immediate: true, flush: 'sync' })

onBeforeUnmount(() => { listRequest++; pointsRequest++; detailRequest++ })

function handleUnauthorized(error) {
  if (error.status !== 401 || error.code !== 'NEX-USR-010') return false
  clearSession()
  router.push('/login')
  return true
}

async function loadInvoices() {
  const request = ++listRequest
  invoices.value = []
  listError.value = ''
  filtersChanged.value = false
  if (!activeCompany.value) { loadingInvoices.value = false; return }
  loadingInvoices.value = true
  try {
    const kind = documentKind.value
    const result = kind === 'invoice' ? await getInvoices(activeCompany.value.id, { ...filters, receiver: filters.receiver.trim(), number: filters.number.trim() }) : await getCreditNotes(activeCompany.value.id)
    if (request === listRequest) invoices.value = kind === 'invoice' ? result : result.filter(note => (!filters.status || note.status === filters.status) && (!filters.invoice_type || note.credit_note_type === filters.invoice_type) && (!filters.issue_date_from || (note.issue_date && note.issue_date >= filters.issue_date_from)) && (!filters.issue_date_to || (note.issue_date && note.issue_date <= filters.issue_date_to)))
  } catch (error) {
    if (request === listRequest && !handleUnauthorized(error)) {
      listError.value = requestError(error, 'No se pudieron cargar las facturas. Intentá nuevamente.')
    }
  } finally {
    if (request === listRequest) loadingInvoices.value = false
  }
}

async function loadPoints() {
  const request = ++pointsRequest
  pointsOfSale.value = []
  pointsError.value = ''
  if (!activeCompany.value) { loadingPoints.value = false; return }
  loadingPoints.value = true
  try {
    const result = await getPointsOfSale(activeCompany.value.id)
    if (request === pointsRequest) pointsOfSale.value = result
  } catch (error) {
    if (request === pointsRequest && !handleUnauthorized(error)) pointsError.value = requestError(error, 'No se pudieron cargar los puntos de venta. Intentá nuevamente.')
  } finally {
    if (request === pointsRequest) loadingPoints.value = false
  }
}

function clearFilters() {
  Object.assign(filters, emptyFilters())
  loadInvoices()
}

async function openInvoice(id) {
  const request = ++detailRequest
  invoice.value = null
  detailError.value = ''
  detailVisible.value = true
  loadingDetail.value = true
  try {
    const companyId = activeCompany.value.id
    const [result, items] = documentKind.value === 'invoice' ? [await getInvoice(companyId, id), []] : await Promise.all([getCreditNote(companyId, id), getCreditNoteItems(companyId, id)])
    if (request === detailRequest) { invoice.value = result; creditItems.value = items }
  } catch (error) {
    if (request === detailRequest && !handleUnauthorized(error)) detailError.value = requestError(error, 'No se pudo cargar el detalle. Intentá nuevamente.')
  } finally {
    if (request === detailRequest) loadingDetail.value = false
  }
}

function closeDetail() {
  detailRequest++
  invoice.value = null
  creditItems.value = []
  loadingDetail.value = false
  detailError.value = ''
}

function pointNumber(id) {
  const point = pointsOfSale.value.find(point => point.id === id)
  return point ? point.number : `ID ${id}`
}

function requestError(error, fallback) {
  if (error.status === 400) return 'Revisá los filtros ingresados e intentá nuevamente.'
  if (error.status === 403) return 'No tenés permiso para consultar los datos de esta compañía.'
  if (error.status === 404 && error.message === 'No FiscalProfile matches the given query.') return 'La compañía necesita un perfil fiscal para consultar sus comprobantes.'
  if (error.status === 404) return 'No se encontró el recurso solicitado.'
  return fallback
}

function formatDate(value) {
  if (value === null) return '—'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}
</script>
