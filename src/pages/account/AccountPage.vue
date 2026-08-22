<template>
  <div class="account-page">
    <!-- Header con ícono -->
    <header class="page-header">
      <div class="header-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div class="header-text">
        <h1>Mi cuenta</h1>
        <p>Información de tu identidad dentro de A.T.A.T. ERP.</p>
      </div>
    </header>

    <!-- Tarjeta de Perfil -->
    <section class="profile-card">
      <div class="profile-avatar" aria-hidden="true">{{ initials }}</div>

      <dl class="profile-fields">
        <div class="field-row">
          <dt>NOMBRE</dt>
          <dd>{{ profile.first_name }}</dd>
        </div>
        <div class="field-row">
          <dt>APELLIDO</dt>
          <dd>{{ profile.last_name }}</dd>
        </div>
        <div class="field-row">
          <dt>EMAIL</dt>
          <dd class="email-value">{{ profile.email }}</dd>
        </div>
        <div class="field-row">
          <dt>ESTADO DE LA CUENTA</dt>
          <dd class="status-value">
            <span class="status-badge">{{ status }}</span>
          </dd>
        </div>
      </dl>
    </section>

    <!-- Tarjeta de Seguridad -->
    <section class="security-card">
      <header class="security-header">
        <div class="security-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div class="security-text">
          <h2>Seguridad</h2>
          <p>Espacio reservado para la actualización de credenciales de la cuenta.</p>
        </div>
      </header>

      <form class="password-form" @submit.prevent="handleChangePassword">
        <div class="field">
          <label for="current-password">Contraseña actual</label>
          <input 
            id="current-password" 
            v-model="passwordForm.current"
            type="password" 
            autocomplete="current-password" 
            placeholder="••••••••"
          />
        </div>

        <div class="form-row">
          <div class="field">
            <label for="new-password">Nueva contraseña</label>
            <input 
              id="new-password" 
              v-model="passwordForm.newPass"
              type="password" 
              autocomplete="new-password" 
              placeholder="••••••••"
            />
          </div>

          <div class="field">
            <label for="confirm-password">Confirmar nueva contraseña</label>
            <input 
              id="confirm-password" 
              v-model="passwordForm.confirmPass"
              type="password" 
              autocomplete="new-password" 
              placeholder="••••••••"
            />
          </div>
        </div>

        <button type="submit" class="submit-btn">
          Cambiar contraseña
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const profile = ref({
  first_name: 'Nombre',
  last_name: 'Apellido',
  email: 'usuario@ejemplo.com',
  is_active: true
})

const passwordForm = ref({
  current: '',
  newPass: '',
  confirmPass: ''
})

const initials = computed(() =>
  `${profile.value.first_name[0] ?? ''}${profile.value.last_name[0] ?? ''}`.toUpperCase()
)

const status = computed(() => (profile.value.is_active ? 'Activa' : 'Inactiva'))

function handleChangePassword() {
  // TODO: conectar el cambio de contraseña con el backend en una iteración posterior.
}
</script>

<style scoped>
.account-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--accent);
  color: #ffffff;
  flex-shrink: 0;
}

.header-text h1 {
  margin: 0 0 0.2rem;
  font-size: 1.4rem;
  font-weight: 650;
  color: var(--ink);
}

.header-text p {
  margin: 0;
  font-size: 0.88rem;
  color: var(--ink-soft);
}

/* Tarjetas base */
.profile-card,
.security-card {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.6rem;
  box-shadow: 0 1px 3px rgba(18, 35, 61, 0.04);
}

/* Específicos de Perfil */
.profile-card {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.profile-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--accent);
  color: #ffffff;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.profile-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem 1.75rem;
  margin: 0;
  flex: 1;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-row dt {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ink-soft);
  letter-spacing: 0.06em;
}

/* Especificidad corregida sin usar !important */
.field-row dd {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ink);
}

.field-row dd.email-value {
  font-size: 0.98rem;
}

.field-row dd.status-value {
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(79, 122, 107, 0.12);
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 600;
}

/* Específicos de Seguridad */
.security-header {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 1.35rem;
}

.security-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--accent);
  color: #ffffff;
  flex-shrink: 0;
}

.security-text h2 {
  margin: 0 0 0.2rem;
  font-size: 1.15rem;
  font-weight: 650;
  color: var(--ink);
}

.security-text p {
  margin: 0;
  font-size: 0.86rem;
  color: var(--ink-soft);
}

/* Formulario */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  max-width: 540px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink);
}

.field input {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  font-size: 0.92rem;
  color: var(--ink);
  background: #fbfbfa;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 122, 107, 0.14);
}

.submit-btn {
  align-self: flex-start;
  margin-top: 0.4rem;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 10px;
  background: var(--ink);
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.submit-btn:hover {
  background: #1b3352;
}

/* Adaptación Responsive */
@media (max-width: 640px) {
  .profile-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .password-form {
    max-width: 100%;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
