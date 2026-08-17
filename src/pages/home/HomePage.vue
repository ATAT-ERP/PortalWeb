<template>
  <div class="dashboard">
    <header class="welcome-card">
      <div class="welcome-text">
        <h1>¡Hola{{ userName ? `, ${userName}` : '' }}!</h1>
        <p>Te damos la bienvenida al Portal de A.T.A.T. ERP. Seleccioná una opción del menú lateral para empezar.</p>
      </div>
    </header>

    <section class="panel-grid">
      <article class="panel">
        <header class="panel-header">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" class="panel-icon" aria-hidden="true">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <h2>Accesos rápidos</h2>
        </header>
        <div class="panel-content">
          <p class="panel-empty">
            Todavía no hay accesos configurados. Acá vas a poder acceder directamente a los módulos que uses con más frecuencia.
          </p>
        </div>
      </article>

      <article class="panel">
        <header class="panel-header">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" class="panel-icon" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <h2>Información</h2>
        </header>
        <div class="panel-content">
          <p class="panel-empty">
            Este espacio mostrará novedades, tareas pendientes e información de la empresa activa a medida que los módulos se encuentren disponibles.
          </p>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// TODO: Reemplazar por el nombre real del usuario autenticado.
// Consultar con Agus el endpoint correspondiente antes de definir el contrato de datos.
const userName = ref('')
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.welcome-card {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 1px 3px rgba(18, 35, 61, 0.04);
}

.welcome-text h1 {
  margin: 0 0 0.35rem;
  font-size: 1.4rem;
  font-weight: 650;
  color: var(--ink);
}

.welcome-text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ink-soft);
  line-height: 1.4;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.panel {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  box-shadow: 0 1px 3px rgba(18, 35, 61, 0.04);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.panel-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.panel h2 {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--ink);
}

.panel-content {
  background: #f8fafc;
  border: 1px dashed var(--border);
  border-radius: 10px;
  padding: 1rem;
}

.panel-empty {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--ink-soft);
}
</style>