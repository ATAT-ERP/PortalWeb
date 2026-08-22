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
import '../../assets/css/HomePage.css'

const userName = ref('')
</script>

