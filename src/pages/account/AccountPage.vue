<template>
  <div class="account-page">
    <header class="page-header">
      <div class="header-icon" aria-hidden="true">
        <UserRound :size="24" />
      </div>
      <div class="header-text">
        <h1>Mi cuenta</h1>
        <p>Información de tu identidad dentro de A.T.A.T. ERP.</p>
      </div>
    </header>

    <section class="profile-card">
      <div class="profile-avatar" aria-hidden="true">{{ initials }}</div>

      <p v-if="isLoading && !profile" class="profile-state">
        Cargando información de la cuenta...
      </p>

      <div v-else-if="!profile" class="profile-state">
        <p class="state-error">{{ errorMessage || 'No hay información de la cuenta disponible.' }}</p>
        <button type="button" class="state-retry" @click="loadProfile">Reintentar</button>
      </div>

      <div v-else class="profile-details">
        <dl class="profile-fields">
          <div class="field-row">
            <dt>NOMBRE</dt>
            <dd>{{ profile.first_name || '—' }}</dd>
          </div>
          <div class="field-row">
            <dt>APELLIDO</dt>
            <dd>{{ profile.last_name || '—' }}</dd>
          </div>
          <div class="field-row">
            <dt>EMAIL</dt>
            <dd class="email-value">{{ profile.email || '—' }}</dd>
          </div>
          <div class="field-row">
            <dt>ESTADO DE LA CUENTA</dt>
            <dd class="status-value">
              <span class="status-badge">{{ status }}</span>
            </dd>
          </div>
        </dl>

        <div v-if="errorMessage" class="profile-state">
          <p class="state-error">{{ errorMessage }}</p>
          <button type="button" class="state-retry" @click="loadProfile">Reintentar</button>
        </div>
      </div>
    </section>

    <section class="security-card">
      <header class="security-header">
        <div class="security-icon" aria-hidden="true">
          <LockKeyhole :size="22" />
        </div>
        <div class="security-text">
          <h2>Seguridad</h2>
          <p>Espacio reservado para la actualización de credenciales de la cuenta.</p>
        </div>
      </header>

      <form class="password-form" @submit.prevent="handleChangePassword">
        <div class="field" :class="{ invalid: touched.current && currentError }">
          <label for="current-password">Contraseña actual</label>
          <input
            id="current-password"
            v-model="passwordForm.current"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            :disabled="isSaving"
            @blur="touched.current = true"
          />
          <span v-if="touched.current && currentError" class="field-error">{{ currentError }}</span>
        </div>

        <div class="form-row">
          <div class="field" :class="{ invalid: touched.newPass && newPassError }">
            <label for="new-password">Nueva contraseña</label>
            <input
              id="new-password"
              v-model="passwordForm.newPass"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              :disabled="isSaving"
              @blur="touched.newPass = true"
            />
            <span v-if="touched.newPass && newPassError" class="field-error">{{ newPassError }}</span>
          </div>

          <div class="field" :class="{ invalid: touched.confirmPass && confirmError }">
            <label for="confirm-password">Confirmar nueva contraseña</label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPass"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              :disabled="isSaving"
              @blur="touched.confirmPass = true"
            />
            <span v-if="touched.confirmPass && confirmError" class="field-error">{{ confirmError }}</span>
          </div>
        </div>

        <p v-if="formError" class="form-message form-message-error" role="alert">{{ formError }}</p>
        <p v-if="formSuccess" class="form-message form-message-success">{{ formSuccess }}</p>

        <button type="submit" class="submit-btn" :disabled="isSaving">
          {{ isSaving ? 'Guardando...' : 'Cambiar contraseña' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserRound, LockKeyhole } from '@lucide/vue'
import { changePassword, getById } from '../../services/user.service'
import { clearSession, getAccessToken, getProfile, getSession, setProfile } from '../../services/session.service'
import '../../assets/css/AccountPage.css'

const router = useRouter()

const profile = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

const passwordForm = ref({
  current: '',
  newPass: '',
  confirmPass: ''
})

const isSaving = ref(false)
const formError = ref('')
const formSuccess = ref('')
const touched = ref({ current: false, newPass: false, confirmPass: false })

const currentError = computed(() => {
  if (!passwordForm.value.current) return 'Ingresá tu contraseña actual.'
  return ''
})

const newPassError = computed(() => {
  if (!passwordForm.value.newPass) return 'Ingresá la nueva contraseña.'
  return ''
})

const confirmError = computed(() => {
  if (!passwordForm.value.confirmPass) return 'Confirmá la nueva contraseña.'
  if (passwordForm.value.confirmPass !== passwordForm.value.newPass) return 'Las contraseñas no coinciden.'
  return ''
})

const isPasswordFormValid = computed(
  () => !currentError.value && !newPassError.value && !confirmError.value
)

const initials = computed(() => {
  const first = profile.value?.first_name?.trim()?.[0] ?? ''
  const last = profile.value?.last_name?.trim()?.[0] ?? ''
  return `${first}${last}`.toUpperCase() || '?'
})

const status = computed(() => (profile.value?.is_active ? 'Activa' : 'Inactiva'))

async function loadProfile() {
  const session = getSession()

  if (!session?.id || !getAccessToken()) {
    clearSession()
    router.push('/login')
    return
  }

  profile.value = getProfile()
  errorMessage.value = ''
  isLoading.value = true

  try {
    const user = await getById(session.id, session.access_token)
    profile.value = user
    setProfile(user)
  } catch (error) {
    if (error.status === 401) {
      clearSession()
      router.push('/login')
      return
    }
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo cargar la información de la cuenta.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProfile)

async function handleChangePassword() {
  touched.value.current = true
  touched.value.newPass = true
  touched.value.confirmPass = true
  formError.value = ''
  formSuccess.value = ''

  if (!isPasswordFormValid.value) return

  const session = getSession()
  if (!session?.access_token) {
    clearSession()
    router.push('/login')
    return
  }

  isSaving.value = true

  try {
    await changePassword(
      {
        current_password: passwordForm.value.current,
        new_password: passwordForm.value.newPass,
        confirm_password: passwordForm.value.confirmPass,
      },
      session.access_token
    )
    passwordForm.value = { current: '', newPass: '', confirmPass: '' }
    touched.value = { current: false, newPass: false, confirmPass: false }
    formSuccess.value = 'Contraseña actualizada correctamente.'
  } catch (error) {
    if (error.status === 401 && error.code === 'NEX-USR-010') {
      clearSession()
      router.push('/login')
      return
    }
    formError.value = error instanceof Error ? error.message : 'No se pudo cambiar la contraseña. Intentá nuevamente.'
  } finally {
    isSaving.value = false
  }
}
</script>