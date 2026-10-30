<template>
  <main class="not-found-page">
    <Card class="not-found-card">
      <template #content>
        <CircleHelp class="not-found-icon" :size="40" aria-hidden="true" />
        <p class="not-found-code">Error 404</p>
        <h1>Página no encontrada</h1>
        <p class="not-found-message">La dirección que buscás no existe o ya no está disponible.</p>
        <Button :as="RouterLink" to="/">Volver al inicio</Button>
      </template>
    </Card>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import { CircleHelp } from '@lucide/vue'
import '../assets/css/NotFoundPage.css'
</script>
