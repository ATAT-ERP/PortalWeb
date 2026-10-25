<template>
  <div class="app-shell">
    <div v-if="sidebarOpen" class="backdrop" @click="sidebarOpen = false"></div>

    <aside
      class="sidebar"
      :class="{ open: sidebarOpen, expanded: dropdownOpen }"
      aria-label="Navegación principal"
    >
      <div class="sidebar-top">
        <div class="layout-brand-row">
          <span class="layout-logo-mark">AT</span>
          <span class="nav-label layout-brand-name">A.T.A.T. ERP</span>
        </div>

        <div ref="selectorRef" class="company-selector">
          <button
            type="button"
            class="company-select-btn"
            aria-controls="company-dropdown"
            :aria-expanded="dropdownOpen"
            :aria-label="`Empresa activa: ${companyLabel}`"
            :disabled="isLoadingCompanies || companies.length === 0"
            @click="dropdownOpen = !dropdownOpen"
          >
            <span class="company-avatar" aria-hidden="true">{{ companyInitial }}</span>
            <span class="nav-label company-select-content">
              <span class="company-select-info">
                <span class="company-select-tag">Empresa activa</span>
                <span class="company-name">{{ companyLabel }}</span>
              </span>
              <ChevronDown class="chevron-icon" :class="{ open: dropdownOpen }" aria-hidden="true" />
            </span>
          </button>

          <div v-if="dropdownOpen" id="company-dropdown" class="company-dropdown-menu">
            <button
              v-for="company in companies"
              :key="company.id"
              type="button"
              :class="['dropdown-option', { active: activeCompany && company.id === activeCompany.id }]"
              @click="handleCompanySelect(company)"
            >
              <span class="option-name">{{ company.name }}</span>
              <Check
                v-if="activeCompany && company.id === activeCompany.id"
                class="check-icon"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <nav class="nav-list" aria-label="Secciones">
        <router-link
          to="/home"
          class="nav-link"
          :class="{ active: route.path === '/home' }"
          @click="sidebarOpen = false"
        >
          <Home class="nav-icon" aria-hidden="true" />
          <span class="nav-label">Inicio</span>
        </router-link>

        <router-link
          to="/cuenta"
          class="nav-link"
          :class="{ active: route.path === '/cuenta' }"
          @click="sidebarOpen = false"
        >
          <UserRound class="nav-icon" aria-hidden="true" />
          <span class="nav-label">Mi cuenta</span>
        </router-link>

        <router-link
          to="/companies"
          class="nav-link"
          :class="{ active: route.path.startsWith('/companies') }"
          @click="sidebarOpen = false"
        >
          <Building2 class="nav-icon" aria-hidden="true" />
          <span class="nav-label">Compañías</span>
        </router-link>

        <router-link
          to="/documents"
          class="nav-link"
          :class="{ active: route.path.startsWith('/documents') }"
          @click="sidebarOpen = false"
        >
          <FileText class="nav-icon" aria-hidden="true" />
          <span class="nav-label">Documentos</span>
        </router-link>
      </nav>

      <button type="button" class="logout-btn" :disabled="loggingOut" @click="handleLogout">
        <LogOut class="nav-icon" aria-hidden="true" />
        <span class="nav-label">{{ loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión' }}</span>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Building2, Check, ChevronDown, FileText, Home, UserRound, LogOut, Menu } from '@lucide/vue'
import { logout } from '../../services/user.service'
import { clearSession } from '../../services/session.service'
import { activeCompany, companies, isLoadingCompanies, loadCompanies, selectCompany } from '../../stores/company.store'
import '../../assets/css/AppLayout.css'

const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const dropdownOpen = ref(false)
const loggingOut = ref(false)
const selectorRef = ref(null)

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

const companyInitial = computed(
  () => activeCompany.value?.name?.trim()?.[0]?.toUpperCase() ?? '?'
)

function handleOutsideClick(event) {
  if (dropdownOpen.value && selectorRef.value && !selectorRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape') dropdownOpen.value = false
}

onMounted(async () => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)

  try {
    await loadCompanies()
  } catch (error) {
    if (error.status === 401 && error.code === 'NEX-USR-010') {
      clearSession()
      router.push('/login')
    }
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
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
    // Si la llamada remota falla igual limpiamos la sesión local
  } finally {
    clearSession()
    loggingOut.value = false
    router.push('/login')
  }
}
</script>