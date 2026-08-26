# Arquitectura de Portal

## Objetivo

Mantener Portal fácil de entender y de ampliar, sin añadir capas ni carpetas antes de que exista una necesidad concreta.

## Flujo principal

```text
Router → Page → Service → api.js → NexusBack
```

NexusBack expone una API REST bajo `/api/`, sin `/api/v1`. La URL base se configura mediante `VITE_API_URL`.

## Estructura

```text
src/
├── assets/       Estilos o recursos compartidos.
├── components/   Partes reutilizables de una o más páginas.
├── pages/        Pantallas, agrupadas por funcionalidad.
├── router/       Registro de rutas de Vue Router.
├── services/     Comunicación con NexusBack y sesión local.
├── utils/        Funciones pequeñas, puras y reutilizables.
├── App.vue       Entrada visual del router.
└── main.js       Creación y configuración de la aplicación.
```

## Responsabilidades

- **pages:** es el lugar principal de trabajo. Cada pantalla se agrupa en `pages/<funcionalidad>/`.
- **components:** contiene solo piezas reutilizables o extracciones necesarias para dividir una página grande.
- **services:** agrupa las operaciones de dominio y la sesión local. `api.js` es genérico; `user.service.js` concentra users y `session.service.js` usa `sessionStorage` con la key `atat_session`.
- **router:** relaciona una URL con una página.
- **utils:** contiene formateos, validaciones u otras funciones reutilizables sin estado.
- **assets:** contiene estilos globales y recursos visuales compartidos.

`services/api.js` es el único punto común de infraestructura HTTP. Usa `fetch`, toma la base desde `VITE_API_URL`, procesa JSON, maneja respuestas sin contenido y lanza errores para respuestas HTTP no exitosas.

## Rutas y páginas

| Ruta | Componente |
| --- | --- |
| `/` | `IndexPage.vue` (entrada pública) |
| `/login` | `LoginPage.vue` |
| `/home` | `AppLayout.vue` → `HomePage.vue` |
| `/cuenta` | `AppLayout.vue` → `AccountPage.vue` |

`IndexPage.vue` reemplaza a la anterior landing page.

## Estado actual de users

Solo el login está conectado a UI. `LoginPage` llama a `userService.login`, guarda la respuesta real en `sessionStorage` y navega a `/home`. Las funciones restantes de `user.service.js` están preparadas para futuras issues, sin flujos visuales implementados.

## Reglas

1. Las pantallas van en `pages/`, agrupadas por funcionalidad.
2. Las llamadas al backend van en `services/`.
3. Las páginas no repiten configuración HTTP ni URLs completas.
4. `components/` se usa solo cuando algo se reutiliza o una página necesita dividirse.
5. `stores/` se reserva para estado realmente global.
6. `utils/` contiene únicamente utilidades realmente reutilizables.
7. No se crean abstracciones, capas ni carpetas antes de necesitarlas.
