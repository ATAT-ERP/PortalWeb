<template>
  <div class="index-page">
    <header class="site-header">
      <p class="site-name">A.T.A.T.</p>
    </header>

    <main class="index-main">
      <section class="intro" aria-labelledby="index-title">
        <AppWindow class="intro-icon" :size="32" aria-hidden="true" />
        <h1 id="index-title">Portal A.T.A.T. ERP</h1>
        <p>
          Accedé al portal de gestión para consultar y administrar la información de tu organización.
        </p>
        <RouterLink to="/login" class="login-link">
          <LogIn :size="18" aria-hidden="true" />
          Iniciar sesión
        </RouterLink>
      </section>
    </main>

    <footer class="site-footer">
      <p>Portal de gestión A.T.A.T. ERP</p>
    </footer>
  </div>
</template>

<script setup>
import { AppWindow, LogIn } from '@lucide/vue'
import '../assets/css/IndexPage.css'
</script>

