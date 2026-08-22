<template>
  <div class="login-screen">
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-blob bg-blob-a" aria-hidden="true"></div>
    <div class="bg-blob bg-blob-b" aria-hidden="true"></div>
    <div class="bg-blob bg-blob-c" aria-hidden="true"></div>

    <div class="card">
      <RouterLink to="/" class="back-link">
        <ArrowLeft :size="16" aria-hidden="true" />
        Volver al inicio
      </RouterLink>

      <div class="brand-row">
        <span class="logo-mark">AT</span>
        <div class="brand-text">
          <span class="brand-name">A.T.A.T. ERP</span>
        </div>
      </div>

      <header class="form-header">
        <h1>Iniciar sesión</h1>
        <p>Ingresá tus credenciales para acceder al sistema.</p>
      </header>

      <form class="login-form" @submit.prevent="handleSubmit" novalidate>
        <div class="field" :class="{ invalid: touched.email && emailError }">
          <label for="email" class="field-label">
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
          <span v-if="touched.email && emailError" class="field-error">{{ emailError }}</span>
        </div>

        <div class="field" :class="{ invalid: touched.password && passwordError }">
          <label for="password" class="field-label">
            <LockKeyhole :size="16" aria-hidden="true" />
            Contraseña
          </label>
          <div class="input-wrapper">
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
              class="toggle-password"
              :disabled="loading"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="18" aria-hidden="true" />
              <Eye v-else :size="18" aria-hidden="true" />
            </button>
          </div>
          <span v-if="touched.password && passwordError" class="field-error">{{ passwordError }}</span>
        </div>

        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

        <button type="submit" class="submit-btn" :disabled="loading">
          <LogIn :size="18" aria-hidden="true" />
          <span>Ingresar</span>
        </button>

        <a href="#" class="forgot-link" @click.prevent>
          ¿Olvidaste tu contraseña?
        </a>
      </form>
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
    formError.value = error instanceof Error ? error.message : 'No se pudo iniciar sesión. Intentá nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>
