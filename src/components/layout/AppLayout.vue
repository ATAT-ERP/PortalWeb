<template>
  <div class="app-shell">
    <div
      v-if="sidebarOpen"
      class="backdrop"
      @click="sidebarOpen = false"
    ></div>

    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-top">
        <div class="brand-row">
          <span class="logo-mark">AT</span>
          <span class="brand-name">A.T.A.T. ERP</span>
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
          <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
            <path d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V9.5Z"
              stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
          Inicio
        </router-link>

        <router-link
          to="/cuenta"
          class="nav-link"
          :class="{ active: route.path === '/cuenta' }"
          @click="sidebarOpen = false"
        >
          <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="6.5" r="3" stroke="currentColor" stroke-width="1.5" />
            <path d="M3.5 17c0-3 3-5 6.5-5s6.5 2 6.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Mi cuenta
        </router-link>

        <!-- Los módulos futuros se agregan acá como nuevos router-link,
             sin tocar el resto del layout. -->
      </nav>

      <button type="button" class="logout-btn" @click="handleLogout" :disabled="loggingOut">
        <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 3H5a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 5 17h2.5"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M12.5 13.5 16 10l-3.5-3.5M16 10H7.5"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
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
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
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