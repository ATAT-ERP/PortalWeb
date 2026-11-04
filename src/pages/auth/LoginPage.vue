<template>
  <div class="login-screen">
    <div class="login-bg-grid" aria-hidden="true"></div>

    <div class="login-card">
      <RouterLink to="/" class="login-back-link">
        <ArrowLeft :size="16" aria-hidden="true" />
        Volver al inicio
      </RouterLink>

      <div class="login-layout">
        <div class="login-sidebar">
          <div class="login-brand-row">
            <span class="login-logo-mark">AT</span>
            <div class="login-brand-text">
              <span class="login-brand-name">A.T.A.T. ERP</span>
            </div>
          </div>
          <p class="login-sidebar-subtitle">Gestión clara para tu empresa</p>
        </div>

        <div class="login-divider" aria-hidden="true"></div>

        <div class="login-main">
          <header class="login-form-header">
            <h1>Iniciar sesión</h1>
            <p>Ingresá tus credenciales para acceder al sistema.</p>
          </header>

          <form class="login-form" @submit.prevent="handleSubmit" novalidate>
            <div class="login-field" :class="{ 'login-field-invalid': touched.email && emailError }">
              <label for="email" class="login-field-label">
                <UserRound :size="16" aria-hidden="true" />
                Email
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="Ingresá tu email"
                autocomplete="email"
                required
                :disabled="loading"
                @blur="touched.email = true"
              />
              <span v-if="touched.email && emailError" class="login-field-error">{{ emailError }}</span>
            </div>

            <div class="login-field" :class="{ 'login-field-invalid': touched.password && passwordError }">
              <label for="password" class="login-field-label">
                <LockKeyhole :size="16" aria-hidden="true" />
                Contraseña
              </label>
              <div class="login-input-wrapper">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                  :disabled="loading"
                  @blur="touched.password = true"
                />
                <button
                  type="button"
                  class="login-toggle-password"
                  :disabled="loading"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" :size="18" aria-hidden="true" />
                  <Eye v-else :size="18" aria-hidden="true" />
                </button>
              </div>
              <span v-if="touched.password && passwordError" class="login-field-error">{{ passwordError }}</span>
            </div>

            <div class="login-forgot-row">
              <a href="#" class="login-forgot-link" @click.prevent>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <p v-if="formError" class="login-form-error" role="alert">{{ formError }}</p>

            <button type="submit" class="login-submit-button" :disabled="loading">
              <LogIn :size="18" aria-hidden="true" />
              <span>Ingresar</span>
            </button>

            <div class="login-links">
              <RouterLink to="/register" class="login-forgot-link">
                ¿No tenés cuenta? <strong>Registrate</strong>
              </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn, UserRound } from '@lucide/vue'
import { login } from '../../services/user.service'
import { clearSession, saveSession } from '../../services/session.service'
import '../../assets/css/LoginPage.css'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const formError = ref('')
const touched = ref({ email: false, password: false })

const emailError = computed(() => {
  if (!email.value.trim()) return 'Ingresá tu email.'
  if (!/^\S+@\S+\.\S+$/.test(email.value)) return 'Ingresá un email válido.'
  return ''
})

const passwordError = computed(() => {
  if (!password.value) return 'Ingresá tu contraseña.'
  return ''
})

const isFormValid = computed(() => !emailError.value && !passwordError.value)

async function handleSubmit() {
  touched.value.email = true
  touched.value.password = true
  formError.value = ''

  if (!isFormValid.value) return

  loading.value = true

  try {
    const session = await login(email.value.trim(), password.value)
    saveSession(session)
    router.push('/home')
  } catch (error) {
    clearSession()
    if (error && typeof error === 'object') {
      const code = error.code
      if (code === 'NEX-USR-008') {
        formError.value = 'Email o contraseña incorrectos.'
      } else if (code === 'NEX-USR-007') {
        formError.value = 'Demasiados intentos. Intentá nuevamente más tarde.'
      } else if (typeof error.message === 'string' && error.message) {
        formError.value = error.message
      } else {
        formError.value = 'No se pudo iniciar sesión. Intentá nuevamente.'
      }
    } else if (error instanceof Error) {
      formError.value = error.message
    } else {
      formError.value = 'No se pudo iniciar sesión. Intentá nuevamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>