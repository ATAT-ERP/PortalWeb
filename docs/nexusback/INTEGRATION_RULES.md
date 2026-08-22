# Reglas de integración con NexusBack

> Este documento define las convenciones obligatorias para cualquier código de PortalWeb que consuma NexusBack.

## Lectura previa obligatoria

Antes de modificar una integración:

1. Leer este documento.
2. Leer [README.md](README.md).
3. Leer el documento del módulo correspondiente.
4. Revisar el código existente relacionado.
5. No asumir endpoints o campos no documentados.

## Contrato de datos

Los objetos pertenecientes al contrato HTTP de NexusBack mantienen en PortalWeb los nombres definidos por el backend.

```js
const user = {
  id: '...',
  email: '...',
  first_name: '...',
  last_name: '...',
  avatar_path: null,
  is_active: true,
  is_system_admin: false,
}
```

Usar `user.first_name`, `user.last_name`, `user.is_active` y `user.is_system_admin`. No crear cambios de nombre solo por estilo, tales como `first_name → firstName`, `last_name → lastName` o `is_active → isActive`.

## Dominio y estado visual

Los datos de API o dominio usan `snake_case`. El estado interno o visual de Vue puede usar `camelCase`.

```js
const user = ref({
  first_name: '',
  last_name: '',
})

const showPassword = ref(false)
const isLoading = ref(false)
```

## No duplicar contratos

No crear DTOs, mappers, adapters, clases/modelos frontend ni representaciones paralelas si solamente duplican o renombran el contrato de NexusBack. Una transformación solo se introduce ante una necesidad funcional real y explícita.

## Services y HTTP

Mantener este flujo:

```text
Component / Page
        ↓
service
        ↓
api.js
        ↓
NexusBack
```

- No usar `fetch` directamente en componentes o páginas.
- No introducir Axios.
- No escribir endpoints repetidos dentro de componentes.
- No agregar `/api` a los paths de los services.

`api.js` debe permanecer independiente del dominio. No debe conocer `User`, `Company`, `Product` ni otros recursos: su responsabilidad es URL, JSON, headers, Bearer, respuestas y errores.

## Errores

Nunca descartar deliberadamente los errores estructurados de NexusBack. El frontend debe poder acceder, como mínimo, a:

```text
status
code
message
errors
detail
```

## Bearer y secretos

- No enviar Bearer en endpoints públicos.
- Enviar Bearer en endpoints protegidos.
- No colocar tokens en URLs, logs, mensajes visibles ni código versionado.

## Convenciones de URL

Usar:

```env
VITE_API_URL=http://localhost:8000/api
```

Y paths de service como:

```text
/users/...
```

Usar siempre trailing slash. Nunca usar `/api/v1` ni repetir el prefijo como `/api/api/...`.

## Funcionalidades inexistentes

Una integración no debe inventar refresh endpoint, recuperación de contraseña, blanqueo administrativo, upload de avatar, DELETE de usuarios, Company, roles empresariales ni permisos por módulo hasta que exista un contrato real y documentación correspondiente.
