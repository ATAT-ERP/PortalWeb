# Portal

Frontend web de **A.T.A.T. ERP**. Consume por HTTP/JSON la API REST de **NexusBack**.

## Stack

- Vue 3
- Vite
- JavaScript
- Vue Router
- @lucide/vue
- npm

## Requisitos

- Node.js compatible con Vite
- npm

## Instalación y ejecución

1. Creá `.env` a partir de `.env.example` y configurá la URL de NexusBack.
2. Instalá las dependencias:

   ```bash
   npm install
   ```

3. Iniciá el entorno de desarrollo:

   ```bash
   npm run dev
   ```

## Build de producción

```bash
npm run build
```

## Vista previa de producción

```bash
npm run preview
```

## Instalar una dependencia

El gestor de paquetes oficial de Portal es **npm**. Para incorporar una dependencia futura, usá:

```bash
npm install nombre-paquete
```

## Configuración

La variable `VITE_API_URL` define la base de NexusBack:

```env
VITE_API_URL=http://localhost:8000/api
```

NexusBack no usa `/api/v1`. No se versiona el archivo `.env`; sí se incluye `.env.example` como referencia.

## Integración users actual

El login real está conectado desde `LoginPage`:

```text
LoginPage → userService.login(email, password) → POST /api/users/login/
          → sessionService.saveSession(response) → /home
```

La sesión se persiste por pestaña mediante `sessionStorage`. Las demás operaciones disponibles en `user.service.js` todavía no están conectadas a una interfaz.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Guía de trabajo](docs/WORKFLOW.md)
- [Integración con NexusBack](docs/nexusback/README.md)
- [Contrato del módulo users](docs/nexusback/users.md)

## Instrucciones para agentes de desarrollo

PortalWeb incluye instrucciones versionadas para asistentes de código y agentes internos.

* `AGENTS.md`: convenciones y reglas generales del repositorio.
* `.agents/skills/frontend-module/`: guía para crear nuevas páginas, secciones o módulos respetando la arquitectura existente.
* `.agents/skills/frontend-change/`: guía para modificar funcionalidades existentes sin alterar contratos o patrones fuera de alcance.
* `CLAUDE.md` y `.gemini/settings.json`: integración con herramientas compatibles.

Estas instrucciones buscan mantener consistencia entre contribuciones y preservar la arquitectura y los contratos actuales del proyecto.
