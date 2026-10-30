<template>
  <div class="deadlines-page">
    <header class="deadlines-header">
      <span class="deadlines-header-icon" aria-hidden="true"><CalendarDays :size="24" /></span>
      <div>
        <h1>Vencimientos</h1>
        <p>Consultá las tareas y obligaciones de todos tus clientes.</p>
      </div>
      <Button class="deadlines-new-button" type="button" :disabled="isLoading || isSaving" @click="openCreate">
        <Plus :size="16" aria-hidden="true" /> Nuevo vencimiento
      </Button>
    </header>

    <section class="deadlines-indicators" aria-label="Resumen de vencimientos">
      <article class="deadlines-indicator">
        <span class="deadlines-indicator-label">Pendientes</span>
        <strong>{{ pendingCount }}</strong>
      </article>
      <article class="deadlines-indicator deadlines-indicator-soon">
        <span class="deadlines-indicator-label">Próximas a vencer</span>
        <strong>{{ dueSoonCount }}</strong>
      </article>
      <article class="deadlines-indicator deadlines-indicator-overdue">
        <span class="deadlines-indicator-label">Vencidas</span>
        <strong>{{ overdueCount }}</strong>
      </article>
    </section>

    <section class="deadlines-card" aria-labelledby="deadlines-list-title">
      <p v-if="successMessage" class="deadlines-feedback deadlines-feedback-success" role="status">{{ successMessage }}</p>
      <p v-if="actionError" class="deadlines-feedback deadlines-feedback-error" role="alert">{{ actionError }}</p>
      <form class="deadlines-filters" @submit.prevent="loadDeadlines">
        <label class="deadlines-field">
          <span>Compañía o cliente</span>
          <select v-model="filters.company_id" :disabled="isLoading">
            <option value="">Todos los clientes</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}{{ company.is_active ? '' : ' (inactiva)' }}
            </option>
          </select>
        </label>
        <label class="deadlines-field">
          <span>Estado</span>
          <select v-model="filters.status" :disabled="isLoading">
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completada</option>
          </select>
        </label>
        <label class="deadlines-field">
          <span>Vence desde</span>
          <input v-model="filters.due_date_from" type="date" :disabled="isLoading" />
        </label>
        <label class="deadlines-field">
          <span>Vence hasta</span>
          <input v-model="filters.due_date_to" type="date" :disabled="isLoading" />
        </label>
        <div class="deadlines-filter-actions">
          <button class="deadlines-button" type="submit" :disabled="isLoading">
            <Search :size="16" aria-hidden="true" /> Aplicar filtros
          </button>
          <button class="deadlines-clear-button" type="button" :disabled="isLoading || !hasFilters" @click="clearFilters">
            Limpiar
          </button>
        </div>
      </form>

      <div class="deadlines-list-header">
        <h2 id="deadlines-list-title">Tareas</h2>
        <span v-if="!isLoading && !loadError" class="deadlines-result-count">
          {{ deadlines.length }} {{ deadlines.length === 1 ? 'resultado' : 'resultados' }}
        </span>
      </div>

      <p v-if="isLoading" class="deadlines-state" role="status">Cargando vencimientos...</p>
      <div v-else-if="loadError || companiesError" class="deadlines-state deadlines-state-error" role="alert">
        <p>{{ loadError || companiesError }}</p>
        <button class="deadlines-clear-button" type="button" @click="loadInitial">Reintentar</button>
      </div>
      <p v-else-if="deadlines.length === 0" class="deadlines-state">
        {{ hasFilters ? 'No hay tareas que coincidan con los filtros.' : 'Todavía no hay tareas ni vencimientos.' }}
      </p>
      <div v-else class="deadlines-table-wrap">
        <table class="deadlines-table">
          <caption class="deadlines-sr-only">Tareas y vencimientos</caption>
          <thead>
            <tr>
              <th scope="col">Tarea</th>
              <th scope="col">Compañía o cliente</th>
              <th scope="col">Período</th>
              <th scope="col">Vencimiento</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deadline in deadlines" :key="deadline.id" :class="deadlineRowClass(deadline)">
              <td><strong>{{ deadline.name }}</strong></td>
              <td>{{ companyName(deadline.company) }}</td>
              <td>{{ deadline.period || '—' }}</td>
              <td>{{ formatDate(deadline.due_date) }}</td>
              <td><span :class="['deadlines-status', statusClass(deadline)]">{{ statusLabel(deadline) }}</span></td>
              <td class="deadlines-row-actions">
                <Button type="button" size="small" severity="secondary" text :disabled="isSaving || editingLoading" :aria-label="`Editar ${deadline.name}`" @click="openEdit(deadline)">
                  <Pencil :size="16" aria-hidden="true" />
                </Button>
                <Button type="button" size="small" severity="secondary" text :disabled="isSaving || !canWrite(deadline)" :aria-label="deadline.status === 'pending' ? `Completar ${deadline.name}` : `Reabrir ${deadline.name}`" :title="writeRestriction(deadline)" @click="toggleStatus(deadline)">
                  <component :is="deadline.status === 'pending' ? Check : RotateCcw" :size="16" aria-hidden="true" />
                </Button>
                <Button type="button" size="small" severity="danger" text :disabled="isSaving || !canWrite(deadline)" :aria-label="`Eliminar ${deadline.name}`" :title="writeRestriction(deadline)" @click="askDelete(deadline)">
                  <Trash2 :size="16" aria-hidden="true" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Dialog v-model:visible="formVisible" modal :header="editingDeadline ? 'Editar vencimiento' : 'Nuevo vencimiento'" :style="{ width: 'min(620px, 95vw)' }" :closable="!isSaving" @hide="resetForm">
      <p v-if="formError" class="deadlines-feedback deadlines-feedback-error" role="alert">{{ formError }}</p>
      <p v-if="editingDeadline && !canWrite(editingDeadline)" class="deadlines-feedback deadlines-feedback-warning" role="status">
        Esta compañía está inactiva. La tarea se puede consultar, pero el backend no permite modificarla ni eliminarla.
      </p>
      <p v-if="editingLoading" class="deadlines-form-state" role="status">Cargando tarea...</p>
      <form v-else class="deadlines-form" @submit.prevent="saveDeadline" novalidate>
        <label class="deadlines-form-field" for="deadline-company">Compañía o persona *</label>
        <Select id="deadline-company" v-model="form.company" :options="formCompanies" option-label="name" option-value="id" placeholder="Seleccioná un cliente" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.company" @update:model-value="clearFieldError('company')" />
        <small v-if="fieldErrors.company" class="deadlines-field-error">{{ fieldErrors.company }}</small>

        <label class="deadlines-form-field" for="deadline-name">Nombre o concepto *</label>
        <InputText id="deadline-name" v-model="form.name" maxlength="255" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.name" @input="clearFieldError('name')" />
        <small v-if="fieldErrors.name" class="deadlines-field-error">{{ fieldErrors.name }}</small>

        <label class="deadlines-form-field" for="deadline-period">Período de referencia</label>
        <InputText id="deadline-period" v-model="form.period" maxlength="255" placeholder="Opcional" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.period" @input="clearFieldError('period')" />
        <small v-if="fieldErrors.period" class="deadlines-field-error">{{ fieldErrors.period }}</small>

        <label class="deadlines-form-field" for="deadline-date">Fecha de vencimiento *</label>
        <InputText id="deadline-date" v-model="form.due_date" type="date" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.due_date" @input="clearFieldError('due_date')" />
        <small v-if="fieldErrors.due_date" class="deadlines-field-error">{{ fieldErrors.due_date }}</small>

        <label class="deadlines-form-field" for="deadline-status">Estado</label>
        <Select id="deadline-status" v-model="form.status" :options="statusOptions" option-label="label" option-value="value" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.status" @update:model-value="clearFieldError('status')" />
        <small v-if="fieldErrors.status" class="deadlines-field-error">{{ fieldErrors.status }}</small>

        <label class="deadlines-form-field" for="deadline-notes">Observaciones</label>
        <Textarea id="deadline-notes" v-model="form.notes" rows="3" auto-resize placeholder="Opcional" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.notes" @input="clearFieldError('notes')" />
        <small v-if="fieldErrors.notes" class="deadlines-field-error">{{ fieldErrors.notes }}</small>

        <div class="deadlines-dialog-actions">
          <Button type="button" label="Cancelar" severity="secondary" outlined :disabled="isSaving" @click="formVisible = false" />
          <Button v-if="canEditForm" type="submit" :label="isSaving ? 'Guardando...' : 'Guardar'" :loading="isSaving" :disabled="isSaving || !activeCompanies.length" />
        </div>
      </form>
    </Dialog>

    <Dialog v-model:visible="deleteVisible" modal header="Eliminar vencimiento" :style="{ width: 'min(440px, 95vw)' }" :closable="!isSaving">
      <p>¿Querés eliminar <strong>{{ deadlineToDelete?.name }}</strong>? Esta acción no se puede deshacer.</p>
      <p v-if="deleteError" class="deadlines-feedback deadlines-feedback-error" role="alert">{{ deleteError }}</p>
      <div class="deadlines-dialog-actions">
        <Button type="button" label="Cancelar" severity="secondary" outlined :disabled="isSaving" @click="deleteVisible = false" />
        <Button type="button" label="Eliminar" severity="danger" :loading="isSaving" :disabled="isSaving" @click="confirmDelete" />
      </div>
    </Dialog>

    <BackLink :to="backTarget" label="Volver" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CalendarDays, Check, Pencil, Plus, RotateCcw, Search, Trash2 } from '@lucide/vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import BackLink from '../../components/BackLink.vue'
import { getCompanies } from '../../services/company.service'
import { createDeadline, deleteDeadline, getDeadline, getDeadlines, patchDeadline, updateDeadline } from '../../services/deadline.service'
import { clearSession } from '../../services/session.service'
import '../../assets/css/DeadlinesPage.css'

const router = useRouter()
const route = useRoute()
const deadlines = ref([])
const companies = ref([])
const isLoading = ref(false)
const loadError = ref('')
const companiesError = ref('')
const actionError = ref('')
const successMessage = ref('')
const formError = ref('')
const deleteError = ref('')
const formVisible = ref(false)
const deleteVisible = ref(false)
const isSaving = ref(false)
const editingLoading = ref(false)
const formLoadFailed = ref(false)
const editingDeadline = ref(null)
const deadlineToDelete = ref(null)
const fieldErrors = ref({})
const filters = reactive({ company_id: '', status: '', due_date_from: '', due_date_to: '' })
const form = reactive({ company: '', name: '', period: '', due_date: '', status: 'pending', notes: '' })
const statusOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Completada', value: 'completed' }
]
const hasFilters = computed(() => Object.values(filters).some(Boolean))
const backTarget = computed(() => {
  const previous = router.options.history.state.back
  if (typeof previous !== 'string' || !previous.startsWith('/')) return '/home'
  const previousRoute = router.resolve(previous)
  if (previousRoute.path === route.path || !previousRoute.matched.some((record) => record.meta.requiresAuth)) return '/home'
  return { path: previousRoute.path, query: previousRoute.query, hash: previousRoute.hash }
})
const activeCompanies = computed(() => companies.value.filter((company) => company.is_active))
const formCompanies = computed(() => {
  if (!editingDeadline.value) return activeCompanies.value
  const selectedCompany = companies.value.find((company) => company.id === form.company)
  return selectedCompany && !selectedCompany.is_active
    ? [...activeCompanies.value, selectedCompany]
    : activeCompanies.value
})
const canEditForm = computed(() => !formLoadFailed.value && (!editingDeadline.value || canWrite(editingDeadline.value)))
const pendingCount = computed(() => deadlines.value.filter((deadline) => deadline.status === 'pending').length)
const dueSoonCount = computed(() => deadlines.value.filter((deadline) => deadline.due_soon).length)
const overdueCount = computed(() => deadlines.value.filter((deadline) => deadline.overdue).length)
let requestId = 0

onMounted(loadInitial)

async function loadInitial() {
  await Promise.all([loadCompanies(), loadDeadlines()])
}

async function loadCompanies() {
  try {
    companies.value = await getCompanies('all')
    companiesError.value = ''
  } catch (error) {
    if (handleUnauthorized(error)) return
    companies.value = []
    companiesError.value = 'No se pudieron cargar los clientes. Intentá nuevamente.'
  }
}

async function loadDeadlines() {
  const currentRequest = ++requestId
  deadlines.value = []
  isLoading.value = true
  loadError.value = ''

  try {
    const result = await getDeadlines(filters)
    if (currentRequest === requestId) deadlines.value = result
  } catch (error) {
    if (currentRequest !== requestId || handleUnauthorized(error)) return
    deadlines.value = []
    loadError.value = error instanceof Error ? error.message : 'No se pudieron cargar los vencimientos. Intentá nuevamente.'
  } finally {
    if (currentRequest === requestId) isLoading.value = false
  }
}

function clearFilters() {
  filters.company_id = ''
  filters.status = ''
  filters.due_date_from = ''
  filters.due_date_to = ''
  loadDeadlines()
}

function openCreate() {
  resetForm()
  actionError.value = ''
  successMessage.value = ''
  editingDeadline.value = null
  formVisible.value = true
}

async function openEdit(deadline) {
  resetForm()
  actionError.value = ''
  successMessage.value = ''
  editingLoading.value = true
  editingDeadline.value = deadline
  formVisible.value = true
  try {
    const result = await getDeadline(deadline.id)
    if (!formVisible.value || editingDeadline.value?.id !== deadline.id) return
    Object.assign(form, {
      company: result.company,
      name: result.name,
      period: result.period || '',
      due_date: result.due_date,
      status: result.status,
      notes: result.notes || ''
    })
  } catch (error) {
    if (!handleUnauthorized(error)) {
      formLoadFailed.value = true
      formError.value = requestError(error, 'No se pudo consultar la tarea.')
    }
  } finally {
    editingLoading.value = false
  }
}

function resetForm() {
  Object.assign(form, { company: '', name: '', period: '', due_date: '', status: 'pending', notes: '' })
  fieldErrors.value = {}
  formError.value = ''
  formLoadFailed.value = false
  editingDeadline.value = null
  editingLoading.value = false
}

async function saveDeadline() {
  if (isSaving.value || !validateForm()) return
  const data = {
    company: form.company,
    name: form.name.trim(),
    period: form.period.trim() || null,
    due_date: form.due_date,
    status: form.status,
    notes: form.notes.trim() || null
  }

  isSaving.value = true
  formError.value = ''
  fieldErrors.value = {}
  actionError.value = ''
  successMessage.value = ''
  try {
    if (editingDeadline.value) {
      await updateDeadline(editingDeadline.value.id, data)
      successMessage.value = 'Vencimiento actualizado correctamente.'
    } else {
      await createDeadline(data)
      successMessage.value = 'Vencimiento creado correctamente.'
    }
    formVisible.value = false
    await loadDeadlines()
  } catch (error) {
    if (!handleUnauthorized(error)) applyFormError(error)
  } finally {
    isSaving.value = false
  }
}

function validateForm() {
  const errors = {}
  if (!form.company) errors.company = 'Seleccioná una compañía o persona.'
  if (!form.name.trim()) errors.name = 'Ingresá el nombre o concepto de la tarea.'
  if (form.name.trim().length > 255) errors.name = 'El nombre no puede superar los 255 caracteres.'
  if (!form.due_date) errors.due_date = 'Seleccioná la fecha de vencimiento.'
  if (form.period.length > 255) errors.period = 'El período no puede superar los 255 caracteres.'
  fieldErrors.value = errors
  formError.value = Object.keys(errors).length ? 'Revisá los campos indicados.' : ''
  return Object.keys(errors).length === 0
}

function clearFieldError(field) {
  if (!fieldErrors.value[field]) return
  const errors = { ...fieldErrors.value }
  delete errors[field]
  fieldErrors.value = errors
}

function applyFormError(error) {
  if (error.status === 400 && error.errors && typeof error.errors === 'object') {
    const fields = ['company', 'name', 'period', 'due_date', 'status', 'notes']
    const nextErrors = {}
    const otherMessages = []
    for (const [key, value] of Object.entries(error.errors)) {
      const message = Array.isArray(value) ? value.join(' ') : String(value)
      if (fields.includes(key)) nextErrors[key] = message
      else otherMessages.push(message)
    }
    fieldErrors.value = nextErrors
    formError.value = otherMessages.length ? otherMessages.join(' ') : Object.keys(nextErrors).length ? 'Revisá los campos indicados por el servidor.' : requestError(error, 'Revisá los datos ingresados.')
    return
  }
  formError.value = requestError(error, 'No se pudo guardar el vencimiento.')
}

async function toggleStatus(deadline) {
  if (isSaving.value || !canWrite(deadline)) return
  isSaving.value = true
  actionError.value = ''
  successMessage.value = ''
  try {
    await patchDeadline(deadline.id, { status: deadline.status === 'pending' ? 'completed' : 'pending' })
    successMessage.value = deadline.status === 'pending' ? 'Tarea completada.' : 'Tarea reabierta.'
    await loadDeadlines()
  } catch (error) {
    if (!handleUnauthorized(error)) actionError.value = requestError(error, 'No se pudo actualizar el estado de la tarea.')
  } finally {
    isSaving.value = false
  }
}

function askDelete(deadline) {
  if (!canWrite(deadline)) return
  deadlineToDelete.value = deadline
  deleteError.value = ''
  deleteVisible.value = true
}

async function confirmDelete() {
  if (isSaving.value || !deadlineToDelete.value) return
  isSaving.value = true
  deleteError.value = ''
  actionError.value = ''
  successMessage.value = ''
  try {
    await deleteDeadline(deadlineToDelete.value.id)
    deleteVisible.value = false
    successMessage.value = 'Vencimiento eliminado correctamente.'
    deadlineToDelete.value = null
    await loadDeadlines()
  } catch (error) {
    if (!handleUnauthorized(error)) deleteError.value = requestError(error, 'No se pudo eliminar el vencimiento.')
  } finally {
    isSaving.value = false
  }
}

function canWrite(deadline) {
  const company = companies.value.find((item) => item.id === deadline.company)
  return Boolean(company && company.is_active)
}

function writeRestriction(deadline) {
  return canWrite(deadline) ? '' : 'No se puede modificar una tarea de una compañía inactiva.'
}

function requestError(error, fallback) {
  if (error.status === 403) return 'No tenés permiso para modificar esta tarea o su compañía está inactiva.'
  if (error.status === 404) return 'No se encontró la tarea o ya no tenés acceso a ella.'
  if (error instanceof Error && error.message && error.message !== 'La solicitud falló con estado 400') return error.message
  return fallback
}

function handleUnauthorized(error) {
  if (error.status !== 401 || error.code !== 'NEX-USR-010') return false
  clearSession()
  router.push('/login')
  return true
}

function companyName(companyId) {
  const company = companies.value.find((item) => item.id === companyId)
  return company ? company.name : companyId
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

function statusLabel(deadline) {
  if (deadline.overdue) return 'Vencida'
  if (deadline.due_soon) return 'Próxima a vencer'
  return deadline.status === 'completed' ? 'Completada' : 'Pendiente'
}

function statusClass(deadline) {
  if (deadline.overdue) return 'deadlines-status-overdue'
  if (deadline.due_soon) return 'deadlines-status-soon'
  return deadline.status === 'completed' ? 'deadlines-status-completed' : 'deadlines-status-pending'
}

function deadlineRowClass(deadline) {
  if (deadline.overdue) return 'deadlines-row-overdue'
  if (deadline.due_soon) return 'deadlines-row-soon'
  return deadline.status === 'completed' ? 'deadlines-row-completed' : ''
}
</script>
