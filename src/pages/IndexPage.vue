<template>
  <div class="index-page">
    <header class="index-header">
      <RouterLink to="/" class="index-brand" aria-label="A.T.A.T. ERP, inicio">
        <span class="index-brand-mark">AT</span><span>A.T.A.T. ERP</span>
      </RouterLink>
      <nav class="index-nav" aria-label="Navegación principal">
        <a href="#funciones">Funciones</a><a href="#publico">Para quién</a><a href="#objetivo">Objetivo</a>
      </nav>
      <div class="index-header-actions">
        <RouterLink to="/register" class="index-header-register">Crear cuenta</RouterLink>
        <RouterLink to="/login" class="index-header-login">Iniciar sesión <LogIn :size="16" aria-hidden="true" /></RouterLink>
      </div>
    </header>

    <main class="index-content">
      <section class="index-hero" aria-labelledby="index-title">
        <div class="index-hero-copy">
          <p class="index-eyebrow">ERP contable para gestión diaria</p>
          <h1 id="index-title" class="index-hero-title">Gestión contable simple para PyMEs y contadores</h1>
          <p class="index-hero-description">Centralizá empresas, información y tareas contables en un solo lugar para trabajar con más claridad cada día.</p>
          <div class="index-hero-actions">
            <RouterLink to="/login" class="index-button index-button-primary"><LogIn :size="18" aria-hidden="true" />Iniciar sesión</RouterLink>
            <a href="#funciones" class="index-button index-button-secondary">Ver funciones<ArrowRight :size="18" aria-hidden="true" /></a>
          </div>
        </div>

        <aside class="index-preview" aria-label="Vista demo del panel mensual">
          <div class="index-preview-topline">
            <div><p class="index-preview-label">Resumen financiero</p><h2>Panel mensual</h2></div>
            <span class="index-demo-badge">Vista demo</span>
          </div>
          <div class="index-preview-summary">
            <div class="index-summary-item"><span class="index-summary-icon index-summary-icon-income"><TrendingUp :size="18" aria-hidden="true" /></span><div><span>Ingresos del mes</span><strong>$ 1.280.000</strong></div></div>
            <div class="index-summary-item"><span class="index-summary-icon index-summary-icon-expense"><TrendingDown :size="18" aria-hidden="true" /></span><div><span>Egresos del mes</span><strong>$ 740.000</strong></div></div>
          </div>
          <div class="index-preview-metrics">
            <div><FileWarning :size="18" aria-hidden="true" /><span>Facturas pendientes</span><strong>18</strong></div>
            <div><Building2 :size="18" aria-hidden="true" /><span>Empresas activas</span><strong>6</strong></div>
          </div>
          <div class="index-cash-flow">
            <div class="index-cash-flow-header"><span>Flujo de efectivo</span><strong>72%</strong></div>
            <div class="index-progress" role="progressbar" aria-label="Flujo de efectivo" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100"><span></span></div>
          </div>
        </aside>
      </section>

      <section id="funciones" class="index-section" aria-labelledby="index-features-title">
        <div class="index-section-heading"><p class="index-eyebrow">Todo lo esencial</p><h2 id="index-features-title">Funciones para organizar la gestión diaria</h2></div>
        <div class="index-feature-grid">
          <article class="index-feature-card"><FileText class="index-feature-icon" :size="22" aria-hidden="true" /><h3>Facturación</h3><p>Ordená comprobantes y mantené la información lista para consultar.</p></article>
          <article class="index-feature-card"><BarChart3 class="index-feature-icon" :size="22" aria-hidden="true" /><h3>Reportes</h3><p>Accedé a resúmenes claros para revisar la situación de cada empresa.</p></article>
          <article class="index-feature-card"><Building2 class="index-feature-icon" :size="22" aria-hidden="true" /><h3>Gestión multiempresa</h3><p>Trabajá con varias organizaciones desde un mismo espacio ordenado.</p></article>
          <article class="index-feature-card"><FileSpreadsheet class="index-feature-icon" :size="22" aria-hidden="true" /><h3>Importación de datos</h3><p>Incorporá información para reducir la carga manual de todos los días.</p></article>
        </div>
      </section>

      <section id="publico" class="index-section index-audience" aria-labelledby="index-audience-title">
        <div class="index-section-heading"><p class="index-eyebrow">Diseñado para acompañar</p><h2 id="index-audience-title">Una herramienta clara para distintos equipos</h2></div>
        <div class="index-audience-list">
          <article><BriefcaseBusiness :size="21" aria-hidden="true" /><div><h3>PyMEs</h3><p>Para ordenar su operación contable.</p></div></article>
          <article><Landmark :size="21" aria-hidden="true" /><div><h3>Contadores / estudios contables</h3><p>Para seguir múltiples empresas con contexto.</p></div></article>
          <article><UsersRound :size="21" aria-hidden="true" /><div><h3>Usuarios no técnicos</h3><p>Para acceder a información sin complejidad.</p></div></article>
        </div>
      </section>

      <section id="objetivo" class="index-goal" aria-labelledby="index-goal-title">
        <div class="index-goal-icon"><LayoutDashboard :size="24" aria-hidden="true" /></div>
        <div><p class="index-eyebrow">Nuestro objetivo</p><h2 id="index-goal-title">Menos tareas manuales, más información para decidir.</h2><p class="index-goal-description">Centralizá datos, accedé con claridad a la información contable y acompañá mejores decisiones en cada empresa.</p></div>
        <CheckCircle2 class="index-goal-check" :size="28" aria-hidden="true" />
      </section>
    </main>

    <footer class="site-footer"><p>Portal de gestión A.T.A.T. ERP</p></footer>
  </div>
</template>

<script setup>
import { ArrowRight, BarChart3, Building2, BriefcaseBusiness, CheckCircle2, FileSpreadsheet, FileText, FileWarning, Landmark, LayoutDashboard, LogIn, TrendingDown, TrendingUp, UsersRound } from '@lucide/vue'
import '../assets/css/IndexPage.css'
</script>
