---
name: frontend-module
description: Crea, inicia, estructura o implementa una nueva página, flujo, sección o módulo funcional en PortalWeb, respetando las convenciones verificadas del repositorio.
---

# Crear un módulo de PortalWeb

1. Leé la tarea completa y separá: alcance, pantallas o flujos, datos requeridos, acciones, dependencias y fuera de alcance.
2. Buscá páginas o módulos equivalentes antes de diseñar archivos. Identificá cómo esos casos resuelven páginas, componentes, rutas, layout, servicios, sesión, NexusBack, assets, estilos y responsive cuando aplique.
3. Creá únicamente los archivos necesarios. Mantené nombres, estructura y estilo de los equivalentes; reutilizá componentes, services, tokens e iconos existentes cuando corresponda. No dupliques funcionalidad ya resuelta.
4. No crees por defecto stores globales, composables, wrappers, adapters, DTOs, helpers, utils, componentes genéricos, capas de servicios ni abstracciones de API. Sólo incorporalos si la tarea o un patrón equivalente demuestra que son necesarios.
5. Mantené cada responsabilidad donde el proyecto la ubica. No traslades lógica de backend al frontend ni agregues estados, props, fallbacks, validaciones o defensivas para escenarios futuros no requeridos.
6. Si consumís NexusBack, revisá primero el service y el contrato real. Conservá la estructura de services, no inventes respuestas ni cambies contratos desde el frontend. Para la API, usá `VITE_API_URL` a través de `api.js` y paths relativos con trailing slash.
7. Integrá el routing sólo con el patrón existente: rutas públicas directas; rutas privadas como hijas de `AppLayout.vue` bajo `meta.requiresAuth`. Mantené la sesión mediante los servicios existentes.
8. Conservá los estilos de las páginas equivalentes: reutilizá variables de `global.css`, `@lucide/vue` y CSS específico importado por la página o layout. No rediseñes áreas ajenas ni modifiques infraestructura salvo que integrar la funcionalidad lo requiera estrictamente.
9. Para cambios puntuales sobre código existente, aplicá también `.agents/skills/frontend-change/SKILL.md`.

Si no hay una convención uniforme, elegí la solución mínima compatible con los patrones más cercanos y explicá la decisión al finalizar.
