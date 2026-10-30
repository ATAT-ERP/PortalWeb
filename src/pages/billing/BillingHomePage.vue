<template>
  <div class="billing-home">
    <header class="billing-home-header">
      <h1>Facturación</h1>
      <p>Gestioná facturas, comprobantes y la configuración fiscal de tus clientes.</p>
    </header>

    <nav class="billing-home-grid" aria-label="Opciones de facturación">
      <RouterLink v-for="item in links" :key="item.to" :to="item.to" class="billing-home-card">
        <component :is="item.icon" class="billing-home-icon" :size="24" aria-hidden="true" />
        <span class="billing-home-copy">
          <strong>{{ item.title }}</strong>
          <span>{{ item.description }}</span>
        </span>
        <ArrowUpRight class="billing-home-arrow" :size="19" aria-hidden="true" />
      </RouterLink>
    </nav>
    <BackLink to="/home" label="Volver a Inicio" />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import BackLink from '../../components/BackLink.vue'
import { ArrowUpRight, FileMinus, FilePlus, Files, Landmark, Store } from '@lucide/vue'
import '../../assets/css/BillingHomePage.css'

const links = [
  { title: 'Facturas', description: 'Creá borradores y emití facturas internas.', icon: FilePlus, to: '/billing/invoice-form' },
  { title: 'Comprobantes', description: 'Consultá el historial y descargá comprobantes.', icon: Files, to: '/billing/invoices' },
  { title: 'Notas de crédito', description: 'Registrá y emití notas de crédito.', icon: FileMinus, to: '/billing/credit-notes' },
  { title: 'Perfil fiscal', description: 'Administrá la información fiscal de la compañía.', icon: Landmark, to: '/billing/fiscal-profile' },
  { title: 'Puntos de venta', description: 'Configurá los puntos de emisión de comprobantes.', icon: Store, to: '/billing/points-of-sale' }
]
</script>
