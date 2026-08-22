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
</script>

<style scoped>
.index-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1.5rem;
  color: #1f2937;
  background: #f8fafc;
}

.site-header,
.index-main,
.site-footer {
  width: min(100%, 68rem);
  margin-inline: auto;
}

.site-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.index-main {
  display: grid;
  flex: 1;
  place-items: center;
  padding-block: 3rem;
}

.intro {
  width: min(100%, 38rem);
  padding: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: #ffffff;
}

.intro-icon {
  margin-bottom: 1rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
}

.intro p {
  margin: 1rem 0 1.5rem;
  line-height: 1.5;
}

.login-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  color: #ffffff;
  background: #374151;
  font-weight: 600;
  text-decoration: none;
}

.login-link:hover {
  background: #1f2937;
}

.login-link:focus-visible {
  outline: 2px solid #1f2937;
  outline-offset: 3px;
}

.site-footer {
  color: #4b5563;
  font-size: 0.875rem;
}

.site-footer p {
  margin: 0;
}

@media (max-width: 480px) {
  .index-page {
    padding: 1rem;
  }

  .intro {
    padding: 1.5rem;
  }
}
</style>
