<template>
  <RouterLink :to="to" class="back-link" :aria-label="label" :title="label">
    <ArrowLeft :size="20" aria-hidden="true" />
  </RouterLink>
</template>

<script setup>
import { ArrowLeft } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import '../assets/css/BackLink.css'

defineProps({
  to: { type: [String, Object], required: true },
  label: { type: String, default: 'Volver' }
})
</script>
