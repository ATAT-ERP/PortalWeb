<template>
  <div class="company-form-page">
    <header class="company-header">
      <div class="company-header-icon" aria-hidden="true">
        <Building2 :size="24" />
      </div>
      <div class="company-header-text">
        <h1>{{ isEditing ? 'Editar compañía' : 'Nueva compañía' }}</h1>
        <p>{{ isEditing ? 'Modificá los datos de la compañía.' : 'Registrá una actividad, comercio u organización dentro de A.T.A.T.' }}</p>
      </div>
    </header>

    <section class="company-form-card">
      <form class="company-form" @submit.prevent="handleSubmit" novalidate>
        <div class="company-fieldset">
          <span class="company-fieldset-label">Tipo de actividad</span>
          <div class="company-type-options">
            <label class="company-type-option" :class="{ checked: form.type === 'individual' }">
              <input v-model="form.type" type="radio" value="individual" :disabled="isSaving" />
              <UserRound :size="18" aria-hidden="true" />
              <span>Autónomo / individual</span>
            </label>
            <label class="company-type-option" :class="{ checked: form.type === 'organization' }">
              <input v-model="form.type" type="radio" value="organization" :disabled="isSaving" />
              <Building2 :size="18" aria-hidden="true" />
              <span>Organización</span>
            </label>
          </div>
        </div>

        <div class="company-form-grid">
          <div class="company-field" :class="{ 'company-field-invalid': serverErrors.name || (touched.name && nameError) }">
            <label for="name">Nombre *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="Nombre de la compañía"
              autocomplete="off"
              :disabled="isSaving"
              @blur="touched.name = true"
            />
            <span v-if="serverErrors.name || (touched.name && nameError)" class="company-field-error">
              {{ serverErrors.name || nameError }}
            </span>
          </div>

          <div class="company-field">
            <label for="legal-name">Razón social</label>
            <input
              id="legal-name"
              v-model="form.legal_name"
              type="text"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
            />
          </div>

          <div class="company-field" :class="{ 'company-field-invalid': serverErrors.tax_id || (touched.tax_id && taxIdError) }">
            <label for="tax-id">CUIT</label>
            <input
              id="tax-id"
              v-model="form.tax_id"
              type="text"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
              @blur="touched.tax_id = true"
            />
            <span v-if="serverErrors.tax_id || (touched.tax_id && taxIdError)" class="company-field-error">
              {{ serverErrors.tax_id || taxIdError }}
            </span>
            <span class="company-field-hint">Opcional. No constituye una verificación oficial (ARCA).</span>
          </div>

          <div class="company-field" :class="{ 'company-field-invalid': serverErrors.email || (touched.email && emailError) }">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
              @blur="touched.email = true"
            />
            <span v-if="serverErrors.email || (touched.email && emailError)" class="company-field-error">
              {{ serverErrors.email || emailError }}
            </span>
          </div>

          <div class="company-field">
            <label for="phone">Teléfono</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
            />
          </div>
        </div>

        <span class="company-fieldset-label">Dirección (opcional)</span>
        <div class="company-form-grid">
          <div class="company-field">
            <label for="address-street">Calle</label>
            <input
              id="address-street"
              v-model="form.address_street"
              type="text"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
            />
          </div>

          <div class="company-field">
            <label for="address-number">Número</label>
            <input
              id="address-number"
              v-model="form.address_number"
              type="text"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
            />
          </div>

          <div class="company-field">
            <label for="address-city">Ciudad</label>
            <input
              id="address-city"
              v-model="form.address_city"
              type="text"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
            />
          </div>

          <div class="company-field">
            <label for="address-postal-code">Código postal</label>
            <input
              id="address-postal-code"
              v-model="form.address_postal_code"
              type="text"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
            />
          </div>

          <div class="company-field">
            <label for="address-province">Provincia</label>
            <input
              id="address-province"
              v-model="form.address_province"
              type="text"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
            />
          </div>

          <div class="company-field">
            <label for="address-country">País</label>
            <input
              id="address-country"
              v-model="form.address_country"
              type="text"
              placeholder="Opcional"
              autocomplete="off"
              :disabled="isSaving"
            />
          </div>
        </div>

        <p v-if="formError && !hasServerErrors" class="company-form-error" role="alert">{{ formError }}</p>

        <button type="submit" class="company-submit-button" :disabled="isSaving">
          <Plus :size="18" aria-hidden="true" />
          <span>{{ isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear compañía' }}</span>
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Building2, Plus, UserRound } from '@lucide/vue'
import { createCompany, updateCompany, getCompanyById } from '../../services/company.service'
import { clearSession, getSession } from '../../services/session.service'
import '../../assets/css/CompanyFormPage.css'

const router = useRouter()
const route = useRoute()

const isEditing = computed(() => !!route.params.id)
const companyId = computed(() => route.params.id)

const form = ref({
  type: 'individual',
  name: '',
  legal_name: '',
  tax_id: '',
  email: '',
  phone: '',
  address_street: '',
  address_number: '',
  address_city: '',
  address_postal_code: '',
  address_province: '',
  address_country: ''
})

const isSaving = ref(false)
const isLoading = ref(false)
const formError = ref('')
const serverErrors = ref({})
const touched = ref({ name: false, tax_id: false, email: false })

watch(form, () => {
  serverErrors.value = {}
}, { deep: true })

const nameError = computed(() => {
  if (!form.value.name.trim()) return 'Ingresá el nombre de la compañía.'
  return ''
})

const taxIdError = computed(() => {
  const value = form.value.tax_id.replace(/[\s.\-]/g, '')
  if (!value) return ''
  if (!/^\d{11}$/.test(value)) return 'El CUIT debe tener 11 dígitos.'
  return ''
})

const emailError = computed(() => {
  const value = form.value.email.trim()
  if (!value) return ''
  if (!/^\S+@\S+\.\S+$/.test(value)) return 'Ingresá un email válido.'
  return ''
})

const isFormValid = computed(() => !nameError.value && !taxIdError.value && !emailError.value)
const hasServerErrors = computed(() => Object.keys(serverErrors.value).length > 0)

onMounted(async () => {
  if (isEditing.value) {
    isLoading.value = true
    const session = getSession()
    if (!session?.access_token) {
      clearSession()
      router.push('/login')
      return
    }

    try {
      const company = await getCompanyById(companyId.value, session.access_token)
      form.value.type = company.type || 'individual'
      form.value.name = company.name || ''
      form.value.legal_name = company.legal_name || ''
      form.value.tax_id = company.tax_id || ''
      form.value.email = company.email || ''
      form.value.phone = company.phone || ''
      form.value.address_street = company.address_street || ''
      form.value.address_number = company.address_number || ''
      form.value.address_city = company.address_city || ''
      form.value.address_postal_code = company.address_postal_code || ''
      form.value.address_province = company.address_province || ''
      form.value.address_country = company.address_country || ''
    } catch (error) {
      if (error.status === 401 && error.code === 'NEX-USR-010') {
        clearSession()
        router.push('/login')
        return
      }
      formError.value = error instanceof Error ? error.message : 'No se pudo cargar la compañía. Intentá nuevamente.'
    } finally {
      isLoading.value = false
    }
  }
})

function buildPayload() {
  const optional = (value) => value.trim() || null
  return {
    type: form.value.type,
    name: form.value.name.trim(),
    legal_name: optional(form.value.legal_name),
    tax_id: optional(form.value.tax_id),
    email: optional(form.value.email),
    phone: optional(form.value.phone),
    address_street: optional(form.value.address_street),
    address_number: optional(form.value.address_number),
    address_city: optional(form.value.address_city),
    address_postal_code: optional(form.value.address_postal_code),
    address_province: optional(form.value.address_province),
    address_country: optional(form.value.address_country)
  }
}

async function handleSubmit() {
  if (isSaving.value) return

  touched.value.name = true
  touched.value.tax_id = true
  touched.value.email = true
  formError.value = ''
  serverErrors.value = {}

  if (!isFormValid.value) return

  const session = getSession()
  if (!session?.access_token) {
    clearSession()
    router.push('/login')
    return
  }

  isSaving.value = true

  try {
    if (isEditing.value) {
      await updateCompany(companyId.value, buildPayload(), session.access_token)
    } else {
      await createCompany(buildPayload(), session.access_token)
    }
    router.push('/companies')
  } catch (error) {
    if (error.status === 401 && error.code === 'NEX-USR-010') {
      clearSession()
      router.push('/login')
      return
    }

    formError.value = error instanceof Error ? error.message : (isEditing.value ? 'No se pudo guardar los cambios. Intentá nuevamente.' : 'No se pudo crear la compañía. Intentá nuevamente.')

    if (error.errors && typeof error.errors === 'object') {
      for (const key of Object.keys(error.errors)) {
        const value = error.errors[key]
        serverErrors.value[key] = Array.isArray(value) ? value[0] : value
      }
    }
  } finally {
    isSaving.value = false
  }
}
</script>