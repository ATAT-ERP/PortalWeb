<template>
  <div class="deadlines-page">
    <section class="deadlines-month-summary" :aria-label="`Vencimientos de ${monthLabel}`">
      <header class="deadlines-header">
        <span class="deadlines-header-icon" aria-hidden="true"><CalendarDays :size="21" /></span>
        <h1>Vencimientos</h1>
        <span class="deadlines-header-period"><span aria-hidden="true">·</span> {{ monthLabel }}</span>
      </header>
      <div class="deadlines-indicators">
        <article class="deadlines-indicator indicator-pending">
          <span class="deadlines-indicator-icon"><ClipboardList :size="21" aria-hidden="true" /></span>
          <div><strong>{{ pendingCount }}</strong><span class="deadlines-indicator-label">Pendientes</span></div>
        </article>
        <article class="deadlines-indicator indicator-soon">
          <span class="deadlines-indicator-icon"><Clock3 :size="21" aria-hidden="true" /></span>
          <div><strong>{{ dueSoonCount }}</strong><span class="deadlines-indicator-label">Próximas</span></div>
        </article>
        <article class="deadlines-indicator indicator-overdue">
          <span class="deadlines-indicator-icon"><AlertTriangle :size="21" aria-hidden="true" /></span>
          <div><strong>{{ overdueCount }}</strong><span class="deadlines-indicator-label">Vencidas</span></div>
        </article>
        <article class="deadlines-indicator indicator-completed">
          <span class="deadlines-indicator-icon"><CheckCircle2 :size="21" aria-hidden="true" /></span>
          <div><strong>{{ completedCount }}</strong><span class="deadlines-indicator-label">Completadas</span></div>
        </article>
      </div>
    </section>

    <section class="deadlines-card" aria-label="Calendario y tareas de vencimientos">
      <p v-if="successMessage" class="deadlines-feedback deadlines-feedback-success" role="status">{{ successMessage }}</p>
      <p v-if="actionError" class="deadlines-feedback deadlines-feedback-error" role="alert">{{ actionError }}</p>
      <form class="deadlines-filters" @submit.prevent="applyFilters">
        <label class="deadlines-field" for="deadline-filter-company">
          <span><Building2 :size="14" aria-hidden="true" /> Cliente</span>
          <Select input-id="deadline-filter-company" v-model="filters.company_id" :options="companyFilterOptions" option-label="label" option-value="value" placeholder="Todos los clientes" :disabled="isLoading" />
        </label>
        <label class="deadlines-field" for="deadline-filter-status">
          <span><CircleDot :size="14" aria-hidden="true" /> Estado</span>
          <Select input-id="deadline-filter-status" v-model="filters.status" :options="statusFilterOptions" option-label="label" option-value="value" :disabled="isLoading" />
        </label>
        <div class="deadlines-filter-actions">
          <Button type="submit" size="small" severity="secondary" outlined :disabled="isLoading"><Search :size="15" aria-hidden="true" /> Aplicar</Button>
          <Button type="button" size="small" severity="secondary" text :disabled="isLoading || !hasFilters" @click="clearFilters">Limpiar</Button>
          <Button
            type="button"
            class="deadlines-date-filter-toggle"
            :class="{ 'has-date-filter': hasDateFilters }"
            severity="secondary"
            text
            rounded
            :aria-label="showDateFilters ? 'Ocultar filtros de fechas' : 'Mostrar filtros de fechas'"
            :title="showDateFilters ? 'Ocultar filtros de fechas' : 'Mostrar filtros de fechas'"
            :aria-expanded="showDateFilters"
            aria-controls="deadline-date-filters"
            @click="showDateFilters = !showDateFilters"
          >
            <SlidersHorizontal :size="17" aria-hidden="true" />
          </Button>
        </div>
        <div v-show="showDateFilters" id="deadline-date-filters" class="deadlines-date-filters">
          <label class="deadlines-field" for="deadline-filter-date-from">
            <span><CalendarDays :size="14" aria-hidden="true" /> Desde</span>
            <InputText id="deadline-filter-date-from" v-model="filters.due_date_from" type="date" :disabled="isLoading" />
          </label>
          <label class="deadlines-field" for="deadline-filter-date-to">
            <span><CalendarDays :size="14" aria-hidden="true" /> Hasta</span>
            <InputText id="deadline-filter-date-to" v-model="filters.due_date_to" type="date" :disabled="isLoading" />
          </label>
          <p>El rango se aplica dentro del mes visible.</p>
        </div>
      </form>

      <div class="deadlines-calendar-layout">
        <section class="deadlines-calendar-panel" aria-label="Calendario mensual">
          <header class="deadlines-calendar-header">
            <div class="deadlines-month-controls">
              <Button type="button" severity="secondary" text rounded aria-label="Mes anterior" @click="moveMonth(-1)">
                <ChevronLeft :size="18" aria-hidden="true" />
              </Button>
              <h2>{{ monthLabel }}</h2>
              <Button type="button" severity="secondary" text rounded aria-label="Mes siguiente" @click="moveMonth(1)">
                <ChevronRight :size="18" aria-hidden="true" />
              </Button>
            </div>
            <Button type="button" severity="secondary" outlined size="small" :disabled="selectedDate === todayKey" @click="goToCurrentMonth">Hoy</Button>
          </header>

          <div class="deadlines-weekdays" aria-hidden="true">
            <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
          </div>
          <div class="deadlines-calendar-grid" role="group" :aria-label="`Calendario de ${monthLabel}`">
            <button
              v-for="day in calendarDays"
              :key="day.date"
              type="button"
              :aria-label="calendarDayLabel(day)"
              :aria-pressed="day.date === selectedDate"
              :class="['deadlines-calendar-day', { 'is-outside-month': !day.inMonth, 'is-today': day.isToday, 'is-selected': day.isSelected }]"
              @click="selectDay(day)"
            >
              <span class="deadlines-day-number">{{ day.day }}</span>
              <span v-if="day.counts.total" class="deadlines-day-count">{{ day.counts.total }}</span>
              <span v-if="day.counts.total" class="deadlines-day-markers" aria-hidden="true">
                <i v-if="day.counts.pending" class="deadlines-marker marker-pending"></i>
                <i v-if="day.counts.dueSoon" class="deadlines-marker marker-soon"></i>
                <i v-if="day.counts.overdue" class="deadlines-marker marker-overdue"></i>
                <i v-if="day.counts.completed" class="deadlines-marker marker-completed"></i>
              </span>
            </button>
          </div>
          <div class="deadlines-calendar-legend" aria-label="Referencias de estado">
            <span><i class="deadlines-marker marker-pending"></i>Pendiente</span>
            <span><i class="deadlines-marker marker-soon"></i>Próxima</span>
            <span><i class="deadlines-marker marker-overdue"></i>Vencida</span>
            <span><i class="deadlines-marker marker-completed"></i>Completada</span>
          </div>
        </section>

        <aside class="deadlines-day-panel" aria-labelledby="selected-day-title">
          <header class="deadlines-day-header">
            <div>
              <h2 id="selected-day-title">{{ selectedDateLabel }}</h2>
              <p>{{ selectedDayDeadlines.length }} {{ selectedDayDeadlines.length === 1 ? 'tarea' : 'tareas' }}</p>
            </div>
            <Button type="button" class="deadlines-day-create" severity="secondary" outlined aria-label="Nuevo vencimiento para el día seleccionado" title="Nuevo vencimiento" :disabled="isSaving" @click="openCreate">
              <Plus :size="17" aria-hidden="true" />
            </Button>
          </header>
          <div class="deadlines-day-summary" aria-label="Resumen de estados para el día">
            <span :aria-label="`${selectedDayCounts.pending} pendientes`"><i class="deadlines-marker marker-pending" aria-hidden="true"></i>{{ selectedDayCounts.pending }}</span>
            <span :aria-label="`${selectedDayCounts.dueSoon} próximas a vencer`"><i class="deadlines-marker marker-soon" aria-hidden="true"></i>{{ selectedDayCounts.dueSoon }}</span>
            <span :aria-label="`${selectedDayCounts.overdue} vencidas`"><i class="deadlines-marker marker-overdue" aria-hidden="true"></i>{{ selectedDayCounts.overdue }}</span>
            <span :aria-label="`${selectedDayCounts.completed} completadas`"><i class="deadlines-marker marker-completed" aria-hidden="true"></i>{{ selectedDayCounts.completed }}</span>
          </div>

          <p v-if="isLoading" class="deadlines-state" role="status">Cargando vencimientos...</p>
          <div v-else-if="loadError || companiesError" class="deadlines-state deadlines-state-error" role="alert">
            <p>{{ loadError || companiesError }}</p>
            <button class="deadlines-clear-button" type="button" @click="loadInitial">Reintentar</button>
          </div>
          <div v-else-if="!selectedDayDeadlines.length" class="deadlines-day-empty">
            <span class="deadlines-empty-icon" aria-hidden="true"><CalendarDays :size="20" /></span>
            <p>{{ hasFilters ? 'No hay tareas que coincidan con los filtros para este día.' : 'No hay vencimientos para este día.' }}</p>
          </div>
          <ul v-else class="deadlines-day-list">
            <li v-for="deadline in selectedDayDeadlines" :key="deadline.id" :class="['deadlines-day-task', deadlineTaskClass(deadline)]">
              <div class="deadlines-task-heading">
                <strong>{{ deadline.name }}</strong>
                <span :class="['deadlines-status', statusClass(deadline)]">{{ statusLabel(deadline) }}</span>
              </div>
              <p class="deadlines-task-company">{{ companyName(deadline.company) }}</p>
              <p v-if="deadline.period" class="deadlines-task-period">Período: {{ deadline.period }}</p>
              <div class="deadlines-task-actions">
                <Button type="button" class="task-action task-action-edit" size="small" severity="secondary" text :disabled="isSaving || editingLoading" :aria-label="`Editar ${deadline.name}`" :title="canWrite(deadline) ? 'Editar tarea' : 'Consultar tarea; la compañía está inactiva'" @click="openEdit(deadline)">
                  <Pencil :size="16" aria-hidden="true" />
                </Button>
                <Button type="button" :class="['task-action', deadline.status === 'pending' ? 'task-action-complete' : 'task-action-reopen']" size="small" severity="secondary" text :disabled="isSaving || !canWrite(deadline)" :aria-label="deadline.status === 'pending' ? `Completar ${deadline.name}` : `Reabrir ${deadline.name}`" :title="canWrite(deadline) ? (deadline.status === 'pending' ? 'Completar tarea' : 'Reabrir tarea') : writeRestriction(deadline)" @click="toggleStatus(deadline)">
                  <component :is="deadline.status === 'pending' ? Check : RotateCcw" :size="16" aria-hidden="true" />
                </Button>
                <Button type="button" class="task-action task-action-delete" size="small" severity="danger" text :disabled="isSaving || !canWrite(deadline)" :aria-label="`Eliminar ${deadline.name}`" :title="canWrite(deadline) ? 'Eliminar tarea' : writeRestriction(deadline)" @click="askDelete(deadline)">
                  <Trash2 :size="16" aria-hidden="true" />
                </Button>
              </div>
            </li>
          </ul>
        </aside>
      </div>
    </section>

    <Dialog v-model:visible="formVisible" modal :header="editingDeadline ? 'Editar vencimiento' : 'Nuevo vencimiento'" :style="{ width: 'min(680px, 95vw)' }" :closable="!isSaving" @hide="resetForm">
      <p v-if="formError" class="deadlines-feedback deadlines-feedback-error" role="alert">{{ formError }}</p>
      <p v-if="editingDeadline && !canWrite(editingDeadline)" class="deadlines-feedback deadlines-feedback-warning" role="status">
        Esta compañía está inactiva. La tarea se puede consultar, pero el backend no permite modificarla ni eliminarla.
      </p>
      <p v-if="editingLoading" class="deadlines-form-state" role="status">Cargando tarea...</p>
      <form v-else class="deadlines-form" @submit.prevent="saveDeadline" novalidate>
        <div class="deadlines-form-group">
          <label class="deadlines-form-field" for="deadline-company">Compañía o persona *</label>
          <Select input-id="deadline-company" v-model="form.company" :options="formCompanies" option-label="name" option-value="id" placeholder="Seleccioná un cliente" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.company" @update:model-value="clearFieldError('company')" />
          <small v-if="fieldErrors.company" class="deadlines-field-error">{{ fieldErrors.company }}</small>
        </div>

        <div class="deadlines-form-group">
          <label class="deadlines-form-field" for="deadline-name">Nombre o concepto *</label>
          <InputText id="deadline-name" v-model="form.name" maxlength="255" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.name" @input="clearFieldError('name')" />
          <small v-if="fieldErrors.name" class="deadlines-field-error">{{ fieldErrors.name }}</small>
        </div>

        <div class="deadlines-form-group">
          <label class="deadlines-form-field" for="deadline-date">Fecha de vencimiento *</label>
          <InputText id="deadline-date" v-model="form.due_date" type="date" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.due_date" @input="clearFieldError('due_date')" />
          <small v-if="fieldErrors.due_date" class="deadlines-field-error">{{ fieldErrors.due_date }}</small>
        </div>

        <div class="deadlines-form-group">
          <label class="deadlines-form-field" for="deadline-status">Estado</label>
          <Select input-id="deadline-status" v-model="form.status" :options="statusOptions" option-label="label" option-value="value" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.status" @update:model-value="clearFieldError('status')" />
          <small v-if="fieldErrors.status" class="deadlines-field-error">{{ fieldErrors.status }}</small>
        </div>

        <div class="deadlines-form-group">
          <label class="deadlines-form-field" for="deadline-period">Período de referencia</label>
          <InputText id="deadline-period" v-model="form.period" maxlength="255" placeholder="Opcional" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.period" @input="clearFieldError('period')" />
          <small v-if="fieldErrors.period" class="deadlines-field-error">{{ fieldErrors.period }}</small>
        </div>

        <div class="deadlines-form-group deadlines-form-group-notes">
          <label class="deadlines-form-field" for="deadline-notes">Observaciones</label>
          <Textarea id="deadline-notes" v-model="form.notes" rows="3" auto-resize placeholder="Opcional" :disabled="isSaving || !canEditForm" :invalid="!!fieldErrors.notes" @input="clearFieldError('notes')" />
          <small v-if="fieldErrors.notes" class="deadlines-field-error">{{ fieldErrors.notes }}</small>
        </div>

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
import { AlertTriangle, Building2, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleDot, ClipboardList, Clock3, Pencil, Plus, RotateCcw, Search, SlidersHorizontal, Trash2 } from '@lucide/vue'
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
const showDateFilters = ref(false)
const isSaving = ref(false)
const editingLoading = ref(false)
const formLoadFailed = ref(false)
const editingDeadline = ref(null)
const deadlineToDelete = ref(null)
const fieldErrors = ref({})
const filters = reactive({ company_id: '', status: '', due_date_from: '', due_date_to: '' })
const form = reactive({ company: '', name: '', period: '', due_date: '', status: 'pending', notes: '' })
const now = new Date()
const todayKey = dateKey(now)
const displayedMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1))
const selectedDate = ref(todayKey)
const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const statusOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Completada', value: 'completed' }
]
const statusFilterOptions = [{ label: 'Todos', value: '' }, ...statusOptions]
const hasFilters = computed(() => Object.values(filters).some(Boolean))
const hasDateFilters = computed(() => Boolean(filters.due_date_from || filters.due_date_to))
const companyFilterOptions = computed(() => [
  { label: 'Todos los clientes', value: '' },
  ...companies.value.map((company) => ({
    label: `${company.name}${company.is_active ? '' : ' (inactiva)'}`,
    value: company.id
  }))
])
const monthLabel = computed(() => new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(displayedMonth.value))
const selectedDateLabel = computed(() => new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' }).format(dateFromKey(selectedDate.value)))
const isCurrentMonth = computed(() => displayedMonth.value.getFullYear() === now.getFullYear() && displayedMonth.value.getMonth() === now.getMonth())
const dayCounts = computed(() => {
  const countsByDate = Object.create(null)
  for (const deadline of deadlines.value) {
    const counts = countsByDate[deadline.due_date] || (countsByDate[deadline.due_date] = emptyDayCounts())
    counts.total++
    if (deadline.status === 'completed') counts.completed++
    else if (deadline.overdue) counts.overdue++
    else if (deadline.due_soon) counts.dueSoon++
    else counts.pending++
  }
  return countsByDate
})
const calendarDays = computed(() => {
  const year = displayedMonth.value.getFullYear()
  const month = displayedMonth.value.getMonth()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - firstWeekday + 1)
    const key = dateKey(date)
    return {
      date: key,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: key === todayKey,
      isSelected: key === selectedDate.value,
      counts: dayCounts.value[key] || emptyDayCounts()
    }
  })
})
const selectedDayDeadlines = computed(() => deadlines.value.filter((deadline) => deadline.due_date === selectedDate.value))
const selectedDayCounts = computed(() => dayCounts.value[selectedDate.value] || emptyDayCounts())
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
const completedCount = computed(() => deadlines.value.filter((deadline) => deadline.status === 'completed').length)
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

  const queryFilters = visibleMonthFilters()
  if (!queryFilters) {
    isLoading.value = false
    return
  }

  try {
    const result = await getDeadlines(queryFilters)
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

function applyFilters() {
  const dateToPositionCalendar = filters.due_date_from || filters.due_date_to
  if (dateToPositionCalendar) {
    const date = dateFromKey(dateToPositionCalendar)
    displayedMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
    selectedDate.value = dateKey(date)
  }
  loadDeadlines()
}

function visibleMonthFilters() {
  if (filters.due_date_from && filters.due_date_to && filters.due_date_from > filters.due_date_to) {
    return { ...filters }
  }

  const year = displayedMonth.value.getFullYear()
  const month = displayedMonth.value.getMonth()
  let dueDateFrom = dateKey(new Date(year, month, 1))
  let dueDateTo = dateKey(new Date(year, month + 1, 0))
  if (filters.due_date_from > dueDateFrom) dueDateFrom = filters.due_date_from
  if (filters.due_date_to && filters.due_date_to < dueDateTo) dueDateTo = filters.due_date_to
  if (dueDateFrom > dueDateTo) return null

  return { ...filters, due_date_from: dueDateFrom, due_date_to: dueDateTo }
}

function moveMonth(offset) {
  const current = displayedMonth.value
  const next = new Date(current.getFullYear(), current.getMonth() + offset, 1)
  const selectedDay = Number(selectedDate.value.slice(8, 10))
  const finalDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  displayedMonth.value = next
  selectedDate.value = dateKey(new Date(next.getFullYear(), next.getMonth(), Math.min(selectedDay, finalDay)))
  loadDeadlines()
}

function goToCurrentMonth() {
  const monthChanged = !isCurrentMonth.value
  displayedMonth.value = new Date(now.getFullYear(), now.getMonth(), 1)
  selectedDate.value = todayKey
  if (monthChanged) loadDeadlines()
}

function selectDay(day) {
  selectedDate.value = day.date
  if (!day.inMonth) {
    const date = dateFromKey(day.date)
    displayedMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
    loadDeadlines()
  }
}

function calendarDayLabel(day) {
  const date = dateFromKey(day.date)
  const dateLabel = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' }).format(date)
  return day.counts.total ? `${dateLabel}, ${day.counts.total} ${day.counts.total === 1 ? 'tarea' : 'tareas'}` : dateLabel
}

function emptyDayCounts() {
  return { total: 0, pending: 0, dueSoon: 0, overdue: 0, completed: 0 }
}

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateFromKey(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function openCreate() {
  resetForm()
  form.due_date = selectedDate.value
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

function deadlineTaskClass(deadline) {
  if (deadline.overdue) return 'task-overdue'
  if (deadline.due_soon) return 'task-soon'
  return deadline.status === 'completed' ? 'task-completed' : 'task-pending'
}

</script>
