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
          <Zap :size="20" class="panel-icon" aria-hidden="true" />
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
          <Info :size="20" class="panel-icon" aria-hidden="true" />
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
import { Zap, Info } from '@lucide/vue'
import '../../assets/css/HomePage.css'

const userName = ref('')
</script>