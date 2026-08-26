# Integración de PortalWeb con NexusBack

Esta guía describe las reglas generales para que PortalWeb consuma cualquier módulo de NexusBack. Para reglas obligatorias, consultar [INTEGRATION_RULES.md](INTEGRATION_RULES.md); para usuarios, consultar [users.md](users.md).

## Base de API

En desarrollo local la base es:

```env
VITE_API_URL=http://localhost:8000/api
```

NexusBack usa el prefijo `/api`; no usa `/api/v1`. Como `VITE_API_URL` ya contiene `/api`, los services pasan a `api.js` paths relativos a esa base:

```text
/users/login/
/users/
/users/<uuid>/
```

No se deben pasar estos paths:

```text
/api/users/login/
/api/v1/users/login/
```

## Flujo HTTP

```text
Page / Component
        ↓
service del dominio
        ↓
api.js
        ↓
NexusBack
```

`api.js` es infraestructura HTTP genérica. Los services encapsulan las operaciones y endpoints de su dominio. Los componentes y páginas no usan `fetch` directamente ni repiten URLs del backend.

## JSON y URLs

Las solicitudes y respuestas del API son JSON cuando corresponde:

- Enviar `Accept: application/json`.
- Enviar `Content-Type: application/json` cuando haya body JSON.
- Tratar `204 No Content` como una respuesta exitosa sin body.
- Usar siempre trailing slash en los paths de NexusBack, por ejemplo `/users/login/`.

El `api.js` actual ya centraliza JSON y devuelve `null` para 204/205. No duplicar esa configuración en páginas.

## Sesión y Bearer

Los endpoints protegidos requieren:

```http
Authorization: Bearer <access_token>
```

El Bearer se adjunta solamente en endpoints protegidos; los endpoints públicos no lo requieren. No colocar tokens en URLs, logs, mensajes visibles ni código versionado.

El login actualmente implementado es:

```text
LoginPage
    ↓
userService.login(email, password)
    ↓
POST /api/users/login/
    ↓
sessionService.saveSession(response)
    ↓
/home
```

La respuesta se guarda por pestaña en `sessionStorage` bajo `atat_session`, sin transformar sus propiedades. Login no obtiene automáticamente el perfil. NexusBack no tiene endpoint de refresh y PortalWeb no implementa refresh automático.

`user.service.js` también expone `getById`, `update`, `register`, `logout` y `changePassword`, pero sus integraciones de UI corresponden a otras issues.

## Errores

NexusBack puede responder errores estructurados:

```json
{
  "code": "NEX-USR-003",
  "message": "Los datos enviados no son válidos.",
  "errors": {}
}
```

También puede devolver el formato habitual de DRF:

```json
{
  "detail": "..."
}
```

`api.js` normaliza el mensaje y conserva `status`, `code` y `errors` en el error. Prioriza `message`, luego `detail.message`, luego un `detail` string y finalmente un mensaje por status.

## Desarrollo local y CORS

PortalWeb normalmente corre en `http://localhost:5173` y NexusBack en `http://localhost:8000`. Para permitir el consumo desde el navegador, NexusBack debe recibir en su `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Después de cambiar una variable de `.env` usada por Docker, el contenedor debe iniciarse o recrearse para recibirla. No incluir secretos en documentación ni en archivos versionados.
