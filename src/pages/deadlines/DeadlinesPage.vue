<template>
  <div class="deadlines-page">
    <header class="deadlines-header">
      <span class="deadlines-header-icon" aria-hidden="true"><CalendarDays :size="24" /></span>
      <div>
        <h1>Vencimientos</h1>
        <p>Consultá las tareas y obligaciones de todos tus clientes.</p>
      </div>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="deadline in deadlines" :key="deadline.id" :class="deadlineRowClass(deadline)">
              <td><strong>{{ deadline.name }}</strong></td>
              <td>{{ companyName(deadline.company) }}</td>
              <td>{{ deadline.period || '—' }}</td>
              <td>{{ formatDate(deadline.due_date) }}</td>
              <td><span :class="['deadlines-status', statusClass(deadline)]">{{ statusLabel(deadline) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, Search } from '@lucide/vue'
import { getCompanies } from '../../services/company.service'
import { getDeadlines } from '../../services/deadline.service'
import { clearSession } from '../../services/session.service'
import '../../assets/css/DeadlinesPage.css'

const router = useRouter()
const deadlines = ref([])
const companies = ref([])
const isLoading = ref(false)
const loadError = ref('')
const companiesError = ref('')
const filters = reactive({ company_id: '', status: '', due_date_from: '', due_date_to: '' })
const hasFilters = computed(() => Object.values(filters).some(Boolean))
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
