<template>
  <div class="register-screen">
    <div class="register-bg-grid" aria-hidden="true"></div>

    <div class="register-card">
      <RouterLink to="/" class="register-back-link">
        <ArrowLeft :size="16" aria-hidden="true" />
        Volver al inicio
      </RouterLink>

      <div v-if="registered">
        <div class="register-success-layout">
          <div class="register-success-sidebar">
            <div class="register-brand-row">
              <span class="register-logo-mark">AT</span>
              <div class="register-brand-text">
                <span class="register-brand-name">A.T.A.T. ERP</span>
              </div>
            </div>
            <p class="register-sidebar-subtitle">Gestión clara para tu empresa</p>
          </div>

          <div class="register-divider" aria-hidden="true"></div>

          <div class="register-success-main">
            <header class="register-form-header">
              <h1>Cuenta creada</h1>
              <p>Ya podés iniciar sesión con tu email y contraseña.</p>
            </header>

            <RouterLink to="/login" class="register-submit-button register-success-link">
              <LogIn :size="18" aria-hidden="true" />
              Iniciar sesión
            </RouterLink>
          </div>
        </div>
      </div>

      <template v-else>
        <div class="register-layout">
          <div class="register-sidebar">
            <div class="register-brand-row">
              <span class="register-logo-mark">AT</span>
              <div class="register-brand-text">
                <span class="register-brand-name">A.T.A.T. ERP</span>
              </div>
            </div>
            <p class="register-sidebar-subtitle">Gestión clara para tu empresa</p>
          </div>

          <div class="register-divider" aria-hidden="true"></div>

          <div class="register-main">
            <header class="register-form-header">
              <h1>Crear cuenta</h1>
              <p>Registrate para acceder al sistema.</p>
            </header>

            <form class="register-form" @submit.prevent="handleSubmit" novalidate>
              <div class="register-field" :class="{ 'register-field-invalid': touched.email && emailError }">
                <label for="email" class="register-field-label">
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
                <span v-if="touched.email && emailError" class="register-field-error">{{ emailError }}</span>
              </div>

              <div class="register-field" :class="{ 'register-field-invalid': touched.password && passwordError }">
                <label for="password" class="register-field-label">
                  <LockKeyhole :size="16" aria-hidden="true" />
                  Contraseña
                </label>
                <div class="register-input-wrapper">
                  <input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    autocomplete="new-password"
                    required
                    :disabled="loading"
                    @blur="touched.password = true"
                  />
                  <button
                    type="button"
                    class="register-toggle-password"
                    :disabled="loading"
                    :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    @click="showPassword = !showPassword"
                  >
                    <EyeOff v-if="showPassword" :size="18" aria-hidden="true" />
                    <Eye v-else :size="18" aria-hidden="true" />
                  </button>
                </div>
                <span v-if="touched.password && passwordError" class="register-field-error">{{ passwordError }}</span>
              </div>

              <div class="register-field" :class="{ 'register-field-invalid': touched.confirmPassword && confirmPasswordError }">
                <label for="confirm-password" class="register-field-label">
                  <LockKeyhole :size="16" aria-hidden="true" />
                  Confirmar contraseña
                </label>
                <div class="register-input-wrapper">
                  <input
                    id="confirm-password"
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    autocomplete="new-password"
                    required
                    :disabled="loading"
                    @blur="touched.confirmPassword = true"
                  />
                  <button
                    type="button"
                    class="register-toggle-password"
                    :disabled="loading"
                    :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <EyeOff v-if="showConfirmPassword" :size="18" aria-hidden="true" />
                    <Eye v-else :size="18" aria-hidden="true" />
                  </button>
                </div>
                <span v-if="touched.confirmPassword && confirmPasswordError" class="register-field-error">{{ confirmPasswordError }}</span>
              </div>

              <p v-if="formError" class="register-form-error" role="alert">{{ formError }}</p>

              <button type="submit" class="register-submit-button" :disabled="loading">
                <UserPlus :size="18" aria-hidden="true" />
                <span>{{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}</span>
              </button>

              <RouterLink to="/login" class="register-forgot-link">
                ¿Ya tenés cuenta? <strong>Iniciá sesión</strong>
              </RouterLink>
            </form>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn, UserPlus, UserRound } from '@lucide/vue'
import { register } from '../../services/user.service'
import '../../assets/css/RegisterPage.css'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const formError = ref('')
const registered = ref(false)
const touched = ref({ email: false, password: false, confirmPassword: false })

const emailError = computed(() => {
  if (!email.value.trim()) return 'Ingresá tu email.'
  if (!/^\S+@\S+\.\S+$/.test(email.value)) return 'Ingresá un email válido.'
  return ''
})

const passwordError = computed(() => {
  if (!password.value) return 'Ingresá una contraseña.'
  return ''
})

const confirmPasswordError = computed(() => {
  if (!confirmPassword.value) return 'Confirmá tu contraseña.'
  if (confirmPassword.value !== password.value) return 'Las contraseñas no coinciden.'
  return ''
})

const isFormValid = computed(
  () => !emailError.value && !passwordError.value && !confirmPasswordError.value
)

async function handleSubmit() {
  touched.value.email = true
  touched.value.password = true
  touched.value.confirmPassword = true
  formError.value = ''

  if (!isFormValid.value) return

  loading.value = true

  try {
    await register({ email: email.value.trim(), password: password.value })
    registered.value = true
  } catch (error) {
    if (error && typeof error === 'object') {
      const code = error.code
      if (code === 'NEX-USR-007') {
        formError.value = 'Demasiados intentos. Intentá nuevamente más tarde.'
      } else if (typeof error.message === 'string' && error.message) {
        formError.value = error.message
      } else {
        formError.value = 'No se pudo crear la cuenta. Intentá nuevamente.'
      }
    } else if (error instanceof Error) {
      formError.value = error.message
    } else {
      formError.value = 'No se pudo crear la cuenta. Intentá nuevamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>