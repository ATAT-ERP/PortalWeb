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

<style scoped>
.login-screen {
  --ink: #12233d;
  --ink-soft: #5b6b81;
  --border: #dfe3e8;
  --accent: #4f7a6b;
  --brass: #b8935b;
  --brick: #c0402a;
  --brick-bg: #fdf1ee;

  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(160deg, #e9efec 0%, #f4f5f3 45%, #f6efe4 100%);
  font-family: -apple-system, 'Segoe UI', Roboto, ui-sans-serif, system-ui, sans-serif;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(18, 35, 61, 0.12) 1.5px, transparent 1.5px);
  background-size: 26px 26px;
  mask-image: radial-gradient(circle at 50% 40%, black, transparent 80%);
  z-index: 0;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(55px);
  z-index: 0;
  pointer-events: none;
}

.bg-blob-a {
  width: 620px;
  height: 620px;
  top: -220px;
  left: -220px;
  background: radial-gradient(circle, rgba(79, 122, 107, 0.85), transparent 68%);
  animation: drift-a 16s ease-in-out infinite alternate;
}

.bg-blob-b {
  width: 560px;
  height: 560px;
  bottom: -220px;
  right: -180px;
  background: radial-gradient(circle, rgba(184, 147, 91, 0.8), transparent 68%);
  animation: drift-b 18s ease-in-out infinite alternate;
}

.bg-blob-c {
  width: 380px;
  height: 380px;
  top: 55%;
  left: 62%;
  background: radial-gradient(circle, rgba(18, 35, 61, 0.5), transparent 70%);
  animation: drift-c 20s ease-in-out infinite alternate;
}

.card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 18px;
  padding: 2.25rem 2rem;
  box-shadow: 0 1px 2px rgba(18, 35, 61, 0.05), 0 24px 60px -14px rgba(18, 35, 61, 0.28);
  animation: card-in 0.4s ease both;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
  color: var(--ink-soft);
  font-size: 0.85rem;
  text-decoration: none;
}

.back-link:hover {
  color: var(--ink);
}

.back-link:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 2px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.75rem;
}

.logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--ink);
  color: #f4f2ec;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.brand-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ink);
}

.form-header {
  margin-bottom: 1.6rem;
}

.form-header h1 {
  margin: 0 0 0.3rem;
  font-size: 1.35rem;
  font-weight: 650;
  color: var(--ink);
}

.form-header p {
  margin: 0;
  font-size: 0.87rem;
  color: var(--ink-soft);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.field {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-bottom: 1.1rem;
}

.field label {
  font-size: 0.82rem;
  font-weight: 550;
  color: var(--ink);
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field input {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  font-size: 0.95rem;
  color: var(--ink);
  background: #fbfbfa;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.input-wrapper input {
  padding-right: 2.5rem;
}

.field input::placeholder {
  color: #a7afba;
}

.field input:disabled {
  background: #f4f5f7;
  cursor: not-allowed;
  opacity: 0.8;
}

.field input:focus {
  outline: none;
  border-color: var(--accent);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(79, 122, 107, 0.14);
}

.field.invalid input {
  border-color: var(--brick);
}

.field.invalid input:focus {
  box-shadow: 0 0 0 3px rgba(192, 64, 42, 0.12);
}

.toggle-password {
  position: absolute;
  right: 0.6rem;
  background: none;
  border: none;
  color: var(--ink-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 6px;
  transition: color 0.15s ease;
}

.toggle-password:hover:not(:disabled) {
  color: var(--ink);
}

.toggle-password:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.field-error {
  position: absolute;
  left: 0;
  bottom: 0;
  font-size: 0.78rem;
  color: var(--brick);
}

.form-error {
  margin: -0.3rem 0 0;
  padding: 0.65rem 0.8rem;
  border-radius: 8px;
  background: var(--brick-bg);
  font-size: 0.82rem;
  color: var(--brick);
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.15rem;
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  background: var(--ink);
  color: #f4f2ec;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.05s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #1b3352;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.99);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 2px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(244, 242, 236, 0.35);
  border-top-color: #f4f2ec;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.forgot-link {
  text-align: center;
  font-size: 0.85rem;
  color: var(--accent);
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes drift-a {
  from { transform: translate(0, 0); }
  to { transform: translate(30px, 25px); }
}

@keyframes drift-b {
  from { transform: translate(0, 0); }
  to { transform: translate(-25px, -20px); }
}

@keyframes drift-c {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-20px, 18px) scale(1.08); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 420px) {
  .card {
    padding: 1.75rem 1.4rem;
    border-radius: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .bg-blob {
    animation: none;
  }

  .submit-btn,
  .field input {
    transition: none;
  }

  .spinner {
    animation-duration: 1.4s;
  }
}
</style>
