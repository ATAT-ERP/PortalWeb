<h1 align="center">PortalWeb</h1>

<p align="center">
  Frontend web de <strong>A.T.A.T. ERP</strong> para contadores y estudios contables.<br>
  Gestión de compañías y documentos de sus clientes, conectada a la API de NexusBack.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue_3-3b4f5e?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-3b4f5e?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Vue_Router-3b4f5e?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue Router">
  <img src="https://img.shields.io/badge/PrimeVue-a83a42?style=for-the-badge&logo=primevue&logoColor=white" alt="PrimeVue">
  <img src="https://img.shields.io/badge/Lucide-3b4f5e?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide">
</p>

Vue 3 y Vite forman la base del frontend, con Vue Router para la navegación. La interfaz combina CSS propio, componentes PrimeVue con el tema **Aura** e iconos de Lucide.

## Instalación y ejecución

Requiere **Node.js `^20.19.0` o `>=22.12.0`**, npm y acceso a NexusBack.

Desde la raíz del repositorio, instalá las dependencias:

```bash
npm install
```

Prepará `.env` según la sección de configuración e iniciá el frontend:

```bash
npm run dev
```

Abrí la dirección indicada por Vite, habitualmente `http://localhost:5173`.

Para generar la compilación en `dist/`:

```bash
npm run build
```

Para revisar esa compilación localmente:

```bash
npm run preview
```

## Configuración

Creá `.env` a partir de `.env.example` y elegí la URL de NexusBack. La base debe incluir `/api`:

```ini
# Backend local
# VITE_API_URL=http://localhost:8000/api

# Backend Render
VITE_API_URL=https://nexusback-p0xi.onrender.com/api
```

Dejá **una sola asignación activa de `VITE_API_URL`**; el `.env.example` actual incluye ambas sin comentar. Para usar el backend local, descomentá su línea y comentá la de Render.

**Reiniciá Vite después de modificar `.env`.** Si usás una compilación de producción, volvé a generarla con la configuración elegida.

NexusBack debe estar disponible y permitir por CORS el origen de PortalWeb. Podés ejecutar el frontend localmente contra Render: esa conexión corresponde al backend y no implica que PortalWeb esté publicado.

## Funcionalidades actuales

- **Acceso:** página pública, registro, inicio y cierre de sesión.
- **Mi cuenta:** consulta del perfil, edición de nombre y apellido y cambio de contraseña.
- **Compañías:** listado, búsqueda, creación, edición y selección de la compañía activa.
- **Documentos:** carga, listado, búsqueda por nombre y descarga para la compañía activa.

La sesión se guarda por pestaña en `sessionStorage`. Las rutas privadas requieren un token y los servicios consumen la API con autenticación Bearer, sin renovación automática.

## Pendientes

**Accounting y Billing** aún requieren integración visual y no tienen pantallas ni rutas registradas. Inicio conserva datos de ejemplo y espacios pendientes para accesos rápidos y novedades. La recuperación de contraseña y la eliminación de compañías desde la interfaz tampoco están implementadas.

## Documentación

- [Arquitectura del frontend](docs/ARCHITECTURE.md) y [guía de trabajo](docs/WORKFLOW.md).
- [Integración con NexusBack](docs/nexusback/README.md) y [reglas de integración](docs/nexusback/INTEGRATION_RULES.md).
- [Contrato de usuarios](docs/nexusback/users.md).
- [Convenciones para agentes](AGENTS.md).

Algunas referencias en `docs/` todavía describen sólo el login como integrado y restringen Company; requieren actualización frente al estado del código resumido aquí.
