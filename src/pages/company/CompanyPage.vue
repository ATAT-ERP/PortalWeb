<template>
  <div class="company-page">
    <header class="company-header">
      <div class="company-header-icon" aria-hidden="true">
        <Building2 :size="24" />
      </div>
      <div class="company-header-text">
        <h1>Compañías</h1>
        <p>Administrá las actividades, comercios u organizaciones registradas.</p>
      </div>
      <RouterLink to="/companies/nueva" class="company-new-link">
        <Plus :size="18" aria-hidden="true" />
        Nueva compañía
      </RouterLink>
    </header>

    <section class="company-card">
      <form class="company-search-form" @submit.prevent="handleSearch">
        <input
          v-model="query"
          type="search"
          placeholder="Buscar por nombre, razón social o CUIT"
          aria-label="Buscar compañías"
          :disabled="searching"
        />
        <button type="submit" class="company-search-button" :disabled="searching">
          <Search :size="18" aria-hidden="true" />
          <span>{{ searching ? 'Buscando...' : 'Buscar' }}</span>
        </button>
      </form>
    </section>

    <section class="company-card">
      <p v-if="errorMessage" class="company-state company-state-error" role="alert">{{ errorMessage }}</p>
      <p v-else-if="loading" class="company-state">Cargando compañías...</p>
      <p v-else-if="searching" class="company-state">Buscando compañías...</p>
      <p v-else-if="companies.length === 0" class="company-state">
        {{ hasSearched ? 'No se encontraron compañías para la búsqueda.' : 'No hay compañías registradas.' }}
      </p>

      <ul v-else class="company-list">
        <li v-for="company in companies" :key="company.id" class="company-row">
          <span class="company-row-icon" aria-hidden="true">
            <Building2 :size="18" />
          </span>
          <div class="company-row-text">
            <strong>{{ company.name }}</strong>
            <span v-if="company.legal_name" class="company-row-legal">{{ company.legal_name }}</span>
            <span class="company-row-meta">{{ typeLabel(company.type) }}{{ company.address_city ? ` · ${company.address_city}` : '' }}</span>
          </div>
          <div class="company-row-badges">
            <span v-if="company.tax_id" class="company-row-cuit">{{ company.tax_id }}</span>
            <span :class="['company-row-status', company.is_active ? 'company-row-status-active' : 'company-row-status-inactive']">
              {{ company.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <RouterLink :to="`/companies/${company.id}/edit`" class="company-row-action" aria-label="Editar compañía">
            <Edit2 :size="18" aria-hidden="true" />
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Plus, Search, Edit2 } from '@lucide/vue'
import { getCompanies, searchCompanies } from '../../services/company.service'
import { clearSession, getSession } from '../../services/session.service'
import '../../assets/css/CompanyPage.css'

const router = useRouter()

const query = ref('')
const companies = ref([])
const loading = ref(false)
const searching = ref(false)
const hasSearched = ref(false)
const errorMessage = ref('')

function typeLabel(type) {
  return type === 'organization' ? 'Organización' : 'Autónomo / individual'
}

async function loadCompanies() {
  loading.value = true
  errorMessage.value = ''

  const session = getSession()
  if (!session?.access_token) {
    clearSession()
    router.push('/login')
    return
  }

  try {
    companies.value = await getCompanies(session.access_token)
    hasSearched.value = false
    query.value = ''
  } catch (error) {
    if (error.status === 401 && error.code === 'NEX-USR-010') {
      clearSession()
      router.push('/login')
      return
    }
    companies.value = []
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo cargar el listado. Intentá nuevamente.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCompanies()
})

async function handleSearch() {
  if (searching.value) return

  errorMessage.value = ''

  const session = getSession()
  if (!session?.access_token) {
    clearSession()
    router.push('/login')
    return
  }

  searching.value = true
  hasSearched.value = true

  try {
    companies.value = await searchCompanies(query.value.trim(), session.access_token)
  } catch (error) {
    if (error.status === 401 && error.code === 'NEX-USR-010') {
      clearSession()
      router.push('/login')
      return
    }
    companies.value = []
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo realizar la búsqueda. Intentá nuevamente.'
  } finally {
    searching.value = false
  }
}
</script>