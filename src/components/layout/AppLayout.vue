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

        <!-- TODO: reemplazar por selector real de empresa activa cuando se
            implemente soporte de múltiples empresas por usuario. -->
        <div class="company-chip">
          <span class="company-dot"></span>
          <span class="company-label">Empresa activa</span>
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

        <!-- Los módulos futuros se agregan acá como nuevos router-link,
            sin tocar el resto del layout. -->
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, UserRound, LogOut, Menu } from '@lucide/vue'
import { logout } from '../../services/user.service'
import { clearSession, getAccessToken } from '../../services/session.service'
import '../../assets/css/AppLayout.css'

const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)
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

async function handleLogout() {
  loggingOut.value = true
  const token = getAccessToken()

  try {
    if (token) {
      await logout(token)
    }
  } catch (error) {
    // Si la llamada remota falla (red caída, token ya vencido, etc.),
    // igual limpiamos la sesión local: el objetivo del issue #7 es que
    // una sesión inválida no pueda seguir usando el Portal, con o sin
    // respuesta exitosa del backend.
  } finally {
    clearSession()
    loggingOut.value = false
    router.push('/login')
  }
}
</script>