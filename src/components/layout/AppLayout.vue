<template>
  <div class="app-shell">
    <div
      v-if="sidebarOpen"
      class="backdrop"
      @click="sidebarOpen = false"
    ></div>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-top">
        <div class="layout-brand-row">
          <span class="layout-logo-mark">AT</span>
          <span class="layout-brand-name">A.T.A.T. ERP</span>
        </div>

        <!-- Selector de Empresa Activa (Exacto a la imagen) -->
        <div class="company-selector">
          <button type="button" class="company-select-btn" :disabled="isLoadingCompanies || companies.length === 0" @click="dropdownOpen = !dropdownOpen">
            <div class="company-select-info">
              <span class="company-select-tag">Empresa activa</span>
              <div class="company-select-value">
                <span :class="['company-dot', { inactive: !activeCompany }]"></span>
                <span class="company-name">{{ companyLabel }}</span>
              </div>
            </div>
            <svg class="chevron-icon" :class="{ open: dropdownOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <!-- Menú desplegable flotante -->
          <div v-if="dropdownOpen" class="company-dropdown-menu">
            <button
              v-for="company in companies"
              :key="company.id"
              type="button"
              :class="['dropdown-option', { active: activeCompany && company.id === activeCompany.id }]"
              @click="handleCompanySelect(company)"
            >
              <span :class="['company-dot', { inactive: !activeCompany || company.id !== activeCompany.id }]"></span>
              <span class="option-name">{{ company.name }}</span>
              <svg v-if="activeCompany && company.id === activeCompany.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <nav class="nav-list">
        <router-link
          to="/home"
          class="nav-link"
          :class="{ active: route.path === '/home' }"
          @click="sidebarOpen = false"
        >
          <Home class="nav-icon" aria-hidden="true" />
          Inicio
        </router-link>

        <router-link
          to="/cuenta"
          class="nav-link"
          :class="{ active: route.path === '/cuenta' }"
          @click="sidebarOpen = false"
        >
          <UserRound class="nav-icon" aria-hidden="true" />
          Mi cuenta
        </router-link>

        <router-link
          to="/companies"
          class="nav-link"
          :class="{ active: route.path.startsWith('/companies') }"
          @click="sidebarOpen = false"
        >
          <Building2 class="nav-icon" aria-hidden="true" />
          Compañías
        </router-link>

        <router-link to="/documents" class="nav-link" :class="{ active: route.path.startsWith('/documents') }"
          @click="sidebarOpen = false">
          <FileText class="nav-icon" aria-hidden="true" />
          Documentos
        </router-link>
      </nav>

      <button type="button" class="logout-btn" @click="handleLogout" :disabled="loggingOut">
        <LogOut class="nav-icon" aria-hidden="true" />
        {{ loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión' }}
      </button>
    </aside>

    <div class="main-column">
      <header class="topbar">
        <button
          type="button"
          class="menu-toggle"
          aria-label="Abrir navegación"
          @click="sidebarOpen = true"
        >
          <Menu aria-hidden="true" />
        </button>

        <div class="topbar-spacer"></div>

        <router-link to="/cuenta" class="user-info">
          <span class="user-avatar">{{ userInitials }}</span>
          <span class="user-name">{{ user.name }}</span>
        </router-link>
      </header>

      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Building2, FileText, Home, UserRound, LogOut, Menu } from '@lucide/vue'
import { logout } from '../../services/user.service'
import { clearSession } from '../../services/session.service'
import { activeCompany, companies, isLoadingCompanies, loadCompanies, selectCompany } from '../../stores/company.store'
import '../../assets/css/AppLayout.css'

const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const dropdownOpen = ref(false)
const loggingOut = ref(false)

const user = ref({ name: 'Usuario' })

const userInitials = computed(() =>
  user.value.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

const companyLabel = computed(() => {
  if (isLoadingCompanies.value) return 'Cargando compañías...'
  if (activeCompany.value) return activeCompany.value.name
  return companies.value.length ? 'Seleccioná una compañía' : 'Sin compañías'
})

onMounted(async () => {
  try {
    await loadCompanies()
  } catch (error) {
    if (error.status === 401 && error.code === 'NEX-USR-010') {
      clearSession()
      router.push('/login')
    }
  }
})

function handleCompanySelect(company) {
  selectCompany(company)
  dropdownOpen.value = false
}

async function handleLogout() {
  loggingOut.value = true
  try {
    await logout()
  } catch (error) {
    // Si la llamada falla igual limpiamos la sesión local
  } finally {
    clearSession()
    loggingOut.value = false
    router.push('/login')
  }
}
</script>