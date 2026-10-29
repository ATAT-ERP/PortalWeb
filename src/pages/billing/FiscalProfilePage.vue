<template>
  <div class="fiscal-page">
    <header class="fiscal-header">
      <span class="fiscal-header-icon" aria-hidden="true"><Building2 :size="24" /></span>
      <div><h1>Perfil fiscal</h1><p>Administrá la información fiscal de la compañía activa.</p></div>
    </header>

    <section class="fiscal-card" aria-labelledby="fiscal-title">
      <h2 id="fiscal-title">Configuración fiscal</h2>
      <p v-if="!activeCompany" class="fiscal-state">Seleccioná una compañía para administrar su perfil fiscal.</p>
      <p v-else-if="isLoading" class="fiscal-state" role="status">Cargando perfil fiscal...</p>
      <div v-else-if="loadError" class="fiscal-error" role="alert">
        <p>{{ loadError }}</p>
        <Button type="button" label="Reintentar" severity="secondary" outlined @click="loadProfile" />
      </div>
      <template v-else-if="profileState">
        <p class="fiscal-intro" v-if="profileState === 'missing'">Esta compañía todavía no tiene un perfil fiscal. Completá los datos para configurarlo.</p>
        <p class="fiscal-intro" v-else>Datos fiscales de {{ activeCompany.name }}.</p>
        <form class="fiscal-form" novalidate @submit.prevent="saveProfile">
          <div class="fiscal-field">
            <label for="vat-condition">Condición frente al IVA *</label>
            <Select input-id="vat-condition" v-model="form.vat_condition" :options="vatConditions" option-label="label" option-value="value" placeholder="Seleccioná una condición" :disabled="isSaving" :invalid="!!fieldErrors.vat_condition" :aria-describedby="fieldErrors.vat_condition ? 'vat-error' : undefined" @update:model-value="fieldErrors.vat_condition = ''" />
            <span v-if="fieldErrors.vat_condition" id="vat-error" class="fiscal-field-error" role="alert">{{ fieldErrors.vat_condition }}</span>
          </div>
          <div class="fiscal-field">
            <label for="gross-income">Ingresos brutos</label>
            <InputText id="gross-income" v-model="form.gross_income" maxlength="30" placeholder="Opcional" :disabled="isSaving" :invalid="!!fieldErrors.gross_income" :aria-describedby="fieldErrors.gross_income ? 'income-error' : undefined" @input="fieldErrors.gross_income = ''" />
            <span v-if="fieldErrors.gross_income" id="income-error" class="fiscal-field-error" role="alert">{{ fieldErrors.gross_income }}</span>
          </div>
          <div class="fiscal-field">
            <label for="business-start-date">Inicio de actividades</label>
            <InputText id="business-start-date" v-model="form.business_start_date" type="date" :disabled="isSaving" :invalid="!!fieldErrors.business_start_date" :aria-describedby="fieldErrors.business_start_date ? 'date-error' : undefined" @input="fieldErrors.business_start_date = ''" />
            <span v-if="fieldErrors.business_start_date" id="date-error" class="fiscal-field-error" role="alert">{{ fieldErrors.business_start_date }}</span>
          </div>
          <p v-if="saveError" class="fiscal-error" role="alert">{{ saveError }}</p>
          <p v-if="successMessage" class="fiscal-success" role="status">{{ successMessage }}</p>
          <Button type="submit" :disabled="isSaving" :loading="isSaving" :label="isSaving ? 'Guardando...' : profileState === 'missing' ? 'Crear perfil fiscal' : 'Guardar cambios'" />
        </form>
      </template>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Building2 } from '@lucide/vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { createFiscalProfile, getFiscalProfile, updateFiscalProfile } from '../../services/billing.service'
import { clearSession } from '../../services/session.service'
import { activeCompany } from '../../stores/company.store'
import '../../assets/css/FiscalProfilePage.css'

const vatConditions = [
  { value: 1, label: 'IVA Responsable Inscripto' },
  { value: 4, label: 'IVA Sujeto Exento' },
  { value: 5, label: 'Consumidor Final' },
  { value: 6, label: 'Responsable Monotributo' },
  { value: 13, label: 'Monotributista Social' },
  { value: 15, label: 'IVA No Alcanzado' },
  { value: 16, label: 'Monotributo Trabajador Independiente Promovido' }
]
const router = useRouter()
const form = reactive({ vat_condition: null, gross_income: '', business_start_date: '' })
const fieldErrors = reactive({ vat_condition: '', gross_income: '', business_start_date: '' })
const profileState = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const loadError = ref('')
const saveError = ref('')
const successMessage = ref('')
let loadId = 0
let companyVersion = 0
let mounted = true

function resetForm() {
  Object.assign(form, { vat_condition: null, gross_income: '', business_start_date: '' })
  Object.assign(fieldErrors, { vat_condition: '', gross_income: '', business_start_date: '' })
  profileState.value = ''
  loadError.value = ''
  saveError.value = ''
  successMessage.value = ''
}

watch(activeCompany, () => {
  companyVersion++
  resetForm()
  loadProfile()
}, { immediate: true, flush: 'sync' })

onBeforeUnmount(() => { mounted = false; loadId++; companyVersion++ })

function handleUnauthorized(error) {
  if (error.status !== 401 || error.code !== 'NEX-USR-010') return false
  clearSession()
  router.push('/login')
  return true
}

function showProfile(profile) {
  form.vat_condition = profile.vat_condition
  form.gross_income = profile.gross_income
  form.business_start_date = profile.business_start_date ?? ''
  profileState.value = 'existing'
}

async function loadProfile() {
  const request = ++loadId
  loadError.value = ''
  if (!activeCompany.value) { isLoading.value = false; return }
  isLoading.value = true
  try {
    const profile = await getFiscalProfile(activeCompany.value.id)
    if (request === loadId) showProfile(profile)
  } catch (error) {
    if (request !== loadId || handleUnauthorized(error)) return
    if (error.status === 404 && error.message === 'No FiscalProfile matches the given query.') {
      profileState.value = 'missing'
    } else if (error.status === 403) {
      loadError.value = 'No tenés permiso para consultar el perfil fiscal de esta compañía.'
    } else if (error.status === 404) {
      loadError.value = 'No se encontró el recurso solicitado. Intentá nuevamente.'
    } else {
      loadError.value = 'No se pudo cargar el perfil fiscal. Intentá nuevamente.'
    }
  } finally {
    if (request === loadId) isLoading.value = false
  }
}

async function saveProfile() {
  if (isSaving.value || !activeCompany.value) return
  Object.assign(fieldErrors, { vat_condition: '', gross_income: '', business_start_date: '' })
  saveError.value = ''
  successMessage.value = ''
  if (form.vat_condition === null) {
    fieldErrors.vat_condition = 'Seleccioná una condición frente al IVA.'
    return
  }
  const companyId = activeCompany.value.id
  const version = companyVersion
  const creating = profileState.value === 'missing'
  const payload = { vat_condition: form.vat_condition, gross_income: form.gross_income, business_start_date: form.business_start_date || null }
  isSaving.value = true
  try {
    const profile = creating ? await createFiscalProfile(companyId, payload) : await updateFiscalProfile(companyId, payload)
    if (version === companyVersion) {
      showProfile(profile)
      successMessage.value = 'Perfil fiscal guardado correctamente.'
    }
  } catch (error) {
    if (version !== companyVersion || handleUnauthorized(error)) return
    if (error.status === 400) {
      for (const key of Object.keys(fieldErrors)) {
        const messages = error.errors?.[key]
        if (messages) fieldErrors[key] = Array.isArray(messages) ? messages.join(' ') : messages
      }
      const general = error.errors?.company || error.errors?.non_field_errors
      saveError.value = general ? (Array.isArray(general) ? general.join(' ') : general) : 'Revisá los datos ingresados e intentá nuevamente.'
    } else if (error.status === 403) {
      saveError.value = 'No tenés permiso para guardar el perfil fiscal de esta compañía.'
    } else if (error.status === 404) {
      saveError.value = 'No se encontró el perfil fiscal. Volvé a cargar la página para actualizar su estado.'
    } else {
      saveError.value = 'No se pudo guardar el perfil fiscal. Intentá nuevamente.'
    }
  } finally {
    isSaving.value = false
    if (mounted && version !== companyVersion && activeCompany.value?.id === companyId) loadProfile()
  }
}
</script>
