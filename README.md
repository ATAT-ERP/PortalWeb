# Portal

Frontend web de **A.T.A.T. ERP**. Consume por HTTP/JSON la API REST de **NexusBack**.

## Stack

- Vue 3
- Vite
- JavaScript
- Vue Router
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

La variable `VITE_API_URL` define la base de la API versionada, por ejemplo:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

No se versiona el archivo `.env`; sí se incluye `.env.example` como referencia.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Guía de trabajo](docs/WORKFLOW.md)
