<template>
  <div class="app-shell" @keydown.esc.window="sidebarOpen = false">
    <div v-if="sidebarOpen" class="backdrop" @click="sidebarOpen = false"></div>

    <aside
      class="sidebar"
      :class="{ open: sidebarOpen, expanded: companySelectOpen }"
      aria-label="Navegación principal"
    >
      <div class="sidebar-top">
        <div class="company-selector" :title="companyLabel">
          <Select
            ref="companySelectRef"
            :model-value="activeCompany"
            :options="companies"
            option-label="name"
            data-key="id"
            :placeholder="companyLabel"
            :loading="isLoadingCompanies"
            :aria-label="`Empresa activa: ${companyLabel}`"
            panel-class="company-select-panel"
            class="company-select"
            @update:model-value="handleCompanySelect"
            @show="companySelectOpen = true"
            @hide="companySelectOpen = false"
          >
            <template #value="{ value }">
              <span class="company-select-value">
                <span class="company-icon-wrap" aria-hidden="true">
                  <Building2 class="company-icon" />
                </span>
                <span class="nav-label company-select-content">
                  <span class="company-select-info">
                    <span class="company-select-tag">Empresa activa</span>
                    <span class="company-name">{{ value ? value.name : companyLabel }}</span>
                  </span>
                </span>
              </span>
            </template>

            <template #dropdownicon>
              <ChevronDown class="company-chevron" aria-hidden="true" />
            </template>

            <template #footer>
              <RouterLink
                to="/companies"
                class="company-manage-link"
                @click="handleManageCompanies"
              >
                <Building2 aria-hidden="true" />
                Administrar compañías
              </RouterLink>
            </template>
          </Select>
        </div>
      </div>

      <nav class="nav-list" aria-label="Secciones">
        <template v-for="item in navItems" :key="item.label">
          <button
            v-if="item.children && item.children.length"
            type="button"
            class="nav-link nav-group-toggle"
            :class="{ active: isNavItemActive(item) }"
            :title="item.label"
            :aria-expanded="isGroupOpen(item)"
            @click="toggleGroup(item)"
          >
            <span class="nav-icon-wrap">
              <component :is="item.icon" class="nav-icon" aria-hidden="true" />
            </span>
            <span class="nav-label nav-link-label">{{ item.label }}</span>
            <ChevronDown v-if="isGroupOpen(item)" class="nav-group-chevron" aria-hidden="true" />
            <ChevronRight v-else class="nav-group-chevron" aria-hidden="true" />
          </button>
          <RouterLink
            v-else
            :to="item.to"
            class="nav-link"
            :class="{ active: isRouteActive(item.to) }"
            :title="item.label"
            @click="sidebarOpen = false"
          >
            <span class="nav-icon-wrap">
              <component :is="item.icon" class="nav-icon" aria-hidden="true" />
            </span>
            <span class="nav-label nav-link-label">{{ item.label }}</span>
          </RouterLink>

          <div v-if="item.children && item.children.length && isGroupOpen(item)" class="nav-submenu">
            <template v-for="child in item.children" :key="child.label">
              <button v-if="child.disabled" type="button" class="nav-link nav-sublink nav-link-disabled" :title="child.label" disabled>
                <span class="nav-icon-wrap">
                  <component :is="child.icon" class="nav-icon" aria-hidden="true" />
                </span>
                <span class="nav-label nav-link-label">{{ child.label }}</span>
              </button>
              <RouterLink
                v-else
                :to="child.to"
                class="nav-link nav-sublink"
                :class="{ active: isRouteActive(child.to) }"
                :title="child.label"
                @click="sidebarOpen = false"
              >
                <span class="nav-icon-wrap">
                  <component :is="child.icon" class="nav-icon" aria-hidden="true" />
                </span>
                <span class="nav-label nav-link-label">{{ child.label }}</span>
              </RouterLink>
            </template>
          </div>
        </template>
      </nav>

      <div class="sidebar-bottom">
        <RouterLink
          to="/cuenta"
          class="nav-link"
          :class="{ active: isRouteActive('/cuenta') }"
          title="Mi cuenta"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon-wrap">
            <UserRound class="nav-icon" aria-hidden="true" />
          </span>
          <span class="nav-label nav-link-label">Mi cuenta</span>
        </RouterLink>

        <button type="button" class="logout-btn" :disabled="loggingOut" @click="handleLogout">
          <span class="nav-icon-wrap">
            <LogOut class="nav-icon" aria-hidden="true" />
          </span>
          <span class="nav-label nav-link-label">{{ loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión' }}</span>
        </button>
      </div>
    </aside>

    <div class="main-column">
      <div class="mobile-nav-bar">
        <button
          type="button"
          class="menu-toggle"
          aria-label="Abrir navegación"
          @click="sidebarOpen = true"
        >
          <Menu aria-hidden="true" />
        </button>
      </div>

      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Building2, ChevronDown, ChevronRight, Cloud, FileText, Home, LogOut, Menu, ReceiptText, UserRound } from '@lucide/vue'
import Select from 'primevue/select'
import { logout } from '../../services/user.service'
import { clearSession } from '../../services/session.service'
import { activeCompany, companies, isLoadingCompanies, loadCompanies, selectCompany } from '../../stores/company.store'
import '../../assets/css/AppLayout.css'

const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
const companySelectOpen = ref(false)
const companySelectRef = ref(null)
const expandedGroups = ref(new Map())
const loggingOut = ref(false)

const navItems = [
  { label: 'Inicio', to: '/home', icon: Home },
  { label: 'Cloud', to: '/documents', icon: Cloud },
  {
    label: 'Facturación', icon: ReceiptText, children: [
      { label: 'Facturas', icon: FileText, disabled: true },
      { label: 'Comprobantes', to: '/billing/invoices', icon: ReceiptText },
      { label: 'Notas de crédito', icon: FileText, disabled: true },
      { label: 'Perfil fiscal', to: '/billing/fiscal-profile', icon: Building2 }
    ]
  }
]

const companyLabel = computed(() => {
  if (isLoadingCompanies.value) return 'Cargando compañías...'
  if (activeCompany.value) return activeCompany.value.name
  return companies.value.length ? 'Seleccioná una compañía' : 'Sin compañías'
})

function isRouteActive(path) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function isNavItemActive(item) {
  if (item.to) return isRouteActive(item.to)
  return item.children && item.children.some((child) => child.to && isRouteActive(child.to))
}

function isGroupOpen(item) {
  return expandedGroups.value.has(item.label)
    ? expandedGroups.value.get(item.label)
    : isNavItemActive(item)
}

function toggleGroup(item) {
  const groups = new Map(expandedGroups.value)
  groups.set(item.label, !isGroupOpen(item))
  expandedGroups.value = groups
}

function handleManageCompanies() {
  sidebarOpen.value = false
  companySelectRef.value.hide()
}

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
