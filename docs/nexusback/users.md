# Módulo users - NexusBack

Última verificación: 17-08-2026  
Backend: NexusBack  
Frontend consumidor: PortalWeb

Los paths de este documento son los que se pasan a `api.js`; por eso no incluyen `/api`. La URL HTTP equivalente comienza con `/api`.

## Perfil User

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "",
  "last_name": "",
  "avatar_path": null,
  "is_active": true,
  "is_system_admin": false
}
```

| Campo | Tipo | Nullable | CRUD normal | Administración |
| --- | --- | --- | --- | --- |
| `id` | UUID | No | Solo lectura | Solo lectura |
| `email` | string | Sí | Solo lectura | Solo lectura |
| `first_name` | string, máx. 150 | No | Editable; acepta `""` | Igual |
| `last_name` | string, máx. 150 | No | Editable; acepta `""` | Igual |
| `avatar_path` | string, máx. 500 | Sí | Editable | Igual |
| `is_active` | boolean | No | Solo lectura | Cambia con activate/deactivate |
| `is_system_admin` | boolean | No | Solo lectura | Cambia con system-admin |

`public.users` no almacena contraseñas. `avatar_path` es actualmente solo una string/ruta; no existe upload de avatar.

## Sesión

### Login

```text
POST /api/users/login/
```

Desde PortalWeb se llama como `POST /users/login/` a través de `api.js`.

```json
{
  "email": "...",
  "password": "..."
}
```

Respuesta exitosa (`200 OK`):

```json
{
  "id": "uuid",
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "bearer"
}
```

Login no devuelve el perfil completo. El campo `id` permite consultar posteriormente `/users/<id>/`. NexusBack no tiene endpoint de refresh. La existencia de `refresh_token` no determina todavía cómo debe persistirlo PortalWeb.

### Logout

`POST /users/logout/` requiere Bearer, no tiene body y responde `204 No Content`. NexusBack usa alcance local (`scope=local`). Tras el éxito PortalWeb debe dejar de usar su sesión local; no debe asumir que un JWT emitido queda inutilizable inmediatamente.

## Endpoints

| Funcionalidad | Método | Path para `api.js` | Auth | Éxito |
| --- | --- | --- | --- | --- |
| Registro | POST | `/users/register/` | Pública | 201, `{ id }` |
| Login | POST | `/users/login/` | Pública | 200, sesión |
| Logout | POST | `/users/logout/` | Bearer | 204 |
| Cambio de contraseña | POST | `/users/password/change/` | Bearer | 204 |
| Listado | GET | `/users/` | System admin | 200, `User[]` |
| Búsqueda | GET | `/users/search/?q=...` | System admin | 200, `User[]` |
| Detalle | GET | `/users/<uuid>/` | Propietario o system admin | 200, `User` |
| Reemplazo editable | PUT | `/users/<uuid>/` | Propietario o system admin | 200, `User` |
| Actualización parcial | PATCH | `/users/<uuid>/` | Propietario o system admin | 200, `User` |
| Activación | POST | `/users/<uuid>/activate/` | System admin | 200, `User` |
| Desactivación | POST | `/users/<uuid>/deactivate/` | System admin | 200, `User` |
| Administración global | POST | `/users/<uuid>/system-admin/` | System admin | 200, `User` |

### Register

`POST /users/register/` es público y recibe:

```json
{
  "email": "...",
  "password": "..."
}
```

Responde `201 Created` con `{ "id": "uuid" }`. No existe `POST /users/` para crear perfiles directamente.

### Login

`POST /users/login/` es público y usa el request y la respuesta de sesión descritos arriba.

### Logout

`POST /users/logout/` requiere `Authorization: Bearer <access_token>`, no recibe body y responde 204.

### List

`GET /users/` requiere `is_system_admin = true`. Devuelve un array sin paginación ni orden garantizado.

### Search

`GET /users/search/?q=...` requiere `is_system_admin = true`. `q` es obligatorio y se valida luego de recortar sus extremos. Busca sin distinguir mayúsculas/minúsculas en `first_name`, `last_name` y `email`.

### Detail

`GET /users/<uuid>/` permite consultar el perfil propio o, con administración global, cualquier perfil.

### PUT

`PUT /users/<uuid>/` permite modificar el perfil propio o cualquier perfil si quien opera es system admin. Los campos editables son opcionales; por tanto, este body es válido y no cambia datos:

```json
{}
```

No interpretar este `PUT` como reemplazo completo obligatorio. Los campos editables son `first_name`, `last_name` y `avatar_path`.

### PATCH

`PATCH /users/<uuid>/` es parcial y tiene los mismos permisos y campos editables que PUT.

### Activate

`POST /users/<uuid>/activate/` requiere system admin y devuelve el `User` actualizado con `is_active: true`.

### Deactivate

`POST /users/<uuid>/deactivate/` requiere system admin y devuelve el `User` actualizado con `is_active: false`. Un administrador no puede desactivarse a sí mismo.

### System admin

`POST /users/<uuid>/system-admin/` requiere system admin. Recibe:

```json
{
  "is_system_admin": true
}
```

Enviar `false` remueve el privilegio. Un administrador no puede removerse a sí mismo.

### Password change

`POST /users/password/change/` requiere Bearer y no recibe UUID. Afecta solamente al usuario autenticado y no modifica `public.users`.

```json
{
  "current_password": "...",
  "new_password": "...",
  "confirm_password": "..."
}
```

Responde 204. `confirm_password` se valida en NexusBack y la política efectiva de contraseña pertenece a Supabase Auth. No existe blanqueo administrativo, recuperación, contraseña temporal ni `must_change_password`.

## Permisos

| Operación | Público | Usuario propio | `is_system_admin` |
| --- | ---: | ---: | ---: |
| Register | Sí | — | — |
| Login | Sí | — | — |
| Logout | — | Sí | Sí, sobre su propia sesión |
| List | — | — | Sí |
| Search | — | — | Sí |
| Detail | — | Sí | Sí |
| PUT / PATCH | — | Sí | Sí |
| Activate / Deactivate | — | — | Sí |
| System admin | — | — | Sí |
| Password change | — | Sí | Sí, solo su propia contraseña |

## Errores

La UI debe guiarse principalmente por `code`, `status` y `errors`, no por comparar strings exactos de `message`. `errors` es esperado principalmente en validaciones (`NEX-USR-003`).

| Código | HTTP | Significado útil para PortalWeb | Operaciones relevantes | `errors` |
| --- | --- | --- | --- | --- |
| `NEX-USR-001` | 403 | No existe perfil local utilizable para la identidad autenticada. | Endpoints protegidos | No esperado |
| `NEX-USR-002` | 403 | El perfil local está inactivo. | Endpoints protegidos | No esperado |
| `NEX-USR-003` | 400 | Request inválido o validación fallida. Asociar errores a campos cuando estén presentes. | Register, login, search, PUT, PATCH, system-admin, password change | Sí, cuando aplica |
| `NEX-USR-004` | 404 | No existe el usuario solicitado. | Detail, PUT, PATCH, acciones administrativas | No esperado |
| `NEX-USR-005` | 502 | Auth no pudo crear la cuenta durante registro. | Register | No esperado |
| `NEX-USR-006` | 500 | La identidad remota fue creada, pero no se completó el perfil local. | Register | No esperado |
| `NEX-USR-007` | 429 | Rate limit de Auth; no reintentar inmediatamente. | Register, login, password change | No esperado |
| `NEX-USR-008` | 401 | Credenciales inválidas. En login: `Email o contraseña incorrectos.` En cambio de contraseña: `Contraseña actual incorrecta.` | Login, password change | No esperado |
| `NEX-USR-009` | 502 | Auth no pudo iniciar sesión. | Login | No esperado |
| `NEX-USR-010` | 401 | Bearer ausente, mal formado, inválido o vencido. | Endpoints protegidos | No esperado |
| `NEX-USR-011` | 403 | Permiso insuficiente, incluido acceder a otro perfil sin ser admin o ciertas autoacciones administrativas. | Recursos y acciones protegidos | No esperado |
| `NEX-USR-012` | 500 | Fallo técnico interno asociado a una operación del módulo/Auth. Conservar el estado local prudente y mostrar un error técnico sin exponer detalles internos. | Operación que lo emita | No esperado |
| `NEX-USR-013` | 502 | Auth no pudo cerrar la sesión. | Logout | No esperado |
| `NEX-USR-014` | 502 | Auth no pudo actualizar la contraseña. | Password change | No esperado |

## Services futuros

La organización prevista, sin implementarla todavía, es:

| Service | Operaciones |
| --- | --- |
| `auth.service.js` | `register`, `login`, `logout`, `changePassword` |
| `users.service.js` | `list`, `getById`, `update`, `search`, `activate`, `deactivate`, `setSystemAdmin` |

No agregar mappers. Las respuestas deben usarse con el contrato original en `snake_case`.

## Ejemplos conceptuales

```js
const user = await usersService.getById(id)

user.first_name
user.last_name
user.is_active
```

```js
await usersService.update(id, {
  first_name: form.first_name,
  last_name: form.last_name,
})
```
