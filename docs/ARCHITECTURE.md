# Arquitectura de Portal

## Objetivo

Mantener Portal fácil de entender y de ampliar, sin añadir capas ni carpetas antes de que exista una necesidad concreta.

## Flujo principal

```text
Router → Page → Service → api.js → NexusBack
```

NexusBack expone una API REST versionada bajo `/api/`. La URL base se configura mediante `VITE_API_URL`.

## Estructura

```text
src/
├── assets/       Estilos o recursos compartidos.
├── components/   Partes reutilizables de una o más páginas.
├── pages/        Pantallas, agrupadas por funcionalidad.
├── router/       Registro de rutas de Vue Router.
├── services/     Comunicación con NexusBack.
├── stores/       Estado realmente global cuando se necesite.
├── utils/        Funciones pequeñas, puras y reutilizables.
├── App.vue       Entrada visual del router.
└── main.js       Creación y configuración de la aplicación.
```

## Responsabilidades

- **pages:** es el lugar principal de trabajo. Cada pantalla se agrupa en `pages/<funcionalidad>/`.
- **components:** contiene solo piezas reutilizables o extracciones necesarias para dividir una página grande.
- **services:** agrupa las funciones que consulta cada funcionalidad del backend.
- **router:** relaciona una URL con una página.
- **stores:** se reserva para sesión, usuario, permisos u otro estado compartido entre áreas.
- **utils:** contiene formateos, validaciones u otras funciones reutilizables sin estado.
- **assets:** contiene estilos globales y recursos visuales compartidos.

`services/api.js` es el único punto común de infraestructura HTTP. Usa `fetch`, toma la base desde `VITE_API_URL`, procesa JSON, maneja respuestas sin contenido y lanza errores para respuestas HTTP no exitosas.

## Reglas

1. Las pantallas van en `pages/`, agrupadas por funcionalidad.
2. Las llamadas al backend van en `services/`.
3. Las páginas no repiten configuración HTTP ni URLs completas.
4. `components/` se usa solo cuando algo se reutiliza o una página necesita dividirse.
5. `stores/` se reserva para estado realmente global.
6. `utils/` contiene únicamente utilidades realmente reutilizables.
7. No se crean abstracciones, capas ni carpetas antes de necesitarlas.
