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

    <!-- Tarjeta "Mi compañía" idéntica a la imagen -->
    <article class="company-card">
      <div class="company-card-header">
        <div class="company-card-icon">
          <Building2 :size="24" />
        </div>
        <div class="company-card-title">
          <h2>Mi compañía</h2>
          <p>Información de la compañía activa</p>
        </div>
      </div>

      <div class="company-card-body">
        <div class="info-group">
          <span class="info-label">Nombre</span>
          <span class="info-value">TechSolutions Test</span>
        </div>
        <div class="info-group">
          <span class="info-label">CUIT</span>
          <span class="info-value">20389123456</span>
        </div>
        <div class="info-group">
          <span class="info-label">Razón social</span>
          <span class="info-value">TechSolutions S.R.L.</span>
        </div>
        <div class="info-group">
          <span class="info-label">Tipo de actividad</span>
          <span class="info-value">Autónomo / individual</span>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Zap, Info, Building2 } from '@lucide/vue'
import '../../assets/css/HomePage.css'

const userName = ref('')
</script>