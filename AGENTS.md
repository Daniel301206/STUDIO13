# AGENTS.md — Studio13

Guía para agentes de IA que trabajen en este repositorio. El proyecto es un sitio web de fotografía con tres aplicaciones independientes dentro de `src/`. **Todo el contenido de UI, mensajes y documentación va en español.**

## Estructura

```text
STUDIO13/
├── src/
│   ├── frontend/   # Sitio público (React + Vite + Tailwind 4), puerto 3000
│   ├── admin/      # Panel administrativo (React + Vite + Tailwind 4), puerto 3002
│   └── backend/    # API REST (Node + Express 5 + Prisma + PostgreSQL), por defecto 3001
├── Readme.md
└── AGENTS.md
```

- Cada app tiene su propio `package.json` y `node_modules`; **no hay workspace raíz**.
- El backend también tiene `src/backend/prisma/` (esquema y migraciones).
- `src/backend/.env` **no está versionado** y contiene secretos: **nunca imprimirlo, commitearlo ni exponer sus valores**. Usa `.env.example` para documentar variables.

## Comandos

Ejecuta cada comando desde la carpeta de la app correspondiente.

| App | Instalar | Desarrollo | Build | Lint |
| --- | --- | --- | --- | --- |
| `src/frontend` | `npm install` | `npm run dev` | `npm run build` | `npm run lint` |
| `src/admin` | `npm install` | `npm run dev` | `npm run build` | `npm run lint` |
| `src/backend` | `npm install` | `npm run dev` | — | — |

Backend extra:

- Prisma: `npm run prisma:generate`, `npm run prisma:studio`, `npx prisma migrate dev`.
- Semillas de administradores: `npm run admin:bootstrap`, `npm run admin:owner:ensure`, `npm run admin:accounts:ensure`.
- Documentación Swagger en `http://localhost:3001/api-docs`.

No ejecutes `npm install` ni builds salvo que sea necesario para la tarea; son pesados. No toques `node_modules/` ni `dist/`.

## Backend (`src/backend`)

- ESM (`"type": "module"`), imports con extensión `.js`. Prefiere `import`/`export`.
- Express 5. El arranque y montaje de rutas es dinámico en `index.js`; los routers viven en `routes/`.
- Patrón por entidad: `routes/` → `controllers/` → `prisma` (`config/databases.js`).
  - Los controladores exportan un objeto por defecto: `{ list, getById, create, update, remove }`.
  - Usa los helpers de `controllers/_shared.js`: `parseId`, `isObjectBody`, `pickDefined`, `reportControllerError`.
  - Valida entrada manualmente y responde errores como `{ "error": "mensaje en español" }` con el status adecuado (400/401/404/413/500).
  - Usa `prisma.$transaction` cuando una operación implica varias escrituras (p. ej. crear servicio + galería).
- Middleware: `requireAdmin` valida `Authorization: Bearer <token>`; `requireRole` restringe por rol. Rutas:
  - `/api/auth` público para login.
  - `/api` público (`publicRoutes`).
  - `/api/admin` → `requireAdmin` + rol `OWNER`.
  - `/api/tecnico` → `requireAdmin` (rol `DEVELOPER`).
  - `/api/clientes`, `/api/membresias`, `/api/reservaciones`.
- Roles (`auth/adminRoles.js`): `OWNER = "DUEÑA"`, `DEVELOPER = "DESARROLLADOR"`. En Prisma se mapean a `OWNER` / `DEVELOPER`.
- Configuración centralizada en `config/env.js`; variables obligatorias como `DATABASE_URL` lanzan error al arrancar. Añade nuevas variables ahí y en `.env`.
- Subida de imágenes: `multer` en memoria + `config/imageStorage.js`. Límites: 5 MB general, 30 MB para galería. Formatos: JPG/JPEG/PNG/WEBP. Las imágenes de galería se redimensionan a máx. 1920 px y se convierten a WebP (calidad 80). Soporta Cloudinary o almacenamiento local en `uploads/`.
- Documenta endpoints nuevos con JSDoc de Swagger (`@swagger`) en el archivo de rutas correspondiente; mantén los tags y esquemas en `swagger.js`.
- En Prisma:
  - Cambios de esquema → nueva migración en `prisma/migrations/` (`npx prisma migrate dev --name ...`), nunca edites migraciones ya aplicadas.
  - Sigue la convención de nombres del esquema: modelos en PascalCase, campos en camelCase, enums en PascalCase con `@map` cuando el valor público lleva tilde.
  - `Decimal` para precios; `Timestamptz(3)` en fechas de negocio.

## Frontend público (`src/frontend`)

- React 19 + Vite + React Router 7 (`BrowserRouter`) + Tailwind CSS 4.
- Rutas en `src/App.jsx`: `/`, `/servicios`, `/portafolio`, `/paquetes`, `/nosotros`, `/contacto`.
- Las páginas viven en `src/pages/`; componentes reutilizables en `src/Components/`.
- `Layout.jsx` contiene la navegación y el footer; las páginas lo envuelven. Mantén la coherencia visual: paleta negro/blanco con acento `#a51c1c`, tipografías `Inter`, `Georgia`/`Fraunces`, tracking amplio y mayúsculas en etiquetas.
- API: `const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "")`. No hardcodees otras URLs; añade `VITE_API_URL` en `.env` solo si es necesario.
- Las llamadas `fetch` deben manejar `AbortController`, `response.ok`, estados de carga y errores sin romper la UI. Normaliza rutas `/uploads/` prefijando `API_BASE_URL`.
- Clases Tailwind v4 (p. ej. `bg-linear-to-br`, `z-100`, `max-w-340`, `h-14.5`). No introduzcas CSS global si Tailwind basta.

## Panel administrativo (`src/admin`)

- React 19 + Vite + React Router 7 + Tailwind 4. Entrada en `src/main.jsx` (`index.css` + `admin-theme.css`).
- Rutas protegidas en `src/App.jsx` con `RutaAdministrativa` y roles. `OWNER` ve gestión; `DEVELOPER` solo `/admin/Diagnostico`.
- Sesión en `sessionStorage`:
  - `studio13AdminToken` (token Bearer).
  - `studio13Admin` (JSON del admin).
  - Al recibir 401, limpia ambas claves y redirige a `/iniciar-sesion`.
- Usa los helpers de `src/pages/useAdminCollection.js`: `API_BASE_URL`, `adminHeaders(json)`, `useAdminCollection(endpoint)`, `mensajeError`, `redirigirSiNoAutorizado`. No dupliques lógica de fetch/autenticación.
- Las páginas CRUD siguen el patrón de `Servicios.jsx`: listado, modal de alta/edición, borrador local, estados `cargando`/`guardando`, mensajes de error/éxito y actualización optimista de la lista.
- Navegación lateral en `pages/Layout/AdminLayout.jsx` (`secciones` y `seccionesTecnicas`); añade ahí las pantallas nuevas y su ruta en `App.jsx`.
- Iconos: SVG inline con el componente `Icono` (`trazosIcono`). No añadas librerías de iconos.
- El panel usa textos de UI en español y comentarios mayormente en español.

## Convenciones generales

- Mantén el estilo existente: comillas dobles en backend, comillas simples en frontend, punto y coma consistente con el archivo que edites.
- No reformatees archivos completos ni cambies estilo ajeno a tu cambio.
- Prefiere reutilizar helpers y componentes existentes antes de crear nuevos.
- No elimines ni renombres archivos ajenos sin investigar antes (puede haber trabajo sin commitear).
- No commitees `node_modules/`, `dist/` ni `backend/uploads/`.
- Al terminar, ejecuta `npm run lint` en la app que modificaste (si aplica) y describe los cambios en español.
