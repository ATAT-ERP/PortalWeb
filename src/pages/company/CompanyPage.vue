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
      <p v-else-if="searching" class="company-state">Buscando compañías...</p>
      <p v-else-if="companies.length === 0" class="company-state">
        {{ hasSearched ? 'No se encontraron compañías para la búsqueda.' : 'Buscá una compañía para ver los resultados.' }}
      </p>

      <ul v-else class="company-list">
        <li v-for="company in companies" :key="company.id" class="company-row">
          <span class="company-row-icon" aria-hidden="true">
            <Building2 :size="18" />
          </span>
          <div class="company-row-text">
            <strong>{{ company.name }}</strong>
            <span>{{ typeLabel(company.type) }}{{ company.address_city ? ` · ${company.address_city}` : '' }}</span>
          </div>
          <span v-if="company.tax_id" class="company-row-cuit">{{ company.tax_id }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Plus, Search } from '@lucide/vue'
import { searchCompanies } from '../../services/company.service'
import { clearSession, getSession } from '../../services/session.service'
import '../../assets/css/CompanyPage.css'

const router = useRouter()

const query = ref('')
const companies = ref([])
const searching = ref(false)
const hasSearched = ref(false)
const errorMessage = ref('')

function typeLabel(type) {
  return type === 'organization' ? 'Organización' : 'Autónomo / individual'
}

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