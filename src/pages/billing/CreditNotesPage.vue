<template>
  <div class="credit-page">
    <header class="credit-header"><span aria-hidden="true"><FileText :size="24" /></span><div><h1>Notas de crédito</h1><p>Administrá notas de crédito internas de la compañía activa.</p></div></header>
    <section class="credit-card">
      <p v-if="!activeCompany" class="credit-state">Seleccioná una compañía para continuar.</p>
      <p v-else-if="loading" class="credit-state" role="status">Cargando datos...</p>
      <div v-else-if="loadError" class="credit-error" role="alert"><p>{{ loadError }}</p><RouterLink v-if="missingProfile" to="/billing/fiscal-profile">Configurar perfil fiscal</RouterLink><Button v-else label="Reintentar" severity="secondary" outlined @click="loadInitial" /></div>
      <template v-else>
        <div class="credit-toolbar"><label for="credit-draft">Retomar borrador</label><Select input-id="credit-draft" :model-value="null" :options="drafts" option-label="label" option-value="value" placeholder="Seleccioná un borrador" :disabled="busy || uncertain" @update:model-value="resume" /><Button label="Nueva nota" severity="secondary" outlined :disabled="busy || uncertain" @click="startNew" /></div>
        <p v-if="!activePoints.length" class="credit-state">No hay puntos de venta activos. <RouterLink to="/billing/points-of-sale">Administrar puntos de venta</RouterLink></p>
        <p v-if="notice" class="credit-state" role="status">{{ notice }}</p><p v-if="errorMessage" class="credit-error" role="alert">{{ errorMessage }}</p>
        <div v-if="uncertain" class="credit-warning" role="alert">{{ uncertainMessage }} <Button v-if="note" label="Comprobar estado" severity="secondary" outlined :disabled="busy" @click="checkState" /> <RouterLink to="/billing/invoices">Consultar comprobantes</RouterLink></div>
        <template v-if="!note">
          <h2>Crear borrador</h2><p class="credit-state">El tipo y el punto de venta no se pueden modificar después de crear la nota.</p>
          <form @submit.prevent="createDraft"><div class="credit-grid">
            <label class="credit-field" for="credit-type">Tipo de nota *<Select input-id="credit-type" v-model="noteType" :options="types" option-label="label" option-value="value" placeholder="Seleccioná" :disabled="busy || uncertain" /></label>
            <label class="credit-field" for="credit-point">Punto de venta *<Select input-id="credit-point" v-model="pointId" :options="activePoints" option-label="number" option-value="id" placeholder="Seleccioná" :disabled="busy || uncertain" /></label>
          </div><Button class="credit-action" type="submit" label="Guardar borrador" :disabled="busy || uncertain || !activePoints.length" :loading="busy" /></form>
        </template>
        <template v-else>
          <h2>{{ typeLabels[note.credit_note_type] }} · {{ note.number ?? `Borrador #${note.id}` }}</h2>
          <p>Estado: {{ note.status === 'draft' ? 'Borrador' : 'Emitida' }} · Punto de venta: {{ pointLabel(note.point_of_sale) }} · Fecha: {{ note.issue_date ?? '—' }}</p>
          <p>Receptor: {{ note.receiver_name ?? 'Se asignará al emitir' }}<template v-if="note.receiver_document_number"> · Documento: {{ note.receiver_document_number }}</template></p>
          <p class="credit-state">Neto gravado: {{ note.net_taxed }} · Neto no gravado: {{ note.net_untaxed }} · Exento: {{ note.net_exempt }} · IVA: {{ note.vat_amount }} · Total: {{ note.total }}</p>
          <p v-if="note.status === 'draft'" class="credit-state">Los importes se calculan al emitir; los ítems se cargan manualmente para cada factura asociada.</p>
          <h3>Facturas asociadas</h3>
          <DataTable :value="note.credit_note_invoices" data-key="id" scrollable>
            <template #empty>No hay facturas asociadas.</template>
            <Column header="Factura"><template #body="{ data }">{{ invoiceLabel(data.invoice) }}</template></Column><Column field="total" header="Total acreditado" />
            <Column v-if="note.status === 'draft'" header="Acciones"><template #body="{ data }"><Button size="small" label="Desasociar" severity="danger" outlined :disabled="busy || uncertain" @click="removeAssociation(data)" /></template></Column>
          </DataTable>
          <template v-if="note.status === 'draft'">
            <div class="credit-toolbar credit-action"><label for="credit-invoice">Factura para asociar</label><Select input-id="credit-invoice" v-model="selectedInvoice" :options="eligibleInvoices" option-label="label" option-value="value" placeholder="Seleccioná una factura" :disabled="busy || uncertain" /><Button label="Asociar" :disabled="busy || uncertain || selectedInvoice === null" @click="associate" /></div>
            <p v-if="!eligibleInvoices.length" class="credit-state">No hay facturas emitidas disponibles para asociar a esta nota.</p>
          </template>
          <h3>Ítems</h3>
          <DataTable :value="items" data-key="id" scrollable>
            <template #empty>No hay ítems.</template><Column header="Factura"><template #body="{ data }">{{ associationLabel(data.credit_note_invoice) }}</template></Column><Column field="description" header="Descripción" /><Column field="quantity" header="Cantidad" /><Column field="unit_price" header="Precio unitario" /><Column field="discount" header="Descuento (%)" /><Column header="Tratamiento"><template #body="{ data }">{{ treatmentLabels[data.tax_treatment] }}</template></Column><Column header="IVA"><template #body="{ data }">{{ data.vat_rate === null ? '—' : rateLabels[data.vat_rate] }}</template></Column>
            <Column v-if="note.status === 'draft'" header="Acciones"><template #body="{ data }"><div class="credit-toolbar"><Button size="small" label="Editar" severity="secondary" outlined :disabled="busy || uncertain" @click="editItem(data)" /><Button size="small" label="Quitar" severity="danger" outlined :disabled="busy || uncertain" @click="removeItem(data)" /></div></template></Column>
          </DataTable>
          <template v-if="note.status === 'draft'">
            <Button v-if="!itemOpen" class="credit-action" label="Agregar ítem" severity="secondary" outlined :disabled="busy || uncertain || !note.credit_note_invoices.length" @click="addItem" />
            <form v-else class="credit-item" @submit.prevent="saveItem"><h3>{{ itemId === null ? 'Nuevo ítem' : 'Editar ítem' }}</h3><div class="credit-grid">
              <label class="credit-field" for="credit-association">Factura asociada *<Select input-id="credit-association" v-model="item.credit_note_invoice" :options="associationOptions" option-label="label" option-value="value" placeholder="Seleccioná" :disabled="busy || uncertain" /><small v-if="itemErrors.credit_note_invoice" class="credit-error">{{ itemErrors.credit_note_invoice }}</small></label>
              <label v-for="field in itemFields" :key="field.key" class="credit-field" :for="`credit-${field.key}`">{{ field.label }}{{ field.required ? ' *' : '' }}
                <Select v-if="field.options" :input-id="`credit-${field.key}`" v-model="item[field.key]" :options="field.options" option-label="label" option-value="value" placeholder="Seleccioná" :show-clear="field.key === 'vat_rate'" :disabled="busy || uncertain" />
                <InputText v-else :id="`credit-${field.key}`" v-model="item[field.key]" :maxlength="field.key === 'description' ? 255 : undefined" :inputmode="field.key === 'description' ? undefined : 'decimal'" :disabled="busy || uncertain" />
                <small v-if="itemErrors[field.key]" class="credit-error">{{ itemErrors[field.key] }}</small>
              </label>
            </div><div class="credit-toolbar credit-action"><Button type="submit" label="Guardar ítem" :disabled="busy || uncertain" /><Button type="button" label="Cancelar" severity="secondary" outlined :disabled="busy" @click="itemOpen = false" /></div></form>
            <div class="credit-toolbar credit-action"><Button label="Emitir nota" :disabled="busy || uncertain || itemOpen || !note.credit_note_invoices.length || !items.length || !activePoints.some(point => point.id === note.point_of_sale)" @click="confirmIssue = true" /><RouterLink to="/billing/invoices">Ver comprobantes</RouterLink></div>
          </template>
          <RouterLink v-else to="/billing/invoices">Ver comprobantes</RouterLink>
        </template>
      </template>
    </section>
    <Dialog v-model:visible="confirmIssue" modal header="Confirmar emisión" :style="{ width: 'min(480px, 95vw)' }"><p>Se realizará una emisión interna dentro del ERP. NexusBack asignará el número y calculará los importes.</p><div class="credit-toolbar"><Button label="Confirmar emisión" :disabled="busy" :loading="busy" @click="emit" /><Button label="Cancelar" severity="secondary" outlined :disabled="busy" @click="confirmIssue = false" /></div></Dialog>
    <BackLink to="/billing" label="Volver a Facturación" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, RouterLink, useRouter } from 'vue-router'
import BackLink from '../../components/BackLink.vue'
import { FileText } from '@lucide/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { creditNoteTypes as types, taxTreatments as treatments, vatRates as rates } from '../../constants/billing.constants'
import { addCreditNoteInvoices, createCreditNote, createCreditNoteItem, deleteCreditNoteInvoice, deleteCreditNoteItem, getCreditNote, getCreditNoteItems, getCreditNotes, getInvoices, getPointsOfSale, issueCreditNote, updateCreditNoteItem } from '../../services/billing.service'
import { clearSession } from '../../services/session.service'
import { activeCompany, selectCompany } from '../../stores/company.store'
import '../../assets/css/CreditNotesPage.css'


const typeLabels = Object.fromEntries(types.map(entry => [entry.value, entry.label]))
const homologous = { 3: 1, 8: 6, 13: 11 }
const treatmentLabels = Object.fromEntries(treatments.map(entry => [entry.value, entry.label]))
const rateLabels = Object.fromEntries(rates.map(entry => [entry.value, entry.label]))
const itemFields = [{ key: 'description', label: 'Descripción', required: true }, { key: 'quantity', label: 'Cantidad', required: true }, { key: 'unit_price', label: 'Precio unitario', required: true }, { key: 'discount', label: 'Descuento (%)' }, { key: 'tax_treatment', label: 'Tratamiento fiscal', required: true, options: treatments }, { key: 'vat_rate', label: 'Alícuota IVA', options: rates }]
const emptyItem = () => ({ credit_note_invoice: null, description: '', quantity: '', unit_price: '', discount: '0.00', tax_treatment: null, vat_rate: null })
const router = useRouter()
const points = ref([]); const invoices = ref([]); const notes = ref([]); const note = ref(null); const items = ref([])
const noteType = ref(null); const pointId = ref(null); const selectedInvoice = ref(null); const item = reactive(emptyItem()); const itemId = ref(null); const itemOpen = ref(false); const itemErrors = ref({})
const loading = ref(false); const busy = ref(false); const loadError = ref(''); const missingProfile = ref(false); const errorMessage = ref(''); const notice = ref(''); const uncertain = ref(false); const uncertainMessage = ref(''); const confirmIssue = ref(false)
const activePoints = computed(() => points.value.filter(point => point.is_active))
const drafts = computed(() => notes.value.filter(entry => entry.status === 'draft').map(entry => ({ value: entry.id, label: `#${entry.id} · ${typeLabels[entry.credit_note_type]}` })))
const associationOptions = computed(() => note.value.credit_note_invoices.map(entry => ({ value: entry.id, label: invoiceLabel(entry.invoice) })))
const eligibleInvoices = computed(() => {
  if (!note.value) return []
  const associated = note.value.credit_note_invoices
  const first = associated.length ? invoices.value.find(entry => entry.id === associated[0].invoice) : null
  return invoices.value.filter(entry => entry.status === 'issued' && entry.invoice_type === homologous[note.value.credit_note_type] && !associated.some(link => link.invoice === entry.id) && (!first || (first.receiver_document_type === entry.receiver_document_type && first.receiver_document_number === entry.receiver_document_number))).map(entry => ({ value: entry.id, label: invoiceLabel(entry.id) }))
})
let generation = 0; let restoring = false; let mounted = true
const dirty = computed(() => itemOpen.value || (!note.value && (noteType.value !== null || pointId.value !== null)) || busy.value)
/**
 * Confirma si se pueden descartar los cambios pendientes.
 * @version 1.0
 * @author Agustin
 */
function allowDiscard() { 
  return !dirty.value || window.confirm('Hay cambios sin guardar o una operación en curso. ¿Querés continuar?') 
}

/**
 * Advierte antes de abandonar la p?gina con cambios pendientes.
 * @version 1.0
 * @author Agustin
 */
function beforeUnload(event) { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
window.addEventListener('beforeunload', beforeUnload)
onBeforeRouteLeave(() => allowDiscard())
onBeforeUnmount(() => { mounted = false; generation++; window.removeEventListener('beforeunload', beforeUnload) })
watch(activeCompany, (current, previous) => {
  if (restoring) return
  if (previous && !allowDiscard()) { restoring = true; selectCompany(previous); restoring = false; return }
  generation++; reset(); loadInitial()
}, { immediate: true, flush: 'sync' })

/**
 * Restablece los datos y estados de la pantalla.
 * @version 1.0
 * @author Agustin
 */
function reset() { 
  note.value = null; items.value = []; points.value = []; invoices.value = []; notes.value = []; noteType.value = null; pointId.value = null; selectedInvoice.value = null; itemOpen.value = false; itemErrors.value = {}; notice.value = ''; errorMessage.value = ''; uncertain.value = false; uncertainMessage.value = ''; confirmIssue.value = false 
}

/**
 * Gestiona una respuesta de sesi?n inv?lida.
 * @version 1.0
 * @author Agustin
 */
function unauthorized(error) { if (error.status !== 401 || error.code !== 'NEX-USR-010') return false; clearSession(); router.push('/login'); return true }
/**
 * Obtiene la identificaci?n visible de un punto de venta.
 * @version 1.0
 * @author Agustin
 */
function pointLabel(id) { return points.value.find(point => point.id === id)?.number ?? `ID ${id}` }
/**
 * Construye la etiqueta de una factura asociable.
 * @version 1.0
 * @author Agustin
 */
function invoiceLabel(id) { const value = invoices.value.find(entry => entry.id === id); return value ? `#${id} · ${value.invoice_type_display} ${value.formatted_number ?? 'Sin número'} · ${value.issue_date ?? '—'} · ${value.receiver_name} · ${value.total}` : `Factura #${id}` }
/**
 * Obtiene la etiqueta de la factura de una asociaci?n.
 * @version 1.0
 * @author Agustin
 */
function associationLabel(id) { const association = note.value.credit_note_invoices.find(entry => entry.id === id); return association ? invoiceLabel(association.invoice) : `Asociación #${id}` }

/**
 * Carga los datos iniciales de la compa??a activa.
 * @version 1.0
 * @author Agustin
 */
async function loadInitial() {
  const version = ++generation; loadError.value = ''; missingProfile.value = false
  if (!activeCompany.value) { loading.value = false; return }
  loading.value = true
  try {
    const companyId = activeCompany.value.id
    const [pointResult, invoiceResult, noteResult] = await Promise.all([getPointsOfSale(companyId), getInvoices(companyId), getCreditNotes(companyId)])
    if (version !== generation) return
    points.value = pointResult; invoices.value = invoiceResult; notes.value = noteResult
  } catch (error) {
    if (version !== generation || unauthorized(error)) return
    if (error.status === 404 && error.message === 'No FiscalProfile matches the given query.') { missingProfile.value = true; loadError.value = 'Configurá el perfil fiscal antes de crear notas de crédito.' }
    else loadError.value = error.status === 403 ? 'No tenés permiso para consultar esta compañía.' : 'No se pudieron cargar los datos. Intentá nuevamente.'
  } finally { if (version === generation) loading.value = false }
}
/**
 * Inicia una nueva nota tras confirmar los cambios pendientes.
 * @version 1.0
 * @author Agustin
 */
function startNew() { if (!allowDiscard()) return; note.value = null; items.value = []; noteType.value = null; pointId.value = null; selectedInvoice.value = null; itemOpen.value = false; errorMessage.value = ''; notice.value = '' }
/**
 * Retoma un borrador de nota de cr?dito seleccionado.
 * @version 1.0
 * @author Agustin
 */
async function resume(id) { if (id && allowDiscard()) await refreshNote(id) }
/**
 * Comprueba el estado de la nota de cr?dito actual.
 * @version 1.0
 * @author Agustin
 */
function checkState() { if (note.value && allowDiscard()) refreshNote(note.value.id) }
/**
 * Consulta la nota de cr?dito y sus ?tems.
 * @version 1.0
 * @author Agustin
 */
async function refreshNote(id) {
  const version = generation; busy.value = true; errorMessage.value = ''
  try {
    const companyId = activeCompany.value.id
    const [result, itemResult] = await Promise.all([getCreditNote(companyId, id), getCreditNoteItems(companyId, id)])
    if (version !== generation) return
    note.value = result; items.value = itemResult; itemOpen.value = false; selectedInvoice.value = null; uncertain.value = false; uncertainMessage.value = ''
  } catch (error) { if (version === generation && !unauthorized(error)) errorMessage.value = error.status === 403 ? 'No tenés permiso para consultar esta nota.' : error.status === 404 ? 'No se encontró la nota.' : 'No se pudo consultar la nota. Intentá nuevamente.' }
  finally { busy.value = false }
}
/**
 * Presenta los errores devueltos por el servidor.
 * @version 1.0
 * @author Agustin
 */
function showError(error, fields = false) {
  if (unauthorized(error)) return
  if (error.status === 400) {
    const entries = Object.entries(error.errors || {})
    if (fields) itemErrors.value = error.errors || {}
    const messages = entries.filter(([key]) => !fields || !Object.hasOwn(item, key)).flatMap(([key, value]) => (Array.isArray(value) ? value : [value]).map(message => `${key}: ${message}`))
    errorMessage.value = messages.length ? messages.join(' ') : 'Revisá los datos ingresados.'
  } else if (error.status === 403) errorMessage.value = 'No tenés permiso para realizar esta operación.'
  else if (error.status === 404) errorMessage.value = 'No se encontró el recurso solicitado.'
  else errorMessage.value = 'No se pudo completar la operación. Intentá nuevamente.'
}
/**
 * Ejecuta una operaci?n y gestiona su resultado.
 * @version 1.0
 * @author Agustin
 */
async function perform(action, onSuccess, message, fieldErrors = false) {
  if (busy.value || uncertain.value || !activeCompany.value) return
  const version = generation; const companyId = activeCompany.value.id; busy.value = true; errorMessage.value = ''; notice.value = ''
  try { const result = await action(companyId); if (version === generation) { onSuccess(result); notice.value = message } }
  catch (error) {
    if (version !== generation) return
    if (!error.status || error.status >= 500) { uncertain.value = true; uncertainMessage.value = note.value ? 'No se pudo confirmar la operación. Comprobá el estado antes de continuar.' : 'No se pudo confirmar la creación. Consultá Comprobantes antes de crear otra nota.' }
    else showError(error, fieldErrors)
  } finally {
    busy.value = false
    if (mounted && version !== generation && activeCompany.value?.id === companyId) loadInitial()
  }
}
/**
 * Solicita la creaci?n de un borrador de nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
function createDraft() {
  if (pointId.value === null || noteType.value === null) { errorMessage.value = 'Seleccioná tipo y punto de venta.'; return }
  perform(companyId => createCreditNote(companyId, { point_of_sale: pointId.value, credit_note_type: noteType.value }), result => { note.value = result; notes.value.unshift(result) }, 'Borrador creado.')
}
/**
 * Asocia la factura seleccionada a la nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
function associate() {
  if (selectedInvoice.value === null) return
  perform(companyId => addCreditNoteInvoices(companyId, note.value.id, [selectedInvoice.value]), result => { note.value.credit_note_invoices.push(...result); selectedInvoice.value = null }, 'Factura asociada.')
}
/**
 * Desasocia una factura de la nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
function removeAssociation(entry) {
  if (!window.confirm('Se quitará la factura y sus ítems de la nota. ¿Continuar?')) return
  perform(companyId => deleteCreditNoteInvoice(companyId, note.value.id, entry.id), () => { note.value.credit_note_invoices = note.value.credit_note_invoices.filter(value => value.id !== entry.id); items.value = items.value.filter(value => value.credit_note_invoice !== entry.id); if (item.credit_note_invoice === entry.id) itemOpen.value = false }, 'Factura desasociada.')
}
/**
 * Prepara el formulario para agregar un ?tem.
 * @version 1.0
 * @author Agustin
 */
function addItem() { Object.assign(item, emptyItem()); itemId.value = null; itemErrors.value = {}; itemOpen.value = true }
/**
 * Carga un ?tem existente en el formulario de edici?n.
 * @version 1.0
 * @author Agustin
 */
function editItem(value) { if (itemOpen.value && !allowDiscard()) return; for (const key of Object.keys(item)) item[key] = value[key]; itemId.value = value.id; itemErrors.value = {}; itemOpen.value = true }
/**
 * Valida y guarda el ?tem del borrador.
 * @version 1.0
 * @author Agustin
 */
function saveItem() {
  itemErrors.value = {}; errorMessage.value = ''
  if (item.credit_note_invoice === null) itemErrors.value.credit_note_invoice = 'Seleccioná una factura asociada.'
  for (const field of itemFields.filter(field => field.required)) if (item[field.key] === null || !String(item[field.key]).trim()) itemErrors.value[field.key] = 'Este campo es obligatorio.'
  if (item.quantity && (!/^\d{1,8}(\.\d{1,2})?$/.test(item.quantity) || !/[1-9]/.test(item.quantity))) itemErrors.value.quantity = 'Ingresá una cantidad positiva con hasta dos decimales.'
  if (item.unit_price && !/^\d{1,12}(\.\d{1,2})?$/.test(item.unit_price)) itemErrors.value.unit_price = 'Ingresá un precio no negativo con hasta dos decimales.'
  if (item.discount && (!/^\d{1,3}(\.\d{1,2})?$/.test(item.discount) || Number(item.discount) > 100)) itemErrors.value.discount = 'Ingresá un descuento entre 0 y 100 con hasta dos decimales.'
  if (Object.keys(itemErrors.value).length) return
  const id = itemId.value; const payload = { ...item, discount: item.discount || '0.00' }
  perform(companyId => id === null ? createCreditNoteItem(companyId, note.value.id, payload) : updateCreditNoteItem(companyId, note.value.id, id, payload), result => { if (id === null) items.value.push(result); else items.value.splice(items.value.findIndex(entry => entry.id === id), 1, result); itemOpen.value = false }, 'Ítem guardado.', true)
}
/**
 * Elimina un ?tem del borrador.
 * @version 1.0
 * @author Agustin
 */
function removeItem(value) { if (!window.confirm('¿Quitar este ítem?')) return; perform(companyId => deleteCreditNoteItem(companyId, note.value.id, value.id), () => { items.value = items.value.filter(entry => entry.id !== value.id); if (itemId.value === value.id) itemOpen.value = false }, 'Ítem eliminado.') }
/**
 * Solicita la emisi?n interna de la nota de cr?dito.
 * @version 1.0
 * @author Agustin
 */
function emit() { if (!note.value || itemOpen.value || !note.value.credit_note_invoices.length || !items.value.length) return; perform(companyId => issueCreditNote(companyId, note.value.id), result => { note.value = result; confirmIssue.value = false; notes.value = notes.value.filter(entry => entry.id !== result.id) }, 'Nota emitida internamente.').finally(() => { confirmIssue.value = false }) }
</script>
