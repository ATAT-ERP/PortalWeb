---
name: frontend-change
description: Modifica, corrige, revisa o extiende páginas, componentes, servicios, routing, integración con API, sesión o estilos existentes de PortalWeb.
---

# Cambiar código existente de PortalWeb

1. Confirmá el alcance exacto. Leé completos los archivos afectados, buscá implementaciones equivalentes e identificá consumidores y dependencias relevantes antes de editar.
2. Si tocás NexusBack, revisá el service, la documentación del módulo y los request/response reales. Preservá contratos; no inventes endpoints, campos ni transformaciones. Si tocás sesión, mantené `sessionStorage` y los servicios de sesión actuales salvo requerimiento explícito.
3. Si tocás routing, conservá el patrón de `src/router/index.js`: rutas públicas directas y área privada bajo `AppLayout.vue` con `meta.requiresAuth` y el guard existente.
4. Si tocás estilos, reutilizá las variables de `src/assets/global.css`, mantené el cambio localizado en el CSS de su página/layout y conservá el responsive actual, salvo que la tarea requiera cambiarlo. Usá la iconografía existente cuando corresponda.
5. Evitá estados, watchers, computed, props, condicionales, optional chaining o fallbacks innecesarios. No agregues abstracciones ni dependencias para un único caso cuando el patrón existente basta.
6. No refactorices código no relacionado. Verificá el flujo principal y los casos realmente afectados.

Al finalizar, informá los archivos modificados, el comportamiento implementado, contratos afectados si los hubiera, cambios de integración/routing/estilos, validaciones realizadas, decisiones interpretadas y deuda detectada fuera de alcance.
