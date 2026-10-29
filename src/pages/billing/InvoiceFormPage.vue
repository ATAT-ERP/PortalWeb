<template>
  <div class="invoice-form-page">
    <header class="invoice-form-header"><span aria-hidden="true"><FileText :size="24" /></span><div><h1>Facturas</h1><p>Creá y emití facturas internas para la compañía activa.</p></div></header>
    <section class="invoice-form-card">
      <p v-if="!activeCompany" class="invoice-form-state">Seleccioná una compañía para trabajar con facturas.</p>
      <p v-else-if="loading" class="invoice-form-state" role="status">Cargando datos de facturación...</p>
      <div v-else-if="loadError" class="invoice-form-error" role="alert"><p>{{ loadError }}</p><RouterLink v-if="missingProfile" to="/billing/fiscal-profile">Configurar perfil fiscal</RouterLink><Button v-else label="Reintentar" severity="secondary" outlined @click="loadInitial" /></div>
      <template v-else>
        <div class="invoice-form-toolbar">
          <label for="draft-select">Retomar borrador</label>
          <Select input-id="draft-select" :model-value="null" :options="drafts" option-label="label" option-value="id" placeholder="Seleccioná un borrador" :disabled="busy || uncertain" @update:model-value="resumeDraft" />
          <Button label="Nueva factura" severity="secondary" outlined :disabled="busy || uncertain" @click="newInvoice" />
        </div>
        <p v-if="!activePoints.length" class="invoice-form-state">No hay puntos de venta activos. <RouterLink to="/billing/points-of-sale">Administrar puntos de venta</RouterLink></p>
        <p v-if="notice" class="invoice-form-notice" role="status">{{ notice }}</p>
        <p v-if="errorMessage" class="invoice-form-error" role="alert">{{ errorMessage }}</p>
        <div v-if="uncertain" class="invoice-form-warning" role="alert">
          {{ uncertainMessage }}
          <Button v-if="invoice" label="Comprobar estado" severity="secondary" outlined :disabled="busy" @click="checkInvoice" />
          <RouterLink to="/billing/invoices">Consultar comprobantes</RouterLink>
        </div>
        <template v-if="invoice && invoice.status !== 'draft'">
          <h2>Factura {{ invoice.formatted_number ?? '' }}</h2>
          <p>Estado: {{ invoice.status === 'issued' ? 'Emitida' : 'Cancelada' }}. Fecha de emisión: {{ invoice.issue_date ?? '—' }}.</p>
          <p>Neto gravado: {{ invoice.net_taxed }} · Neto no gravado: {{ invoice.net_untaxed }} · Exento: {{ invoice.net_exempt }} · IVA: {{ invoice.vat_amount }} · Total: {{ invoice.total }}</p>
          <p v-for="tax in invoice.taxes" :key="tax.id">IVA {{ tax.vat_rate === null ? '—' : rateLabels[tax.vat_rate] }} · Base: {{ tax.base_amount }} · Importe: {{ tax.amount }}</p>
          <RouterLink to="/billing/invoices">Consultar comprobantes</RouterLink>
        </template>
        <template v-else>
          <form @submit.prevent="saveHeader" novalidate>
            <h2>Datos de la factura</h2>
            <p v-if="invoice" class="invoice-form-state">Borrador #{{ invoice.id }} · Los totales se calculan al emitir.</p>
            <div class="invoice-form-grid">
              <div v-for="field in headerFields" :key="field.key" class="invoice-form-field">
                <label :for="field.key">{{ field.label }}{{ field.required ? ' *' : '' }}</label>
                <Select v-if="field.options" :input-id="field.key" v-model="form[field.key]" :options="field.options === 'points' ? activePoints : field.options" option-label="label" option-value="value" placeholder="Seleccioná" :disabled="busy || uncertain" :invalid="!!errors[field.key]" />
                <InputText v-else :id="field.key" v-model="form[field.key]" :type="field.type || 'text'" :maxlength="field.maxlength" :disabled="busy || uncertain" :invalid="!!errors[field.key]" />
                <small v-if="errors[field.key]" class="invoice-form-error">{{ errors[field.key] }}</small>
              </div>
            </div>
            <div class="invoice-form-actions"><Button type="submit" :disabled="busy || uncertain || itemOpen || !activePoints.length" :loading="busy" label="Guardar borrador" /></div>
          </form>
          <section class="invoice-form-items">
            <h2>Ítems</h2>
            <p v-if="!invoice" class="invoice-form-state">Guardá la cabecera del borrador para agregar ítems.</p>
            <template v-else>
              <DataTable :value="invoice.items" data-key="id" scrollable>
                <template #empty>El borrador todavía no tiene ítems.</template>
                <Column field="description" header="Descripción" /><Column field="quantity" header="Cantidad" /><Column field="unit_price" header="Precio unitario" /><Column field="discount" header="Descuento (%)" />
                <Column header="Tratamiento"><template #body="{ data }">{{ treatmentLabels[data.tax_treatment] }}</template></Column>
                <Column header="IVA"><template #body="{ data }">{{ data.vat_rate === null ? '—' : rateLabels[data.vat_rate] }}</template></Column>
                <Column header="Acciones"><template #body="{ data }"><div class="invoice-form-actions"><Button type="button" label="Editar" size="small" severity="secondary" outlined :disabled="busy || uncertain" @click="editItem(data)" /><Button type="button" label="Quitar" size="small" severity="danger" outlined :disabled="busy || uncertain" @click="removeItem(data)" /></div></template></Column>
              </DataTable>
              <Button v-if="!itemOpen" class="invoice-form-add" type="button" label="Agregar ítem" severity="secondary" outlined :disabled="busy || uncertain" @click="addItem" />
              <form v-else class="invoice-item-form" @submit.prevent="saveItem" novalidate>
                <h3>{{ itemId === null ? 'Nuevo ítem' : 'Editar ítem' }}</h3>
                <div class="invoice-form-grid">
                  <div v-for="field in itemFields" :key="field.key" class="invoice-form-field">
                    <label :for="`item-${field.key}`">{{ field.label }}{{ field.required ? ' *' : '' }}</label>
                    <Select v-if="field.options" :input-id="`item-${field.key}`" v-model="item[field.key]" :options="field.options" option-label="label" option-value="value" placeholder="Seleccioná" :show-clear="field.key === 'vat_rate'" :disabled="busy || uncertain" :invalid="!!itemErrors[field.key]" />
                    <InputText v-else :id="`item-${field.key}`" v-model="item[field.key]" :maxlength="field.maxlength" :inputmode="field.key === 'description' ? undefined : 'decimal'" :disabled="busy || uncertain" :invalid="!!itemErrors[field.key]" />
                    <small v-if="itemErrors[field.key]" class="invoice-form-error">{{ itemErrors[field.key] }}</small>
                  </div>
                </div>
                <div class="invoice-form-actions"><Button type="submit" label="Guardar ítem" :disabled="busy || uncertain" /><Button type="button" label="Cancelar" severity="secondary" outlined :disabled="busy" @click="itemOpen = false" /></div>
              </form>
              <p class="invoice-form-state">Los importes del borrador son los guardados por el backend; se calculan al emitir. Total actual: {{ invoice.total }}.</p>
              <div class="invoice-form-actions"><Button type="button" label="Emitir factura" :disabled="busy || uncertain || itemOpen || headerDirty || !invoice.items.length || !activePoints.some(point => point.value === form.point_of_sale)" @click="confirmIssue = true" /><RouterLink to="/billing/invoices">Ver comprobantes</RouterLink></div>
            </template>
          </section>
        </template>
      </template>
    </section>
    <Dialog v-model:visible="confirmIssue" modal header="Confirmar emisión" :style="{ width: 'min(480px, 95vw)' }">
      <p>Se realizará una emisión interna dentro del ERP. El backend asignará el número y calculará los importes.</p>
      <div class="invoice-form-actions"><Button label="Confirmar emisión" :disabled="busy" :loading="busy" @click="emitInvoice" /><Button label="Cancelar" severity="secondary" outlined :disabled="busy" @click="confirmIssue = false" /></div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, RouterLink, useRouter } from 'vue-router'
import { FileText } from '@lucide/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { createInvoice, createInvoiceItem, deleteInvoiceItem, getInvoice, getInvoices, getPointsOfSale, issueInvoice, updateInvoice, updateInvoiceItem } from '../../services/billing.service'
import { clearSession } from '../../services/session.service'
import { activeCompany, selectCompany } from '../../stores/company.store'
import '../../assets/css/InvoiceFormPage.css'

const options = entries => entries.map(([value, label]) => ({ value, label }))
const vatConditions = options([[1, 'IVA Responsable Inscripto'], [4, 'IVA Sujeto Exento'], [5, 'Consumidor Final'], [6, 'Responsable Monotributo'], [13, 'Monotributista Social'], [15, 'IVA No Alcanzado'], [16, 'Monotributo Trabajador Independiente Promovido']])
const treatments = options([['taxed', 'Gravado'], ['exempt', 'Exento'], ['untaxed', 'No gravado'], ['not_discriminated', 'No discriminado']])
const rates = options([[3, '0%'], [9, '2,5%'], [8, '5%'], [4, '10,5%'], [5, '21%'], [6, '27%']])
const treatmentLabels = Object.fromEntries(treatments.map(option => [option.value, option.label]))
const rateLabels = Object.fromEntries(rates.map(option => [option.value, option.label]))
const headerFields = [
  { key: 'point_of_sale', label: 'Punto de venta', required: true, options: 'points' },
  { key: 'invoice_type', label: 'Tipo de factura', required: true, options: options([[1, 'Factura A'], [6, 'Factura B'], [11, 'Factura C']]) },
  { key: 'concept', label: 'Concepto', required: true, options: options([[1, 'Productos'], [2, 'Servicios'], [3, 'Productos y Servicios']]) },
  { key: 'service_date_from', label: 'Servicio desde', type: 'date' }, { key: 'service_date_to', label: 'Servicio hasta', type: 'date' }, { key: 'due_date', label: 'Vencimiento', type: 'date' },
  { key: 'receiver_name', label: 'Nombre o razón social del receptor', required: true, maxlength: 255 },
  { key: 'receiver_vat_condition', label: 'Condición IVA del receptor', required: true, options: vatConditions },
  { key: 'receiver_document_type', label: 'Tipo de documento', required: true, options: options([[80, 'CUIT'], [86, 'CUIL'], [87, 'CDI'], [96, 'DNI']]) },
  { key: 'receiver_document_number', label: 'Número de documento', required: true, maxlength: 20 },
  { key: 'receiver_address', label: 'Domicilio del receptor', required: true, maxlength: 255 }
]
const itemFields = [
  { key: 'description', label: 'Descripción', required: true, maxlength: 255 }, { key: 'quantity', label: 'Cantidad', required: true },
  { key: 'unit_price', label: 'Precio unitario', required: true }, { key: 'discount', label: 'Descuento (%)' },
  { key: 'tax_treatment', label: 'Tratamiento fiscal', required: true, options: treatments }, { key: 'vat_rate', label: 'Alícuota IVA', options: rates }
]
const emptyHeader = () => ({ point_of_sale: null, invoice_type: null, concept: null, service_date_from: '', service_date_to: '', due_date: '', receiver_name: '', receiver_vat_condition: null, receiver_document_type: null, receiver_document_number: '', receiver_address: '' })
const emptyItem = () => ({ description: '', quantity: '', unit_price: '', discount: '0.00', tax_treatment: null, vat_rate: null })
const form = reactive(emptyHeader())
const item = reactive(emptyItem())
const errors = ref({})
const itemErrors = ref({})
const router = useRouter()
const points = ref([])
const drafts = ref([])
const invoice = ref(null)
const itemId = ref(null)
const itemOpen = ref(false)
const loading = ref(false)
const busy = ref(false)
const loadError = ref('')
const missingProfile = ref(false)
const errorMessage = ref('')
const notice = ref('')
const uncertain = ref(false)
const uncertainMessage = ref('')
const confirmIssue = ref(false)
const savedHeader = ref(JSON.stringify(emptyHeader()))
const activePoints = computed(() => points.value.filter(point => point.is_active).map(point => ({ value: point.id, label: point.number })))
const headerDirty = computed(() => JSON.stringify(form) !== savedHeader.value)
const hasUnsaved = computed(() => headerDirty.value || itemOpen.value || busy.value)
let generation = 0
let restoringCompany = false

function allowDiscard() {
  return !hasUnsaved.value || window.confirm('Hay cambios sin guardar o una operación en curso. ¿Querés continuar?')
}
function beforeUnload(event) { if (hasUnsaved.value) { event.preventDefault(); event.returnValue = '' } }
window.addEventListener('beforeunload', beforeUnload)
onBeforeRouteLeave(() => allowDiscard())
onBeforeUnmount(() => { generation++; window.removeEventListener('beforeunload', beforeUnload) })

watch(activeCompany, (company, previous) => {
  if (restoringCompany) return
  if (previous && !allowDiscard()) {
    restoringCompany = true
    selectCompany(previous)
    restoringCompany = false
    return
  }
  generation++
  reset()
  loadInitial()
}, { immediate: true, flush: 'sync' })

function reset() {
  Object.assign(form, emptyHeader())
  savedHeader.value = JSON.stringify(form)
  points.value = []; drafts.value = []; invoice.value = null; itemOpen.value = false
  errors.value = {}; itemErrors.value = {}; errorMessage.value = ''; notice.value = ''
  uncertain.value = false; uncertainMessage.value = ''; confirmIssue.value = false
}

function unauthorized(error) {
  if (error.status !== 401 || error.code !== 'NEX-USR-010') return false
  clearSession(); router.push('/login'); return true
}

async function loadInitial() {
  const version = ++generation
  loadError.value = ''; missingProfile.value = false
  if (!activeCompany.value) { loading.value = false; return }
  loading.value = true
  try {
    const companyId = activeCompany.value.id
    const [pointResult, draftResult] = await Promise.all([getPointsOfSale(companyId), getInvoices(companyId, { status: 'draft' })])
    if (version !== generation) return
    points.value = pointResult
    drafts.value = draftResult.map(draft => ({ id: draft.id, label: `#${draft.id} · ${draft.invoice_type_display} · ${draft.receiver_name}` }))
  } catch (error) {
    if (version !== generation || unauthorized(error)) return
    if (error.status === 404 && error.message === 'No FiscalProfile matches the given query.') { missingProfile.value = true; loadError.value = 'Configurá el perfil fiscal antes de crear facturas.' }
    else if (error.status === 403) loadError.value = 'No tenés permiso para consultar los datos de esta compañía.'
    else loadError.value = 'No se pudieron cargar los datos de facturación. Intentá nuevamente.'
  } finally { if (version === generation) loading.value = false }
}

function applyInvoice(result) {
  invoice.value = result
  for (const key of Object.keys(form)) form[key] = result[key] ?? (key.endsWith('_date') || key.startsWith('service_date_') ? '' : result[key])
  savedHeader.value = JSON.stringify(form)
  itemOpen.value = false; errors.value = {}; itemErrors.value = {}
}

async function resumeDraft(id) {
  if (!id || busy.value || !allowDiscard()) return
  await fetchInvoice(id)
}
async function fetchInvoice(id) {
  const version = generation
  busy.value = true; errorMessage.value = ''; notice.value = ''
  try {
    const result = await getInvoice(activeCompany.value.id, id)
    if (version !== generation) return
    applyInvoice(result); uncertain.value = false; uncertainMessage.value = ''
  } catch (error) {
    if (version === generation && !unauthorized(error)) errorMessage.value = error.status === 403 ? 'No tenés permiso para consultar esta factura.' : error.status === 404 ? 'No se encontró la factura.' : 'No se pudo consultar la factura. Intentá nuevamente.'
  } finally { busy.value = false }
}
function checkInvoice() { if (invoice.value && allowDiscard()) fetchInvoice(invoice.value.id) }
function newInvoice() { if (!allowDiscard()) return; reset(); loadInitial() }

function displayError(error, target) {
  if (unauthorized(error)) return
  if (error.status === 400) {
    target.value = error.errors || {}
    errorMessage.value = 'Revisá los datos indicados por el servidor.'
    const fields = target === errors ? headerFields : itemFields
    const other = Object.entries(target.value).filter(([key]) => !fields.some(field => field.key === key)).flatMap(([key, value]) => (Array.isArray(value) ? value : [value]).map(message => `${key}: ${message}`))
    if (other.length) errorMessage.value += ` ${other.join(' ')}`
  } else if (error.status === 403) errorMessage.value = 'No tenés permiso para realizar esta operación.'
  else if (error.status === 404) errorMessage.value = 'No se encontró la factura o la configuración fiscal.'
  else errorMessage.value = 'No se pudo completar la operación. Intentá nuevamente.'
}

async function saveHeader() {
  if (busy.value || uncertain.value || itemOpen.value || !activeCompany.value) return
  errors.value = {}; errorMessage.value = ''; notice.value = ''
  for (const field of headerFields.filter(field => field.required)) if (form[field.key] === null || !String(form[field.key]).trim()) errors.value[field.key] = 'Este campo es obligatorio.'
  if (Object.keys(errors.value).length) return
  const version = generation; const companyId = activeCompany.value.id; const creating = !invoice.value
  const payload = { ...form, service_date_from: form.service_date_from || null, service_date_to: form.service_date_to || null, due_date: form.due_date || null }
  busy.value = true
  try {
    const result = creating ? await createInvoice(companyId, payload) : await updateInvoice(companyId, invoice.value.id, payload)
    if (version !== generation) return
    applyInvoice(result); notice.value = `Borrador #${result.id} guardado correctamente.`
    if (creating) drafts.value.unshift({ id: result.id, label: `#${result.id} · ${result.invoice_type_display} · ${result.receiver_name}` })
  } catch (error) {
    if (version !== generation) return
    if (!error.status || error.status >= 500) { uncertain.value = true; uncertainMessage.value = creating ? 'No se pudo confirmar si se creó el borrador. Consultá Comprobantes antes de intentar crear otro.' : 'No se pudo confirmar si se guardó el borrador. Comprobá su estado antes de continuar.' }
    else displayError(error, errors)
  } finally { busy.value = false }
}

function addItem() { if (itemOpen.value && !allowDiscard()) return; Object.assign(item, emptyItem()); itemId.value = null; itemErrors.value = {}; itemOpen.value = true }
function editItem(data) { if (itemOpen.value && !allowDiscard()) return; for (const key of Object.keys(item)) item[key] = data[key]; itemId.value = data.id; itemErrors.value = {}; itemOpen.value = true }
async function saveItem() {
  if (busy.value || uncertain.value) return
  itemErrors.value = {}; errorMessage.value = ''; notice.value = ''
  for (const field of itemFields.filter(field => field.required)) if (item[field.key] === null || !String(item[field.key]).trim()) itemErrors.value[field.key] = 'Este campo es obligatorio.'
  if (item.quantity && (!/^\d{1,8}(\.\d{1,2})?$/.test(item.quantity) || !/[1-9]/.test(item.quantity))) itemErrors.value.quantity = 'Ingresá una cantidad positiva con hasta dos decimales.'
  if (item.unit_price && !/^\d{1,12}(\.\d{1,2})?$/.test(item.unit_price)) itemErrors.value.unit_price = 'Ingresá un precio no negativo con hasta dos decimales.'
  if (item.discount && (!/^\d{1,3}(\.\d{1,2})?$/.test(item.discount) || Number(item.discount) > 100)) itemErrors.value.discount = 'Ingresá un descuento entre 0 y 100, con hasta dos decimales.'
  if (Object.keys(itemErrors.value).length) return
  const version = generation; const companyId = activeCompany.value.id; const invoiceId = invoice.value.id; const id = itemId.value
  busy.value = true
  try {
    const payload = { ...item, discount: item.discount || '0.00' }
    const result = id === null ? await createInvoiceItem(companyId, invoiceId, payload) : await updateInvoiceItem(companyId, invoiceId, id, payload)
    if (version !== generation) return
    if (id === null) invoice.value.items.push(result)
    else invoice.value.items.splice(invoice.value.items.findIndex(entry => entry.id === id), 1, result)
    itemOpen.value = false; notice.value = 'Ítem guardado correctamente.'
  } catch (error) {
    if (version !== generation) return
    if (!error.status || error.status >= 500) { uncertain.value = true; uncertainMessage.value = 'No se pudo confirmar si se guardó el ítem. Comprobá el estado antes de continuar.' }
    else displayError(error, itemErrors)
  } finally { busy.value = false }
}
async function removeItem(entry) {
  if (busy.value || uncertain.value || !window.confirm('¿Quitar este ítem del borrador?')) return
  const version = generation; const companyId = activeCompany.value.id; const invoiceId = invoice.value.id
  busy.value = true; errorMessage.value = ''; notice.value = ''
  try {
    await deleteInvoiceItem(companyId, invoiceId, entry.id)
    if (version !== generation) return
    invoice.value.items = invoice.value.items.filter(value => value.id !== entry.id)
    if (itemId.value === entry.id) itemOpen.value = false
    notice.value = 'Ítem eliminado.'
  } catch (error) {
    if (version !== generation) return
    if (!error.status || error.status >= 500) { uncertain.value = true; uncertainMessage.value = 'No se pudo confirmar si se eliminó el ítem. Comprobá el estado antes de continuar.' }
    else displayError(error, itemErrors)
  } finally { busy.value = false }
}
async function emitInvoice() {
  if (busy.value || uncertain.value || !invoice.value || headerDirty.value || itemOpen.value) return
  const version = generation; const companyId = activeCompany.value.id; const invoiceId = invoice.value.id
  busy.value = true; errorMessage.value = ''; notice.value = ''
  try {
    const result = await issueInvoice(companyId, invoiceId)
    if (version !== generation) return
    applyInvoice(result); confirmIssue.value = false; notice.value = 'Factura emitida internamente.'
  } catch (error) {
    if (version !== generation) return
    confirmIssue.value = false
    if (!error.status || error.status >= 500) { uncertain.value = true; uncertainMessage.value = 'No se pudo confirmar la emisión. Comprobá el estado antes de volver a intentar.' }
    else displayError(error, errors)
  } finally { busy.value = false }
}
</script>
