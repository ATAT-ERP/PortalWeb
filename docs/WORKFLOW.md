# Guía de trabajo

Esta guía permite incorporar una funcionalidad sin tener que conocer una arquitectura compleja.

## Crear una funcionalidad nueva: Clientes

### 1. Crear las páginas

Agrupá las pantallas en la carpeta de su funcionalidad:

```text
src/pages/clients/
├── ClientsPage.vue
└── ClientFormPage.vue
```

### 2. Crear el service

Creá `src/services/clients.service.js`. El service usa `api.js`, que ya conoce la URL base de NexusBack:

```js
import { api } from './api'

export function getClients() {
  return api.get('/clients/')
}
```

No llames a `fetch('http://localhost:8000/api/clients/')` desde una página. La configuración HTTP y la URL base están centralizadas en `api.js`.

### 3. Usar el service desde la página

La página importa las funciones del service y mantiene allí el estado que solo le pertenece. No hace falta crear un store global para datos propios de esa pantalla.

### 4. Agregar la ruta

Registrá la página en `src/router/index.js`. Cada nueva ruta apunta a su página correspondiente.

### 5. Extraer componentes solo si hacen falta

Si el formulario o la tabla empieza a crecer, podés extraerlos de la página:

```text
src/components/clients/
├── ClientForm.vue
└── ClientTable.vue
```

Esto es opcional: no se crean componentes únicamente para cumplir una estructura. Empezá por la página y extraé una parte cuando aporte claridad o reutilización.

## Regla práctica

Buscá primero la funcionalidad en `src/pages/<funcionalidad>/`, centralizá sus llamadas en `src/services/` y agregá una nueva capa solo cuando resuelva una necesidad concreta.
