<template>
  <footer class="app-footer">
    <div class="app-footer-content">
      <div class="app-footer-brand">
        <img class="app-footer-logo" src="../../assets/img/logoATAT.svg" alt="A.T.A.T. ERP" />
      </div>

      <section class="app-footer-contact" aria-labelledby="footer-contact-title">
        <h2 id="footer-contact-title">Contacto</h2>
        <div class="app-footer-contact-icons">
          <span class="app-footer-contact-icon" role="img" title="Ubicación" aria-label="Ubicación"><MapPin :size="21" aria-hidden="true" /></span>
          <span class="app-footer-contact-icon" role="img" title="Correo" aria-label="Correo"><Mail :size="21" aria-hidden="true" /></span>
        </div>
        <small class="app-footer-copyright">© 2026 A.T.A.T. ERP</small>
      </section>
    </div>

  </footer>
</template>

<script setup>
import { Mail, MapPin } from '@lucide/vue'
import '../../assets/css/AppFooter.css'
</script>
