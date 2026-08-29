# PortalWeb — instrucciones para agentes

## Fuente de verdad y alcance

- El código y la documentación existentes son la fuente principal de convenciones. Estas instrucciones no autorizan a rediseñar PortalWeb según una arquitectura ideal.
- Antes de introducir un patrón, revisá cómo resuelve el mismo problema el proyecto. Si no hay una convención clara, aplicá la solución mínima compatible con los casos más cercanos.
- Realizá sólo cambios de la tarea. No hagas refactors laterales ni modifiques páginas, componentes o estilos ajenos; informá la deuda encontrada fuera de alcance.
- No crees abstracciones, composables, stores, helpers, wrappers, componentes genéricos ni capas de servicio si el patrón actual resuelve la tarea. No agregues dependencias sin una necesidad concreta.

## Convenciones verificadas

- Las pantallas están en `src/pages/`, agrupadas por funcionalidad cuando corresponde. `AppLayout.vue` contiene el área privada; para nuevos componentes, revisá primero la organización usada por páginas equivalentes antes de introducir una estructura nueva.
- Las rutas se registran en `src/router/index.js`. Las públicas son rutas directas; las privadas son hijas del layout con `meta.requiresAuth` y el guard consulta `getAccessToken()`.
- El flujo hacia NexusBack es `Page/Component → service → api.js → NexusBack`. `api.js` usa `VITE_API_URL`; los services pasan paths relativos con trailing slash y no repiten `/api`.
- La sesión se guarda sin transformar en `sessionStorage`, clave `atat_session`. Usá los servicios de sesión existentes y mantené el mecanismo actual.
- `src/assets/global.css` define tokens globales. Cada página y el layout importan su CSS específico desde `src/assets/css/`. La iconografía actual usa `@lucide/vue`.

## Contratos y UI

- No inventes ni reinterpretés contratos de NexusBack. Antes de cambiar una integración, revisá el service, la documentación del módulo y el contrato real. Conservá nombres, request/response y manejo de sesión; distinguí campos opcionales de los garantizados.
- No agregues defaults, optional chaining ni condicionales defensivos si el contrato garantiza el dato; ante duda, verificá el origen.
- Conservá la identidad visual: reutilizá variables globales e iconos existentes cuando correspondan, localizá los estilos de página/componente y no conviertas una mejora funcional en un rediseño ni agregues una librería UI.

## Skills

- Para crear o estructurar una página, sección o módulo, usá `.agents/skills/frontend-module/SKILL.md`.
- Para modificar páginas, componentes, rutas, servicios, API, sesión o estilos existentes, usá `.agents/skills/frontend-change/SKILL.md`.
