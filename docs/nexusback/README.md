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

## Bearer

Los endpoints protegidos requieren:

```http
Authorization: Bearer <access_token>
```

El Bearer se adjunta solamente en endpoints protegidos; los endpoints públicos no lo requieren. La estrategia para mantener el token en PortalWeb aún no está definida. No colocar tokens en URLs, logs, mensajes visibles ni código versionado.

## Sesión

El flujo general es:

```text
login
    ↓
recibir sesión
    ↓
PortalWeb mantiene la sesión según una estrategia futura
    ↓
usar access_token como Bearer
```

NexusBack no tiene actualmente endpoint de refresh. Aunque login devuelva `refresh_token`, esta guía no define todavía dónde ni cómo persistirlo; tampoco prescribe localStorage, sessionStorage, cookies, Pinia ni Vuex.

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

La infraestructura frontend debe conservar como mínimo `status`, `code`, `message`, `errors` y `detail`; preferentemente debe conservar el body completo. El `api.js` actual todavía descarta parte de esa información en respuestas HTTP no exitosas: esa corrección queda para una tarea futura.

## Estado actual / requisito pendiente de integración: CORS

NexusBack todavía no tiene `django-cors-headers` ni `CORS_ALLOWED_ORIGINS` configurado. Por ello, PortalWeb servido por Vite desde otro origen no puede consumir el backend directamente desde el navegador hasta que se resuelva CORS o se utilice una estrategia same-origin/proxy. Este es el estado actual, no una instrucción para cambiarlo en esta documentación.
