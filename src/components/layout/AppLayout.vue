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
          to="/"
          class="nav-link"
          :class="{ active: route.path === '/' }"
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

      <button type="button" class="logout-btn" @click="handleLogout">
        <svg class="nav-icon" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 3H5a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 5 17h2.5"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M12.5 13.5 16 10l-3.5-3.5M16 10H7.5"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Cerrar sesión
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

const route = useRoute()
const router = useRouter()

const sidebarOpen = ref(false)

// TODO: reemplazar por los datos reales del usuario autenticado
// cuando la sesión esté conectada con NexusBack.
const user = ref({ name: 'Usuario' })

const userInitials = computed(() =>
  user.value.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

function handleLogout() {
  // TODO: confirmar con Agus el endpoint/flujo real de cierre de sesión
  // (invalidar token, limpiar store de sesión, etc.) cuando esté disponible.
  router.push('/login')
}
</script>

<style scoped>
.app-shell {
  --ink: #12233d;
  --ink-soft: #5b6b81;
  --border: #e4e7e5;
  --accent: #4f7a6b;
  --brass: #b8935b;
  --surface: #f4f5f3;

  display: flex;
  min-height: 100vh;
  background: var(--surface);
  font-family: -apple-system, 'Segoe UI', Roboto, ui-sans-serif, system-ui, sans-serif;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  width: 240px;
  flex-shrink: 0;
  background: var(--ink);
  color: #f4f2ec;
  padding: 1.5rem 1.1rem;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f4f2ec;
  color: var(--ink);
  font-size: 0.72rem;
  font-weight: 700;
}

.brand-name {
  font-size: 0.88rem;
  font-weight: 600;
}

.company-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  background: rgba(244, 242, 236, 0.08);
  font-size: 0.78rem;
  color: #cfd6de;
}

.company-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  font-size: 0.88rem;
  color: #dfe4e9;
  text-decoration: none;
  transition: background 0.12s ease, color 0.12s ease;
}

.nav-link:hover {
  background: rgba(244, 242, 236, 0.08);
  color: #ffffff;
}

.nav-link.active {
  background: var(--accent);
  color: #ffffff;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #cfd6de;
  font-size: 0.86rem;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.logout-btn:hover {
  background: rgba(192, 64, 42, 0.16);
  color: #f3b9ab;
}

/* Main column */
.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid var(--border);
}

.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
}

.menu-toggle svg {
  width: 20px;
  height: 20px;
}

.topbar-spacer {
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0.5rem 0.3rem 0.3rem;
  border-radius: 999px;
  text-decoration: none;
  transition: background 0.12s ease;
}

.user-info:hover {
  background: var(--surface);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--accent);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 550;
  color: var(--ink);
}

.content-area {
  flex: 1;
  padding: 1.75rem;
}

.backdrop {
  display: none;
}

/* Responsive: sidebar off-canvas below 880px */
@media (max-width: 880px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 30;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: 12px 0 32px -12px rgba(18, 35, 61, 0.3);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .menu-toggle {
    display: flex;
  }

  .backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(18, 35, 61, 0.35);
    z-index: 20;
  }

  .content-area {
    padding: 1.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar {
    transition: none;
  }
}
</style>