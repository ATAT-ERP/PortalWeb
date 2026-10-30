<template>
  <div class="chart-page">
    <header class="chart-header">
      <span class="chart-header-icon" aria-hidden="true"><BookOpen :size="24" /></span>
      <div class="chart-header-text">
        <h1>Plan de cuentas</h1>
        <p>Administrá las cuentas contables de la compañía activa.</p>
      </div>
      <Button v-if="activeCompany" type="button" @click="openCreate">
        <Plus :size="16" aria-hidden="true" /> Nueva cuenta
      </Button>
    </header>

    <section class="chart-card" aria-labelledby="chart-title">
      <h2 id="chart-title" class="chart-sr-only">Cuentas contables</h2>

      <div v-if="!activeCompany" class="chart-empty">
        <span class="chart-empty-icon" aria-hidden="true"><Building2 :size="26" /></span>
        <p class="chart-empty-title">Seleccioná una compañía para ver su plan de cuentas.</p>
        <RouterLink to="/companies" class="chart-link">Ir a Compañías</RouterLink>
      </div>

      <p v-else-if="isLoading" class="chart-state" role="status">Cargando plan de cuentas...</p>

      <div v-else-if="listError" class="chart-message chart-message-error" role="alert">
        {{ listError }}
        <button type="button" class="chart-retry" @click="loadAccounts">Reintentar</button>
      </div>

      <div v-else-if="accounts.length === 0" class="chart-empty">
        <span class="chart-empty-icon" aria-hidden="true"><BookOpen :size="26" /></span>
        <p class="chart-empty-title">Esta compañía todavía no tiene cuentas contables.</p>
        <Button type="button" @click="openCreate">
          <Plus :size="16" aria-hidden="true" /> Crear la primera cuenta
        </Button>
      </div>

      <template v-else>
        <div class="chart-filters" role="search">
          <div class="chart-filter">
            <label for="chart-search">Buscar</label>
            <InputText id="chart-search" v-model="search" class="chart-input" type="search" placeholder="Código o nombre" autocomplete="off" />
          </div>
          <div class="chart-filter">
            <label for="chart-type-filter">Tipo</label>
            <Select v-model="typeFilter" class="chart-input" input-id="chart-type-filter" :options="accountTypes" option-label="label" option-value="value" placeholder="Todos los tipos" show-clear />
          </div>
          <div class="chart-filter">
            <label for="chart-status-filter">Estado</label>
            <Select v-model="statusFilter" class="chart-input" input-id="chart-status-filter" :options="statusOptions" option-label="label" option-value="value" placeholder="Todas" show-clear />
          </div>
        </div>

        <p class="chart-count" role="status">Mostrando {{ visibleAccounts.length }} de {{ accounts.length }} cuentas</p>
        <p v-if="statusMessage" class="chart-message chart-message-success" role="status">{{ statusMessage }}</p>
        <p v-if="actionError" class="chart-message chart-message-error" role="alert">{{ actionError }}</p>

        <DataTable :value="visibleAccounts" data-key="id" scrollable>
          <template #empty>No se encontraron cuentas con esos filtros.</template>
          <Column header="Código">
            <template #body="{ data }">
              <span :class="['chart-code', { 'chart-code-parent': isParent(data.code) }]" :style="{ '--chart-depth': depthOf(data.code) }">
                <component :is="isParent(data.code) ? Folder : FileText" :size="16" aria-hidden="true" />
                <span class="chart-sr-only">Nivel {{ depthOf(data.code) + 1 }}:</span>
                {{ data.code }}
              </span>
            </template>
          </Column>
          <Column header="Nombre">
            <template #body="{ data }">
              <span :class="{ 'chart-name-parent': isParent(data.code), 'chart-name-inactive': !data.is_active }">{{ data.name }}</span>
            </template>
          </Column>
          <Column header="Tipo">
            <template #body="{ data }"><Tag severity="secondary" :value="typeLabels[data.account_type]" /></template>
          </Column>
          <Column header="Estado">
            <template #body="{ data }"><Tag :severity="data.is_active ? 'success' : 'secondary'" :value="data.is_active ? 'Activa' : 'Inactiva'" /></template>
          </Column>
          <Column header="Acciones">
            <template #body="{ data }">
              <div class="chart-row-actions">
                <Button type="button" size="small" severity="secondary" outlined @click="openEdit(data)">
                  <Pencil :size="16" aria-hidden="true" /> Editar
                </Button>
                <Button type="button" size="small" severity="secondary" outlined :disabled="togglingId !== null" :loading="togglingId === data.id" @click="toggleActive(data)">
                  <Power :size="16" aria-hidden="true" /> {{ data.is_active ? 'Desactivar' : 'Activar' }}
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </section>

    <Dialog v-model:visible="dialogVisible" modal :header="editingAccount ? 'Editar cuenta' : 'Nueva cuenta'" :style="{ width: 'min(480px, 95vw)' }" @hide="resetForm">
      <form class="chart-form" novalidate @submit.prevent="submitForm">
        <p v-if="editingAccount" class="chart-note">
          Si la cuenta ya tiene movimientos en asientos publicados o revertidos, no se pueden cambiar su código, nombre ni tipo. Solo se puede activar o desactivar.
        </p>

        <div class="chart-field">
          <label for="chart-code">Código *</label>
          <InputText id="chart-code" v-model="form.code" class="chart-input" placeholder="Ej.: 1.1.01" autocomplete="off" :invalid="!!fieldErrors.code" :disabled="isSaving" />
          <span v-if="fieldErrors.code" class="chart-field-error" role="alert">{{ fieldErrors.code }}</span>
          <span v-else class="chart-field-hint">Único en la compañía. La jerarquía se arma con los puntos: 1.1.01 depende de 1.1.</span>
        </div>

        <div class="chart-field">
          <label for="chart-name">Nombre *</label>
          <InputText id="chart-name" v-model="form.name" class="chart-input" placeholder="Ej.: Caja" autocomplete="off" :invalid="!!fieldErrors.name" :disabled="isSaving" />
          <span v-if="fieldErrors.name" class="chart-field-error" role="alert">{{ fieldErrors.name }}</span>
        </div>

        <div class="chart-field">
          <label for="chart-type">Tipo *</label>
          <Select v-model="form.account_type" class="chart-input" input-id="chart-type" :options="accountTypes" option-label="label" option-value="value" placeholder="Seleccioná un tipo" :invalid="!!fieldErrors.account_type" :disabled="isSaving" />
          <span v-if="fieldErrors.account_type" class="chart-field-error" role="alert">{{ fieldErrors.account_type }}</span>
        </div>

        <p v-if="formError" class="chart-message chart-message-error" role="alert">{{ formError }}</p>

        <div class="chart-form-actions">
          <Button type="button" label="Cancelar" severity="secondary" outlined :disabled="isSaving" @click="dialogVisible = false" />
          <Button type="submit" :loading="isSaving" :disabled="isSaving">
            {{ isSaving ? 'Guardando...' : editingAccount ? 'Guardar cambios' : 'Crear cuenta' }}
          </Button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Building2, FileText, Folder, Pencil, Plus, Power } from '@lucide/vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { accountTypes } from '../../constants/accounting.constants'
import { createAccount, getAccounts, updateAccount } from '../../services/accounting.service'
import { clearSession } from '../../services/session.service'
import { activeCompany } from '../../stores/company.store'
import '../../assets/css/ChartOfAccountsPage.css'

const typeLabels = Object.fromEntries(accountTypes.map(option => [option.value, option.label]))
const statusOptions = [{ label: 'Activas', value: 'active' }, { label: 'Inactivas', value: 'inactive' }]
const formFields = ['code', 'name', 'account_type']

const router = useRouter()
const accounts = ref([])
const isLoading = ref(false)
const listError = ref('')
const actionError = ref('')
const statusMessage = ref('')
const search = ref('')
const typeFilter = ref(null)
const statusFilter = ref(null)
const togglingId = ref(null)
const dialogVisible = ref(false)
const editingAccount = ref(null)
const isSaving = ref(false)
const formError = ref('')
const fieldErrors = ref({})
const form = reactive({ code: '', name: '', account_type: null })
let listRequest = 0

// El backend ordena por código como texto; acá se ordena numéricamente (1.2 antes de 1.10).
const sortedAccounts = computed(() =>
  [...accounts.value].sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true }))
)

// Códigos que son prefijo de otra cuenta: la API no expone un campo de padre.
const parentCodes = computed(() => {
  const parents = new Set()
  for (const { code } of accounts.value) {
    const parts = code.split('.')
    for (let size = 1; size < parts.length; size++) parents.add(parts.slice(0, size).join('.'))
  }
  return parents
})

const visibleAccounts = computed(() => {
  const term = normalizeText(search.value.trim())
  return sortedAccounts.value.filter(account => {
    if (typeFilter.value && account.account_type !== typeFilter.value) return false
    if (statusFilter.value === 'active' && !account.is_active) return false
    if (statusFilter.value === 'inactive' && account.is_active) return false
    return !term || normalizeText(`${account.code} ${account.name}`).includes(term)
  })
})

watch(activeCompany, () => {
  accounts.value = []
  search.value = ''
  typeFilter.value = null
  statusFilter.value = null
  statusMessage.value = ''
  actionError.value = ''
  dialogVisible.value = false
  loadAccounts()
}, { immediate: true })

onBeforeUnmount(() => { listRequest++ })

/**
 * Gestiona una respuesta de sesión inválida.
 * @version 1.0
 * @author Thiago
 */
function handleUnauthorized(error) {
  if (error.status !== 401 || error.code !== 'NEX-USR-010') return false
  clearSession()
  router.push('/login')
  return true
}

/**
 * Normaliza un texto para comparar sin mayúsculas ni acentos.
 * @version 1.0
 * @author Thiago
 */
function normalizeText(value) {
  return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Calcula el nivel jerárquico de una cuenta según los puntos de su código.
 * @version 1.0
 * @author Thiago
 */
function depthOf(code) {
  return code.split('.').length - 1
}

/**
 * Indica si otra cuenta depende de la indicada.
 * @version 1.0
 * @author Thiago
 */
function isParent(code) {
  return parentCodes.value.has(code)
}

/**
 * Consulta el plan de cuentas de la compañía activa.
 * @version 1.0
 * @author Thiago
 */
async function loadAccounts() {
  const request = ++listRequest
  listError.value = ''
  if (!activeCompany.value) { accounts.value = []; isLoading.value = false; return }
  if (accounts.value.length === 0) isLoading.value = true
  try {
    const result = await getAccounts(activeCompany.value.id)
    if (request === listRequest) accounts.value = result
  } catch (error) {
    if (request === listRequest && !handleUnauthorized(error)) {
      listError.value = error.status === 403
        ? 'No tenés permiso para consultar el plan de cuentas de esta compañía.'
        : 'No se pudo cargar el plan de cuentas. Intentá nuevamente.'
    }
  } finally {
    if (request === listRequest) isLoading.value = false
  }
}

/**
 * Abre el diálogo para crear una cuenta.
 * @version 1.0
 * @author Thiago
 */
function openCreate() {
  editingAccount.value = null
  resetForm()
  statusMessage.value = ''
  dialogVisible.value = true
}

/**
 * Abre el diálogo para editar una cuenta.
 * @version 1.0
 * @author Thiago
 */
function openEdit(account) {
  editingAccount.value = account
  resetForm()
  form.code = account.code
  form.name = account.name
  form.account_type = account.account_type
  statusMessage.value = ''
  dialogVisible.value = true
}

/**
 * Limpia el formulario y sus errores.
 * @version 1.0
 * @author Thiago
 */
function resetForm() {
  form.code = ''
  form.name = ''
  form.account_type = null
  formError.value = ''
  fieldErrors.value = {}
}

/**
 * Crea o actualiza la cuenta del formulario. Al editar envía solo lo que cambió.
 * @version 1.0
 * @author Thiago
 */
async function submitForm() {
  if (isSaving.value || !activeCompany.value) return
  formError.value = ''
  fieldErrors.value = {}
  const companyId = activeCompany.value.id
  const payload = { code: form.code.trim(), name: form.name.trim(), account_type: form.account_type }
  isSaving.value = true
  try {
    if (editingAccount.value) {
      const changes = Object.fromEntries(
        Object.entries(payload).filter(([key, value]) => value !== editingAccount.value[key])
      )
      if (Object.keys(changes).length === 0) { dialogVisible.value = false; return }
      await updateAccount(companyId, editingAccount.value.id, changes)
      statusMessage.value = 'Cuenta actualizada correctamente.'
    } else {
      await createAccount(companyId, payload)
      statusMessage.value = 'Cuenta creada correctamente.'
    }
    dialogVisible.value = false
    await loadAccounts()
  } catch (error) {
    applyFormError(error)
  } finally {
    isSaving.value = false
  }
}

/**
 * Traduce los errores del backend a mensajes del formulario.
 * @version 1.0
 * @author Thiago
 */
function applyFormError(error) {
  if (handleUnauthorized(error)) return
  if (error.code === 'NEX-ACC-001') {
    fieldErrors.value = { code: 'Ya existe una cuenta con ese código en esta compañía.' }
    return
  }
  if (error.code === 'NEX-ACC-002') {
    formError.value = 'Esta cuenta ya tiene movimientos en asientos publicados o revertidos: no se pueden cambiar su código, nombre ni tipo. Solo se puede activar o desactivar.'
    return
  }
  if (error.status === 400 && typeof error.errors === 'object') {
    const mapped = {}
    for (const field of formFields) {
      const value = error.errors[field]
      if (value) mapped[field] = Array.isArray(value) ? value[0] : value
    }
    fieldErrors.value = mapped
    if (Object.keys(mapped).length) return
  }
  if (error.status === 403) formError.value = 'No tenés permiso para modificar el plan de cuentas de esta compañía.'
  else if (error.status === 404) formError.value = 'La cuenta ya no existe. Actualizá el listado.'
  else formError.value = 'No se pudo guardar la cuenta. Intentá nuevamente.'
}

/**
 * Activa o desactiva una cuenta (la API no permite eliminarlas).
 * @version 1.0
 * @author Thiago
 */
async function toggleActive(account) {
  if (togglingId.value !== null || !activeCompany.value) return
  const activating = !account.is_active
  actionError.value = ''
  statusMessage.value = ''
  togglingId.value = account.id
  try {
    await updateAccount(activeCompany.value.id, account.id, { is_active: activating })
    statusMessage.value = activating ? 'Cuenta activada.' : 'Cuenta desactivada.'
    await loadAccounts()
  } catch (error) {
    if (handleUnauthorized(error)) return
    if (error.status === 403) actionError.value = 'No tenés permiso para modificar el plan de cuentas de esta compañía.'
    else if (error.status === 404) actionError.value = 'La cuenta ya no existe. Actualizá el listado.'
    else actionError.value = 'No se pudo actualizar la cuenta. Intentá nuevamente.'
  } finally {
    togglingId.value = null
  }
}
</script>