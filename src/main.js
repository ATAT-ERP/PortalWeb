import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/global.css'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

createApp(App)
  .use(router)
  .use(PrimeVue, { theme: { preset: Aura, options: { darkModeSelector: false } } })
  .mount('#app')
