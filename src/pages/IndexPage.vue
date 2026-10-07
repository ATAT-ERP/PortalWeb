<template>
  <div ref="landing" class="index-page" lang="es-AR">
    <a class="index-skip" href="#contenido">Saltar al contenido</a>
    <header class="index-header">
      <RouterLink to="/" class="index-brand" aria-label="A.T.A.T., inicio">A.T.A.T<span>.</span></RouterLink>
      <nav class="index-nav" aria-label="Navegación principal">
        <a href="#funciones">Qué podés hacer</a>
        <a href="#publico">Para quién</a>
      </nav>
      <Button class="index-login" :as="RouterLink" to="/login">
        Ingresar <ArrowUpRight :size="16" aria-hidden="true" />
      </Button>
    </header>

    <main id="contenido" ref="journeyContainer" class="index-content">
      <section class="index-hero" aria-labelledby="index-title">
        <p class="hero-kicker hero-enter">Software ERP</p>
        <h1 id="index-title" class="hero-enter">Tu gestión,<br /><span class="hero-dynamic-line"><span class="hero-plus" aria-hidden="true">+</span><span class="hero-plus-label">más </span><span class="hero-rotating-word"><Transition name="hero-word" mode="out-in"><span :key="heroWords[heroWordIndex]">{{ heroWords[heroWordIndex] }}.</span></Transition></span><span class="hero-fixed-word">clara.</span></span></h1>
        <p class="index-hero-description hero-enter">Un lugar para ordenar tu día a día.<br />Y dedicarle más atención a lo que viene.</p>
        <div class="index-actions hero-enter">
          <Button :as="RouterLink" to="/register">Crear mi cuenta <ArrowRight :size="18" aria-hidden="true" /></Button>
          <Button as="a" href="#funciones" severity="secondary" variant="outlined">Conocer ATAT <ArrowDown :size="17" aria-hidden="true" /></Button>
        </div>
        <div class="index-hero-details hero-enter" aria-hidden="true">
          <Building2 /><span></span><FileText /><span></span><BriefcaseBusiness />
        </div>
        <a ref="heroAnchor" href="#funciones" class="index-scroll hero-enter">Un poco de orden cambia el recorrido <ArrowDown :size="14" aria-hidden="true" /></a>
      </section>

      <section id="funciones" class="index-section" aria-labelledby="features-title">
        <div ref="featuresHeading" class="index-heading" data-reveal>
          <p class="index-eyebrow">01 / Lo esencial, conectado</p>
          <h2 id="features-title">Cada cosa en su lugar.</h2>
          <p>Las herramientas para empezar a organizar tu gestión.</p>
        </div>
        <div class="index-features">
          <article v-for="(feature, i) in features" :key="feature.title" :ref="element => featureAnchors[i] = element" data-reveal :style="{ '--delay': `${i * 80}ms` }">
            <component :is="feature.icon" :size="26" aria-hidden="true" />
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </article>
        </div>
      </section>

      <section id="beneficios" class="index-section" aria-labelledby="benefits-title">
        <div ref="benefitsHeading" class="index-heading" data-reveal>
          <p class="index-eyebrow">02 / Una forma más simple</p>
          <h2 id="benefits-title">Menos dispersión.<br />Más perspectiva.</h2>
          <p>Información organizada para trabajar con más claridad.</p>
        </div>
        <div class="index-benefits">
          <Card v-for="(benefit, i) in benefits" :key="benefit.title" :ref="element => benefitAnchors[i] = element" data-reveal :style="{ '--delay': `${i * 80}ms` }">
            <template #content>
              <component :is="benefit.icon" :size="24" aria-hidden="true" />
              <h3>{{ benefit.title }}</h3>
              <p>{{ benefit.description }}</p>
            </template>
          </Card>
        </div>
      </section>

      <section id="publico" class="index-section index-audience" aria-labelledby="audience-title">
        <div ref="audienceHeading" class="index-heading" data-reveal>
          <p class="index-eyebrow">03 / Tu manera de trabajar</p>
          <h2 id="audience-title">Detrás de cada gestión,<br />hay alguien como vos.</h2>
        </div>
        <div class="index-audience-grid">
          <article ref="audienceOne" data-reveal>
            <Store :size="26" aria-hidden="true" />
            <h3>Pequeñas PyMEs</h3>
            <p>Un espacio para reunir la información de tu empresa y tener sus documentos a mano.</p>
          </article>
          <article ref="audienceTwo" data-reveal style="--delay: 80ms">
            <Calculator :size="26" aria-hidden="true" />
            <h3>Contadores y pequeños estudios</h3>
            <p>Distintas empresas, un mismo lugar. Organizá la documentación de cada una sin perder el contexto.</p>
          </article>
        </div>
        <div ref="closingAnchor" class="index-closing" data-reveal>
          <p>Empezá por poner todo en su lugar.</p>
          <Button :as="RouterLink" to="/register">Crear mi cuenta <ArrowRight :size="18" aria-hidden="true" /></Button>
        </div>
        <div ref="endAnchor" class="index-endpoint" aria-hidden="true"></div>
      </section>
      <LandingJourney :container="journeyContainer" :anchors="journeyAnchors" />
    </main>
    <footer class="index-footer"><span class="index-brand">A.T.A.T<span>.</span></span><p>Un lugar para tu gestión.</p></footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowDown, ArrowRight, ArrowUpRight, Building2, BriefcaseBusiness, Calculator, FileText, FolderOpen, Layers3, ListChecks, Search, Store } from '@lucide/vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import LandingJourney from '../components/landing/LandingJourney.vue'
import '../assets/css/IndexPage.css'

const features = [
  { icon: Building2, title: 'Tus empresas', description: 'Registrá y actualizá empresas. Encontralas por nombre, razón social o CUIT.' },
  { icon: FolderOpen, title: 'Tus documentos', description: 'Cargá archivos y mantené la documentación asociada a cada empresa.' },
  { icon: Search, title: 'Todo a mano', description: 'Buscá documentos por nombre y descargalos cuando los necesites.' }
]
const benefits = [
  { icon: ListChecks, title: 'Más orden', description: 'Cada documento, en el contexto de su empresa.' },
  { icon: Layers3, title: 'Menos dispersión', description: 'Reuní empresas y documentos en un mismo espacio.' },
  { icon: Search, title: 'Más claridad', description: 'Encontrá la información que necesitás para seguir trabajando.' }
]
const heroWords = ['clara', 'ordenada', 'conectada', 'simple']
const heroWordIndex = ref(0)
const landing = ref(null)
const journeyContainer = ref(null)
const heroAnchor = ref(null)
const featuresHeading = ref(null)
const featureAnchors = ref([])
const benefitsHeading = ref(null)
const benefitAnchors = ref([])
const audienceHeading = ref(null)
const audienceOne = ref(null)
const audienceTwo = ref(null)
const closingAnchor = ref(null)
const endAnchor = ref(null)
const journeyAnchors = computed(() => ({
  hero: heroAnchor.value,
  featuresHeading: featuresHeading.value,
  features: featureAnchors.value,
  benefitsHeading: benefitsHeading.value,
  benefits: benefitAnchors.value,
  audienceHeading: audienceHeading.value,
  audience: [audienceOne.value, audienceTwo.value],
  closing: closingAnchor.value,
  end: endAnchor.value
}))
let observer
let motion
let heroWordTimer
function startHeroWordRotation() {
  if (!motion.matches && !heroWordTimer) {
    heroWordTimer = window.setInterval(() => {
      heroWordIndex.value = (heroWordIndex.value + 1) % heroWords.length
    }, 4200)
  }
}
function updateHeroWordRotation() {
  if (motion.matches) {
    window.clearInterval(heroWordTimer)
    heroWordTimer = undefined
    heroWordIndex.value = 0
    return
  }
  startHeroWordRotation()
}
function revealAll() {
  if (motion.matches) {
    observer.disconnect()
    landing.value.querySelectorAll('[data-reveal]').forEach(element => element.classList.remove('reveal-pending'))
  }
}
onMounted(() => {
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.classList.remove('reveal-pending')
        observer.unobserve(target)
      }
    })
  }, { threshold: 0.12 })
  if (!motion.matches) {
    landing.value.querySelectorAll('[data-reveal]').forEach(element => {
      // Content already in view (including anchor navigation) stays immediately available.
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('reveal-pending')
        observer.observe(element)
      }
    })
  }
  motion.addEventListener('change', revealAll)
  motion.addEventListener('change', updateHeroWordRotation)
  startHeroWordRotation()
})
onBeforeUnmount(() => {
  observer.disconnect()
  motion.removeEventListener('change', revealAll)
  motion.removeEventListener('change', updateHeroWordRotation)
  window.clearInterval(heroWordTimer)
})
</script>
