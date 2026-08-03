# 📖 BIBLIA DEL PROYECTO — ImpresiónWeb

> **Documento maestro de referencia técnica, funcional y arquitectónica.**
> Versión del documento: 1.0 · Estado del código analizado: rama `main` (post‑PR #2).
> Propósito: servir de **especificación única** para comprender el 100 % de la aplicación
> y planificar su **migración a una aplicación de escritorio con Electron** y persistencia
> local, sin necesidad de consultar el código fuente de forma continua.
>
> Este documento se ha generado tras una inspección **archivo por archivo** de todo el
> repositorio (≈160 archivos, ≈12 600 líneas de código en `src/` y `prisma/`).

---

## 🗂️ ÍNDICE GENERAL

- [Capítulo 1 — Visión General del Proyecto](#capítulo-1--visión-general-del-proyecto)
  - 1.1 Finalidad · 1.2 Objetivos · 1.3 Filosofía de diseño · 1.4 Arquitectura general · 1.5 Flujo completo · 1.6 Ventajas · 1.7 Limitaciones actuales · 1.8 Glosario de dominio
- [Capítulo 2 — Arquitectura Completa](#capítulo-2--arquitectura-completa)
  - 2.1 Modelo en capas · 2.2 Diagrama lógico · 2.3 Responsabilidades por capa · 2.4 Comunicación entre módulos · 2.5 Flujo de datos · 2.6 Separación de responsabilidades · 2.7 Los dos runtimes (Edge/Node)
- [Capítulo 3 — Estructura del Repositorio](#capítulo-3--estructura-del-repositorio)
  - 3.1 Raíz · 3.2 `prisma/` · 3.3 `src/app/` · 3.4 `src/actions/` · 3.5 `src/services/` · 3.6 `src/repositories/` · 3.7 `src/validators/` · 3.8 `src/components/` · 3.9 `src/lib/` · 3.10 `src/hooks/` · 3.11 `src/types/`
- [Capítulo 4 — Dependencias](#capítulo-4--dependencias)
  - 4.1 Runtime · 4.2 Desarrollo · 4.3 Veredicto Electron por dependencia
- [Capítulo 5 — Flujo de la Aplicación](#capítulo-5--flujo-de-la-aplicación)
- [Capítulo 6 — Frontend](#capítulo-6--frontend)
- [Capítulo 7 — Backend](#capítulo-7--backend)
- [Capítulo 8 — Base de Datos Actual](#capítulo-8--base-de-datos-actual)
- [Capítulo 9 — Migración a Electron](#capítulo-9--migración-a-electron)
- [Capítulo 10 — Persistencia Local](#capítulo-10--persistencia-local)
- [Capítulo 11 — Sistema de Archivos](#capítulo-11--sistema-de-archivos)
- [Capítulo 12 — Seguridad](#capítulo-12--seguridad)
- [Capítulo 13 — Rendimiento](#capítulo-13--rendimiento)
- [Capítulo 14 — Roadmap Completo](#capítulo-14--roadmap-completo)
- [Capítulo 15 — Riesgos Técnicos](#capítulo-15--riesgos-técnicos)
- [Capítulo 16 — Conclusiones](#capítulo-16--conclusiones)
- [Apéndice A — Registro consolidado de deuda técnica](#apéndice-a--registro-consolidado-de-deuda-técnica)
- [Apéndice B — Inventario completo de archivos](#apéndice-b--inventario-completo-de-archivos)

> **Leyenda de prioridad** usada en todo el documento: 🔴 Alta · 🟡 Media · 🟢 Baja.

---

# Capítulo 1 — Visión General del Proyecto

## 1.1 Finalidad

**ImpresiónWeb** es una **aplicación web privada de gestión de una operación de impresión**.
Centraliza en un único panel de administración todo el ciclo productivo de un taller o
departamento de impresión: proyectos, trabajos de impresión, salidas de material a
destinos, inventario de artículos, consumibles (tintas y papel con su histórico),
incidencias documentadas y generación de reportes exportables.

Es un producto **monousuario administrador**: no hay registro público ni multi‑tenant.
Existe un único rol (`ADMIN`) y una única persona lo opera. Toda la superficie de la
aplicación está protegida tras autenticación; un visitante no autenticado solo puede ver
la pantalla de inicio de sesión.

> **Nota de dominio:** el `package.json` describe el producto como "gestión de proyectos de
> impresión 3D". Sin embargo, el modelo de datos real (tintas CMYK con porcentaje, rollos de
> papel, salidas de "unidades/etiquetas") apunta a **impresión gráfica/2D**. Se documenta como
> discrepancia menor; el dominio efectivo es la impresión gráfica con control de consumibles.

## 1.2 Objetivos

| # | Objetivo | Cómo lo cumple hoy |
|---|----------|--------------------|
| 1 | Registrar el trabajo de impresión por proyecto | Módulos Proyectos + Impresiones |
| 2 | Controlar la salida de material a destinos | Módulo Salidas |
| 3 | Llevar inventario de artículos | Módulo Inventario |
| 4 | Controlar consumibles y su consumo | Módulo Tintas y papel + histórico de lecturas |
| 5 | Documentar incidencias con formato rico | Módulo Incidencias (editor WYSIWYG Tiptap) |
| 6 | Analizar la actividad | Dashboard (métricas + gráficos) |
| 7 | Generar reportes por periodo y exportarlos | Módulo Reportes (PDF/Excel/impresión) |
| 8 | Proteger la información | Auth.js + rutas privadas + copias de seguridad |
| 9 | Personalizar la instancia | Configuración (empresa, logo, tema) |
| 10 | Ofrecer ayuda contextual | Base de conocimiento privada |

## 1.3 Filosofía de diseño

1. **Arquitectura limpia por capas.** La lógica fluye en una sola dirección:
   `componente → action → service → repository → Prisma`. La lógica de negocio **nunca**
   vive en los componentes de UI.
2. **Server‑first (React Server Components).** El data‑fetching ocurre en el servidor
   (Server Components y Services); el cliente solo aporta interactividad ("islas Client").
3. **Validación única compartida.** Los esquemas Zod son la **única fuente de verdad** de
   validación, y se ejecutan tanto en el cliente (react‑hook‑form) como en el servidor
   (Server Actions).
4. **Contrato de resultado uniforme.** Todas las mutaciones devuelven `ActionResult<T>`,
   una unión discriminada que transporta éxito, mensaje y errores por campo.
5. **Idioma y estética coherentes.** Todo en español; diseño inspirado en Linear/Vercel/
   Notion con tema claro/oscuro basado en tokens CSS.
6. **Seguridad por defensa en profundidad.** Sanitización del HTML enriquecido, protección
   global de rutas por middleware, y confirmaciones fuertes en operaciones destructivas.

## 1.4 Arquitectura general (resumen)

- **Framework:** Next.js 15 (App Router) con React 19 y TypeScript estricto.
- **Estilos:** TailwindCSS 3 + shadcn/ui (primitivas Radix) + tokens CSS con modo oscuro.
- **Persistencia:** PostgreSQL vía Prisma 6 (ORM tipado).
- **Autenticación:** Auth.js (NextAuth v5 beta) con estrategia JWT y proveedor de credenciales
  (bcrypt).
- **Editor rico:** Tiptap (ProseMirror) para descripciones de incidencias y notas de proyecto.
- **Gráficos:** Recharts. **Exportación:** jsPDF + jspdf‑autotable (PDF) y ExcelJS (Excel).

## 1.5 Flujo completo (alto nivel)

```
Usuario → /login → (Auth.js valida credenciales con bcrypt) → cookie JWT (8 h)
   → middleware protege /dashboard, /proyectos, ... → RSC obtiene datos vía Services/Prisma
   → UI renderiza → el usuario crea/edita → Server Action (valida Zod, requireAuth,
     comprueba reglas de negocio, persiste, revalidatePath) → router.refresh() → RSC re-render
```

## 1.6 Ventajas actuales

- Separación de responsabilidades ejemplar: la lógica de negocio está aislada del transporte
  HTTP, lo que **facilita enormemente la portabilidad** (p. ej. a Electron).
- Tipado extremo a extremo (Prisma → Services → Types → UI).
- URL como fuente de verdad para búsqueda/filtro/orden/paginación (estado compartible y
  navegable).
- Cero dependencia de `next/image` ni de imágenes remotas en el render (ilustraciones SVG
  inline), lo que simplifica el empaquetado offline.
- Modelo de datos pequeño y comprensible (10 modelos, 4 relaciones, todas en cascada).

## 1.7 Limitaciones actuales

- **Acoplamiento a PostgreSQL** en todo el historial de migraciones y en `migration_lock.toml`.
- **Auth.js v5 en beta fijada** (`5.0.0-beta.25`): API inestable.
- **Sanitización de HTML por expresiones regulares** (frágil por diseño; ver Cap. 12).
- Ordenación de proyectos por métricas agregadas resuelta **en memoria** (no escala bien).
- El backup **incluye el hash de la contraseña** del admin en texto JSON sin cifrar.
- Búsquedas con `mode: "insensitive"` (específico de PostgreSQL; incompatible con SQLite tal cual).

## 1.8 Glosario de dominio

| Término | Significado |
|---------|-------------|
| **Proyecto** | Unidad de trabajo que agrupa impresiones y salidas. Puede bloquearse (solo lectura). |
| **Impresión** | Trabajo concreto de un proyecto: nombre, cantidad, tiempo (minutos), fecha. |
| **Salida** | Envío de N unidades de un proyecto a un destino (texto libre). |
| **Inventario** | Artículo con nombre y cantidad disponible. |
| **Tinta** | Consumible con color, orden y porcentaje (0–100). Nº de tintas = 4, 6 o 9. |
| **Papel** | Consumible medido en rollos. |
| **Lectura** | Registro histórico del nivel de una tinta o del stock de papel en una fecha. |
| **Incidencia** | Nota documentada con estado (Abierta/En proceso/Resuelta) y descripción HTML. |
| **Reporte** | Conjunto de datos de un periodo (hoy/semana/mes/personalizado), exportable. |
| **Bloqueo** | Estado de un proyecto que impide toda modificación (protección). |

### 🔎 Recomendaciones y observaciones del Capítulo 1

- Alinear la descripción del `package.json` con el dominio real (impresión gráfica) — 🟢.
- La naturaleza **monousuario local** es un argumento fuerte a favor de Electron: elimina la
  necesidad de un servidor siempre disponible y de un modelo de sesión web complejo.

---

# Capítulo 2 — Arquitectura Completa

## 2.1 Modelo en capas

La aplicación implementa una **arquitectura limpia de 4 anillos** con dependencia
estrictamente **descendente**. Cada capa solo conoce a la inmediatamente inferior.

| Capa | Carpeta | Responsabilidad | Conoce a |
|------|---------|-----------------|----------|
| **Presentación** | `src/app/`, `src/components/` | Renderizado (RSC + islas Client), formularios, feedback | Actions, Types |
| **Aplicación / Frontera** | `src/actions/` | Autenticación, validación, reglas transversales, revalidación de caché | Services, Validators, Types, Session |
| **Dominio / Negocio** | `src/services/` | Lógica de negocio, cálculos, agregaciones, orquestación, sanitización | Repositories, Lib |
| **Datos** | `src/repositories/` | Encapsular todas las consultas Prisma | Prisma Client |
| **Infraestructura** | `src/lib/`, Prisma, Auth.js | Utilidades transversales, cliente Prisma, sesión, exportación | — |

## 2.2 Diagrama lógico

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PRESENTACIÓN (src/app, src/components)            │
│  Server Components (data fetch)   +   Client Components ("use client")     │
│  · Layouts / Pages / Loading      · Formularios (react-hook-form + zod)    │
│  · Tablas, gráficos (Recharts)    · Diálogos, toasts (sonner)             │
└───────────────┬───────────────────────────────────┬──────────────────────┘
                │ (RSC llama Services)                │ (Client llama Server Actions)
                ▼                                     ▼
        ┌───────────────┐                   ┌──────────────────────────────┐
        │   SERVICES     │ ◀──────────────── │   ACTIONS ("use server")     │
        │ (negocio)      │                   │ requireAuth + Zod + reglas   │
        └───────┬────────┘                   │ + revalidatePath + ActionRes │
                │                             └──────────────┬───────────────┘
                ▼                                            │ (llama Services)
        ┌───────────────┐                                    │
        │ REPOSITORIES   │ ◀──────────────────────────────────┘
        │ (Prisma)       │
        └───────┬────────┘
                ▼
        ┌───────────────┐        ┌──────────────────────────────────────────┐
        │ PRISMA CLIENT  │──────▶ │  PostgreSQL  (DATABASE_URL)              │
        └───────────────┘        └──────────────────────────────────────────┘

  Transversal (src/lib): prisma.ts · session.ts · sanitize.ts · dates.ts ·
  format.ts · constants.ts · logger.ts · utils.ts · export/{pdf,excel}
  Autenticación (Auth.js): auth.ts (Node) + auth.config.ts (Edge) + middleware.ts
  Validación (Zod): src/validators/*  (compartida cliente↔servidor)
```

## 2.3 Responsabilidades por capa

- **Actions** son la **frontera de confianza**. Ninguna mutación llega a los Services sin pasar
  por `requireAuth()` y por la validación Zod. Aquí viven además reglas transversales como el
  **bloqueo de proyecto** y la invalidación de caché (`revalidatePath`).
- **Services** contienen la lógica de negocio pura: paginación, cálculo de métricas,
  agregaciones para el dashboard, reconstrucción de consumos desde el histórico de lecturas,
  sanitización de HTML antes de persistir, y orquestación de varios repositorios (p. ej.
  `reporte.service` combina 5 fuentes).
- **Repositories** son adaptadores finos sobre Prisma. Son el **único punto** que referencia
  `prisma` (con contadas excepciones documentadas: `dashboard.service`, `backup.service`,
  `proyecto.service.listarSimple`, `configuracion.service`).
- **Lib** agrupa utilidades sin estado y la infraestructura transversal.

## 2.4 Comunicación entre módulos

- **RSC → Services:** un Server Component (p. ej. `dashboard/page.tsx`) llama directamente a un
  Service (`dashboardService.obtenerEstadisticas()`) durante el render en servidor.
- **Client → Actions:** un componente cliente (p. ej. `proyecto-form-dialog.tsx`) importa y
  ejecuta una Server Action (`crearProyecto(...)`). El resultado es un `ActionResult` serializable.
- **Actions → Services → Repositories:** cadena de delegación descendente.
- **Revalidación:** tras una mutación, la Action llama `revalidatePath(...)` y el cliente
  ejecuta `router.refresh()`, forzando el re‑render del RSC con datos frescos.

## 2.5 Flujo de datos (lectura y escritura)

**Lectura (query):**
```
Page RSC → Service.listar()/obtener() → Repository.findMany()/aggregate() → Prisma → SQL → PostgreSQL
      ← DTO tipado (Paginado<T>, ProyectoConMetricas, ReporteCompleto, …) ←
```

**Escritura (mutation):**
```
Client Component → Server Action → [requireAuth] → [Zod.safeParse] → [reglas de negocio]
   → Service.crear()/actualizar() → Repository.create()/update() → Prisma → SQL
   → revalidatePath() → (cliente) router.refresh() → RSC re-render
```

## 2.6 Separación de responsabilidades

La regla de oro observada: **la lógica no se escribe en los componentes**. Un componente:
(a) obtiene datos ya calculados por un Service (si es RSC), o (b) invoca una Action y muestra
el resultado (si es Client). Esto produce componentes presentacionales y una lógica de negocio
concentrada, testeable y **portable**.

## 2.7 Los dos runtimes (Edge/Node)

Auth.js v5 obliga a separar la configuración en dos:

- **`auth.config.ts` (Edge‑safe):** sin bcrypt ni Prisma; lo usa el **middleware** (Edge Runtime).
- **`auth.ts` (Node):** añade el proveedor de credenciales con bcrypt + Prisma; se usa en el
  servidor Node.

> **Implicación clave para Electron:** el proceso `main` de Electron es **Node puro**; la
> dicotomía Edge/Node **desaparece**, lo que **simplifica** el diseño (bcrypt y el acceso a
> datos pueden convivir sin restricciones de runtime).

### 🔎 Recomendaciones y observaciones del Capítulo 2

- La arquitectura es **excelente para migrar**: Services/Repositories/Validators/Types son
  agnósticos del transporte HTTP y se reutilizan casi al 100 % en Electron.
- El esfuerzo de migración se concentra en una capa fina: `actions/` (→ IPC), `middleware`/`api`
  (→ eliminados/IPC) y el cambio de motor de base de datos.

---

# Capítulo 3 — Estructura del Repositorio

> Recorrido carpeta por carpeta y archivo por archivo. Para cada carpeta: propósito, contenido,
> relación con otras, buenas prácticas y mejoras.

## 3.1 Raíz del proyecto

| Archivo | Propósito | Notas / Electron |
|---------|-----------|------------------|
| `package.json` | Manifiesto: scripts, dependencias, campo `prisma.seed` | Falta `engines` y `type`. En Electron añadir `electron`, `electron-builder`. |
| `package-lock.json` | Bloqueo de versiones exactas | — |
| `tsconfig.json` | Config TS: `strict`, `moduleResolution: bundler`, alias `@/* → src/*`, plugin `next` | En Electron, el proceso `main` necesitará un `tsconfig.main.json` (CommonJS/`node`). |
| `.eslintrc.json` | ESLint `next/core-web-vitals`; desactiva `no-img-element` y `no-unescaped-entities` | Formato legacy (ESLint 9 prefiere flat config). 🟢 |
| `postcss.config.mjs` | Cadena PostCSS: `tailwindcss` + `autoprefixer` | `.mjs` porque no hay `"type":"module"`. |
| `components.json` | Config del CLI shadcn/ui (estilo new‑york, RSC, alias) | Solo dev; no runtime. |
| `next.config.mjs` | `reactStrictMode`, `poweredByHeader:false`, `serverExternalPackages:[@prisma/client,bcryptjs]`, `eslint.ignoreDuringBuilds`, `optimizePackageImports` | **Falta `output:"standalone"`** (necesario para embeber el server en Electron). 🟡 |
| `tailwind.config.ts` | Tokens de color (HSL vía variables CSS), `darkMode:["class"]`, animaciones (`fade-in`), `success`/`warning` extra | `content` incluye `src/pages` residual (App Router). 🟢 |
| `.env.example` | Plantilla de variables de entorno | Ver §8/Cap.11 para el mapeo a Electron. |
| `.gitignore` | Ignora `node_modules`, `.next`, `.env*`, **`/prisma/*.db`** | Ya preparado para SQLite. Añadir artefactos de empaquetado Electron. |
| `next-env.d.ts` | Tipos globales de Next (autogenerado) | No editar. |
| `README.md` | Documentación funcional del proyecto | — |
| `tsconfig.tsbuildinfo` | Caché incremental de TS | Artefacto; ignorado. |

**Buenas prácticas:** separación clara de config; `serverExternalPackages` correctamente
configurado para Prisma/bcrypt. **Mejora:** añadir `engines` y `output:"standalone"`.

## 3.2 `prisma/` — Esquema, migraciones y seed

- **`schema.prisma`** (211 líneas): datasource PostgreSQL, generator `prisma-client-js`, 2 enums
  (`EstadoIncidencia`, `RolUsuario`) y 10 modelos. Detalle completo en el **Capítulo 8**.
- **`migrations/`**: 5 migraciones SQL PostgreSQL‑específicas + `migration_lock.toml`
  (`provider = "postgresql"`).
  - `0001_init` — núcleo (usuarios, proyectos, impresiones, salidas, incidencias, configuracion) + enums.
  - `0002_tintas` — tintas + lecturas_tinta.
  - `0003_papel` — papel + lecturas_papel.
  - `0004_inventario_bloqueo_ruta` — inventario + `proyectos.rutaImpresion` + `proyectos.bloqueado`.
  - `0005_proyecto_produccion_notas` — `proyectos.cantidadProduccion` + `proyectos.notas`.
- **`seed.ts`** (111 líneas): crea el admin (upsert por email, bcrypt coste 12), la configuración
  singleton y datos demo (2 proyectos, 5 impresiones, 3 incidencias). Consume `ADMIN_EMAIL`,
  `ADMIN_PASSWORD`, `ADMIN_NOMBRE`.

**Relación:** el esquema genera el Prisma Client que consumen **todos** los repositorios; el seed
inicializa la BD para el primer login.

**Mejora crítica para Electron:** las migraciones son PostgreSQL puro (`CREATE TYPE ... AS ENUM`,
`DOUBLE PRECISION`, `TIMESTAMP(3)`); **no son portables a SQLite** → se requiere un baseline nuevo
(ver Cap. 9/10).

## 3.3 `src/app/` — Rutas (App Router), layouts y páginas

Estructura de rutas:

```
src/app/
├── layout.tsx              (root: fuente Inter, ThemeProvider, SessionProvider, Toaster)
├── page.tsx                (raíz "/": redirige a /dashboard o /login)
├── not-found.tsx           (404 global)
├── globals.css             (tokens de tema, .prosa, .tiptap, @media print)
├── login/page.tsx          (pantalla de acceso pública)
├── api/
│   ├── auth/[...nextauth]/route.ts   (endpoints Auth.js: GET/POST)
│   └── backup/route.ts               (GET: descarga JSON de toda la BD)
└── (dashboard)/            (grupo protegido; su layout exige sesión)
    ├── layout.tsx          (guardia de auth + Sidebar + Header)
    ├── error.tsx           (error boundary del segmento)
    ├── dashboard/          (page + loading)
    ├── proyectos/          (page + loading + [id]/page)
    ├── salidas/            (page + loading)
    ├── inventario/         (page + loading)
    ├── tintas/             (page + loading)
    ├── incidencias/        (page + loading)
    ├── reportes/           (page — sin loading)
    ├── configuracion/      (page)
    └── base-conocimiento/  (page)
```

**Patrón Next 15:** todas las páginas reciben `params`/`searchParams` como **Promises**
(`await params`). Las páginas son **Server Components async** que hacen `Promise.all` de Services.
Detalle exhaustivo de cada página en el **Capítulo 6**.

## 3.4 `src/actions/` — Server Actions (frontera de mutación)

10 archivos, todos con `"use server"`. Patrón uniforme: `requireAuth` → `Zod.safeParse` →
reglas de negocio → Service → `revalidatePath` → `ActionResult`. Detalle en el **Capítulo 7**.

| Archivo | Acciones principales |
|---------|----------------------|
| `auth.actions.ts` | `iniciarSesion`, `cerrarSesion` |
| `backup.actions.ts` | `restaurarBackup` (destructiva) |
| `configuracion.actions.ts` | `actualizarConfiguracion`, `actualizarAdmin` |
| `impresion.actions.ts` | `crearImpresion`, `actualizarImpresion`, `eliminarImpresion` (con bloqueo) |
| `incidencia.actions.ts` | `crearIncidencia`, `actualizarIncidencia`, `eliminarIncidencia` |
| `inventario.actions.ts` | CRUD de inventario |
| `papel.actions.ts` | `crearPapel`, `actualizarRollosPapel`, `editarPapel`, `eliminarPapel` |
| `proyecto.actions.ts` | `crearProyecto`, `actualizarProyecto`, `guardarNotasProyecto`, `alternarBloqueoProyecto`, `eliminarProyecto` |
| `salida.actions.ts` | CRUD de salidas (con bloqueo) |
| `tinta.actions.ts` | `configurarTintas`, `actualizarPorcentajeTinta`, `editarTinta` |

## 3.5 `src/services/` — Lógica de negocio

11 archivos. Objetos literales exportados con métodos async. Detalle en el **Capítulo 7**.

| Servicio | Rol destacado |
|----------|---------------|
| `backup.service.ts` | Volcado/restauración total transaccional |
| `configuracion.service.ts` | Config singleton + gestión del admin (bcrypt) |
| `dashboard.service.ts` | Estadísticas + series de actividad + distribución |
| `impresion.service.ts` | CRUD fino de impresiones |
| `incidencia.service.ts` | CRUD + listado + sanitización HTML |
| `inventario.service.ts` | CRUD + listado ordenable |
| `papel.service.ts` | Papel + histórico + `consumoEnRango` |
| `proyecto.service.ts` | Núcleo: métricas, bloqueo, notas, listado híbrido |
| `reporte.service.ts` | Ensamblado de reportes (5 fuentes) |
| `salida.service.ts` | CRUD + listado de salidas |
| `tinta.service.ts` | Tintas + histórico + `configurar(4/6/9)` |

## 3.6 `src/repositories/` — Acceso a datos (Prisma)

9 archivos. Único punto que toca `prisma`. Detalle método a método en el análisis de datos
(resumen en Cap. 7/8).

`configuracion` · `impresion` · `incidencia` · `inventario` · `papel` · `proyecto` · `salida` ·
`tinta` · `usuario`.

## 3.7 `src/validators/` — Esquemas Zod

9 archivos. Fuente única de validación compartida cliente↔servidor. Tabla completa en el
**Capítulo 7 §7.4**.

`auth` · `configuracion` · `impresion` · `incidencia` · `inventario` · `papel` · `proyecto` ·
`salida` · `tinta`.

## 3.8 `src/components/` — Componentes de UI

Organización por dominio:

```
components/
├── ui/            (18 primitivas shadcn/Radix)
├── shared/        (9 componentes reutilizables: search, sort, pagination, confirm-dialog, …)
├── layout/        (header, sidebar, sidebar-nav, mobile-nav, user-menu, nav-config)
├── providers/     (theme-provider)
├── dashboard/     (stat-card, activity-chart, incidencias-chart)
├── auth/          (login-form)
├── proyectos/     (actions, form-dialog, notas, impresion-actions, impresion-form-dialog)
├── salidas/       (actions, form-dialog)
├── inventario/    (actions, form-dialog)
├── tintas/        (configurar[-inicial], tinta-card/edit, papel-card/add/edit)
├── incidencias/   (estado-badge/filter, actions, form-dialog, view-dialog, rich-text-editor)
├── reportes/      (report-filters, export-buttons)
├── configuracion/ (general-form, admin-form, backup-card)
└── base-conocimiento/ (base-conocimiento, kb-data, kb-illustrations)
```

Detalle componente a componente en el **Capítulo 6**.

## 3.9 `src/lib/` — Utilidades e infraestructura

| Archivo | Rol |
|---------|-----|
| `prisma.ts` | Singleton de `PrismaClient` (cache en `globalThis` en dev) |
| `session.ts` | `requireAuth()` y `getSession()` (envuelven `auth()`) |
| `sanitize.ts` | `sanitizarHtml()` (regex) y `htmlATexto()` |
| `dates.ts` | `calcularRango(periodo)` con date‑fns |
| `format.ts` | Formateo de fecha/tiempo/número (locale es) |
| `constants.ts` | `APP_NOMBRE`, `PAGINA_TAMANO`, estados, periodos |
| `logger.ts` | Logger a consola con niveles |
| `utils.ts` | `cn()` (clsx + tailwind‑merge) |
| `export/pdf-report.ts` | Generación + descarga de PDF (jsPDF) |
| `export/excel-report.ts` | Generación + descarga de Excel (ExcelJS) |

## 3.10 `src/hooks/` — Hooks reutilizables

- `use-query-params.ts` — sincroniza estado (búsqueda/filtro/orden/página) con la URL vía
  `next/navigation`. Es la dependencia frontend más repetida hacia `next/navigation`.

## 3.11 `src/types/` — Tipos compartidos

- `index.ts` — `ActionResult<T>`, `ProyectoConMetricas`, `ProyectoDetalle`,
  `EstadisticasDashboard`, `PuntoActividad`, `DistribucionEstado`, `Paginado<T>`, y re‑export de
  tipos Prisma.
- `next-auth.d.ts` — augmentación de módulo para tipar `session.user.id`/`nombre` y el JWT.

### 🔎 Recomendaciones y observaciones del Capítulo 3

- Considerar mover `ReporteCompleto` (hoy en `reporte.service.ts`) a `src/types/` para unificar
  la ubicación de los tipos de dominio — 🟢.
- La organización por dominio de `components/` es excelente y facilita localizar el código.

---

# Capítulo 4 — Dependencias

> Análisis dependencia a dependencia: propósito, aporte, alternativas, continuidad en Electron y
> posibles problemas. Versiones exactas tomadas del `package.json`.

## 4.1 Dependencias de runtime

| Paquete | Versión | Propósito | ¿Sigue en Electron? | Riesgos / notas |
|---------|---------|-----------|---------------------|-----------------|
| `next` | `15.1.4` | Framework (App Router, RSC, Server Actions) | **Parcial** | El modelo server no encaja directo en Electron; decisión arquitectónica central (Cap. 9). |
| `react` / `react-dom` | `^19.0.0` | UI | Sí | Compatible en el renderer. |
| `@prisma/client` | `^6.2.1` | ORM tipado | Sí (cambiando datasource) | Empaquetar el query engine por plataforma (`binaryTargets`). |
| `next-auth` | `5.0.0-beta.25` | Autenticación web (JWT + credenciales) | **No (rediseño)** | Beta fijada; en Electron se sustituye por auth local. 🔴 |
| `bcryptjs` | `^2.4.3` | Hash de contraseñas (JS puro) | **Sí (ideal)** | Sin binarios nativos → no requiere recompilación por plataforma. ✅ |
| `zod` | `^3.24.1` | Validación de esquemas | **Sí (100 %)** | Agnóstico de entorno; el activo más portable. |
| `@hookform/resolvers` | `^3.9.1` | Puente react‑hook‑form ↔ Zod | Sí | — |
| `react-hook-form` | `^7.54.2` | Gestión de formularios | Sí | — |
| `@radix-ui/react-*` (avatar, dialog, dropdown-menu, label, popover, select, separator, slot, switch, tabs, toast, tooltip) | varias `^1.x/2.x` | Primitivas UI accesibles (base shadcn) | **Sí** | Agnósticas del entorno; sin red. ✅ |
| `class-variance-authority` | `^0.7.1` | Variantes de clases tipadas | Sí | — |
| `clsx` | `^2.1.1` | Composición condicional de clases | Sí | — |
| `tailwind-merge` | `^2.6.0` | Fusión de clases Tailwind | Sí | — |
| `tailwindcss-animate` | `^1.0.7` | Animaciones Tailwind | Sí | — |
| `lucide-react` | `^0.469.0` | Iconos SVG | **Sí** | SVG inline; sin red. ✅ |
| `@tiptap/*` (react, pm, starter-kit, extension-image, extension-link, extension-placeholder) | `^2.11.2` | Editor WYSIWYG (ProseMirror) | **Sí, con salvedad** | `window.prompt` para enlace/imagen **no funciona en Electron** → reemplazar por diálogo propio. 🔴 |
| `recharts` | `^2.15.0` | Gráficos (dashboard/reportes) | **Sí** | SVG en cliente; sin red. ✅ |
| `sonner` | `^1.7.1` | Notificaciones toast | Sí | — |
| `next-themes` | `^0.4.4` | Tema claro/oscuro/sistema | Sí | Funciona en el renderer. |
| `date-fns` | `^4.1.0` | Fechas (reportes/filtros/formato) | **Sí** | Isomórfico. ✅ |
| `jspdf` + `jspdf-autotable` | `^2.5.2` / `^3.8.4` | Generación de PDF | **Sí, con salvedad** | Funciona; la **descarga** (`doc.save`) conviene sustituir por `dialog`+`fs`. 🟡 |
| `exceljs` | `^4.4.0` | Generación de Excel | **Sí, con salvedad** | `writeBuffer()` portable; la descarga vía DOM conviene sustituir por `dialog`+`fs`. 🟡 |
| `framer-motion` | `^11.15.0` | Animaciones | **Revisar** | Declarada pero **no observada en uso** en el frontend inspeccionado → posible bundle innecesario. 🟢 |

## 4.2 Dependencias de desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `typescript` | `^5.7.3` | Compilador/typechecker |
| `prisma` | `^6.2.1` | CLI de Prisma (generate/migrate/studio) |
| `tsx` | `^4.19.2` | Ejecuta TS/ESM (seed) |
| `tailwindcss` | `^3.4.17` | Framework CSS |
| `postcss` | `^8.4.49` | Procesador CSS |
| `autoprefixer` | `^10.4.20` | Prefijos CSS |
| `eslint` | `^9.18.0` | Linter |
| `eslint-config-next` | `15.1.4` | Reglas ESLint de Next |
| `@types/*` (node, react, react-dom, bcryptjs) | varias | Tipos TS |

## 4.3 Veredicto Electron por dependencia (síntesis)

- **Portables sin cambios (✅):** React, Radix/shadcn, Recharts, Tiptap (salvo `prompt`), Zod,
  react‑hook‑form, date‑fns, lucide, next‑themes, sonner, bcryptjs, `@prisma/client` (con nuevo
  datasource), utilidades CSS.
- **Requieren adaptación (🟡):** exportadores PDF/Excel (paso de descarga), jsPDF/ExcelJS.
- **Requieren rediseño (🔴):** `next` (modelo server), `next-auth` (auth web), y la pieza
  `window.prompt` de Tiptap.

### 🔎 Recomendaciones y observaciones del Capítulo 4

- **Eliminar `framer-motion`** si se confirma que no se usa (auditar imports) — 🟢 reduce bundle.
- **Fijar `engines`** y evaluar salir de `next-auth` beta antes de invertir en más features web.
- `bcryptjs` (JS puro) es un acierto para Electron: mantener frente a `bcrypt` (nativo).

---

# Capítulo 5 — Flujo de la Aplicación

## 5.1 Arranque y autenticación

1. El usuario abre cualquier URL. El **middleware** (`middleware.ts`) intercepta todas las rutas
   salvo `/api`, estáticos y `*.png/*.svg`.
2. El callback `authorized` comprueba si la ruta es privada. Si lo es y no hay sesión, redirige a
   `/login`. Si hay sesión y visita `/login`, redirige a `/dashboard`.
3. En `/login`, `LoginForm` (Client) construye un `FormData` y llama a la Server Action
   `iniciarSesion`, que ejecuta `signIn("credentials", { redirect:false })`.
4. El proveedor `Credentials.authorize` valida con Zod, busca el usuario (`email.toLowerCase()`),
   verifica `activo` y compara la contraseña con **bcrypt**. Si todo es correcto devuelve el
   usuario; Auth.js emite un **JWT firmado en cookie** (validez 8 h).
5. Los callbacks `jwt`/`session` inyectan `id` y `nombre` en el token y en `session.user`.

## 5.2 Navegación

- El `(dashboard)/layout.tsx` vuelve a comprobar la sesión (`getSession()` → `redirect("/login")`)
  y renderiza el chrome: `Sidebar` (escritorio) + `Header` (con `MobileNav`, `ThemeToggle`,
  `UserMenu`).
- `SidebarNav` resalta la sección activa con `usePathname()`. La navegación usa `next/link`.

## 5.3 Lectura de datos (ejemplo: Proyectos)

1. `proyectos/page.tsx` (RSC) lee `searchParams` (`q`, `pagina`, `orden`).
2. Llama a `proyectoService.listar({...})`, que consulta `proyectoRepository` y calcula métricas.
3. Renderiza la tabla; `SearchBar`/`SortSelect`/`Pagination` (Client) sincronizan el estado con la
   URL vía `useQueryParams`, provocando una nueva navegación y un nuevo render del RSC.

## 5.4 Escritura de datos (ejemplo: crear impresión)

1. `ImpresionFormDialog` (Client) valida con Zod en el cliente y llama a `crearImpresion(input)`.
2. La Action ejecuta `requireAuth`, `impresionSchema.safeParse`, comprueba que el proyecto **no
   esté bloqueado** (`proyectoService.estaBloqueado`), persiste vía `impresionService`, y llama
   `revalidatePath('/proyectos/[id]')`, `'/proyectos'`, `'/dashboard'`.
3. El cliente muestra un `toast` y ejecuta `router.refresh()`.

## 5.5 Exportación y reportes

1. `reportes/page.tsx` (RSC) genera el `ReporteCompleto` con `reporteService.generar(periodo, …)`.
2. `ExportButtons` (Client) ofrece **Imprimir** (`window.print()`), **PDF** (`exportarReportePDF`)
   y **Excel** (`exportarReporteExcel`). La generación y descarga ocurren **íntegramente en el
   cliente**.

## 5.6 Copias de seguridad

- **Descarga:** un enlace `<a href="/api/backup" download>` invoca el Route Handler, que serializa
  toda la BD a JSON y la envía con `Content-Disposition: attachment`.
- **Restauración:** `BackupCard` lee el archivo con `FileReader.text()`, valida el formato, exige
  teclear "RESTAURAR" y llama a `restaurarBackup`, que reemplaza todos los datos en una transacción.

## 5.7 Cierre de sesión

- `UserMenu` contiene `<form action={cerrarSesion}>`; la Action ejecuta `signOut({ redirectTo:"/login" })`.

### 🔎 Recomendaciones y observaciones del Capítulo 5

- El flujo es lineal y predecible. En Electron, los pasos 5.1–5.2 (middleware, cookies) se
  sustituyen por un **guard local**; los pasos de escritura (5.4) por **IPC**; y la
  exportación/backup (5.5–5.6) por **diálogos nativos** de guardado (ver Cap. 9).

---

# Capítulo 6 — Frontend

> Análisis de la capa de presentación: rutas, layouts, providers, componentes y su interacción.

## 6.1 Patrón general

- **RSC para obtener datos y componer layout;** **islas Client (`"use client"`)** para
  interactividad.
- **Mutaciones vía Server Actions** seguidas de `router.refresh()`.
- **Feedback vía `toast` (sonner).** **Formularios** con `useForm` + `zodResolver` + mapeo de
  `fieldErrors` a `setError`.
- **URL como estado** para búsqueda/filtro/orden/paginación (`useQueryParams`).

## 6.2 Layouts y páginas (resumen operativo)

| Ruta | Tipo | Qué hace |
|------|------|----------|
| `layout.tsx` (root) | RSC async | Inter (`next/font`), `ThemeProvider`, `SessionProvider`, `Toaster`; lee tema por defecto de config |
| `page.tsx` (`/`) | RSC async | Redirige a `/dashboard` o `/login` |
| `login/page.tsx` | RSC async | Si hay sesión → dashboard; si no, `LoginForm` |
| `(dashboard)/layout.tsx` | RSC async | Guardia de auth + Sidebar + Header |
| `(dashboard)/error.tsx` | Client | Error boundary con `reset()` |
| `dashboard/page.tsx` | RSC async | 6 `StatCard` + `ActivityChart` + `IncidenciasChart` |
| `proyectos/page.tsx` | RSC async | Tabla con búsqueda/orden/paginación; resalta bloqueados |
| `proyectos/[id]/page.tsx` | RSC async | Detalle: métricas, progreso de producción, Tabs (Impresiones/Salidas/Notas) |
| `salidas/page.tsx` | RSC async | Tabla de salidas + selector de proyecto |
| `inventario/page.tsx` | RSC async | Tabla de artículos (Badge destructivo si cantidad 0) |
| `tintas/page.tsx` | RSC async | Grids de `TintaCard` y `PapelCard` + configuración |
| `incidencias/page.tsx` | RSC async | Grid de tarjetas con estado, filtro y búsqueda |
| `reportes/page.tsx` | RSC async | Métricas + tablas + filtros + exportación (sin `loading.tsx`) |
| `configuracion/page.tsx` | RSC async | `GeneralForm`, `AdminForm`, `BackupCard` |
| `base-conocimiento/page.tsx` | RSC | Isla `BaseConocimiento` (centro de ayuda) |

## 6.3 `globals.css` y theming

- Tokens HSL en `:root` (claro) y `.dark`. `primary` índigo. Radio base `0.65rem`.
- Utilidades: `.scrollbar-thin`, `.tiptap` (editor), `.prosa` (render de HTML enriquecido),
  y **`@media print`** (`.no-imprimir`, fondo blanco) que sustenta la impresión de reportes.
- El theming se propaga por **variables CSS**, de modo que light/dark funcionan sin recompilar.

## 6.4 Providers y layout

- `theme-provider.tsx` (Client): wrapper de `next-themes`.
- `header/sidebar/sidebar-nav/mobile-nav/user-menu/nav-config`: chrome de navegación.
  `nav-config.ts` es la **fuente única** de los 9 elementos del menú.
- `user-menu.tsx` contiene el logout (`<form action={cerrarSesion}>`).

## 6.5 UI primitivas (`components/ui/`)

18 primitivas shadcn/Radix (avatar, badge, button, card, dialog, dropdown‑menu, input, label,
popover, select, separator, skeleton, sonner, switch, table, tabs, textarea, tooltip). Todas
**agnósticas del entorno y sin red** → ✅ compatibles con Electron.

## 6.6 Componentes compartidos (`components/shared/`)

- `search-bar` (debounce 350 ms → URL), `sort-select`, `pagination`, `confirm-dialog` (base de
  todas las eliminaciones, con spinner), `empty-state`, `page-header`, `breadcrumbs`,
  `table-skeleton`, `theme-toggle`.
- **Hook `use-query-params`:** núcleo de la sincronización con la URL (`useRouter`,
  `usePathname`, `useSearchParams`).

## 6.7 Dashboard, gráficos

- `stat-card` (RSC): tarjeta métrica con acento de color.
- `activity-chart` (Client, Recharts `AreaChart`) y `incidencias-chart` (Client, `PieChart` donut).
  🟡 `incidencias-chart` usa colores HSL literales (no tokens de tema) → inconsistencia visual.

## 6.8 Módulos CRUD (patrón repetido)

Todos los `*-actions.tsx` (menú `DropdownMenu` → `ConfirmDialog`/`FormDialog`) y
`*-form-dialog.tsx` (`useForm` + `zodResolver` + `fieldErrors`) comparten patrón. Particularidades:

- **Proyectos:** `proyecto-form-dialog` incluye `cantidadProduccion` (opcional) y `rutaImpresion`
  (texto). `proyecto-notas` reutiliza el editor Tiptap y respeta el bloqueo (solo lectura).
- **Impresiones:** `impresion-form-dialog` desglosa el `tiempo` (minutos) en dos inputs horas/min.
- **Salidas:** `salida-form-dialog` usa `Controller` para el `Select` de proyecto; `proyectoIdFijo`
  lo oculta desde el detalle.
- **Tintas/Papel:** `tinta-card`/`papel-card` (RSC) abren diálogos Client; `tinta-edit-dialog` usa
  `<input type="color">` + `range`; reduce de tintas confirma (destructivo).
- **Incidencias:** `incidencia-form-dialog` usa `Controller` para el `Select` de estado y para el
  `RichTextEditor`; `incidencia-view-dialog` renderiza HTML con `dangerouslySetInnerHTML`.

## 6.9 Editor enriquecido `rich-text-editor.tsx` (pieza crítica)

- Tiptap (`StarterKit` + `Link` + `Image` + `Placeholder`), `immediatelyRender:false`.
- Toolbar completa (negrita, cursiva, tachado, H1‑H3, listas, cita, enlace, imagen, deshacer/rehacer).
- **`window.prompt()`** para pedir la URL de enlace e imagen → 🔴 **no funciona en Electron**
  (debe sustituirse por un diálogo Radix propio o `dialog` vía IPC).
- No sanitiza en cliente; la limpieza se hace en el servidor al guardar.

## 6.10 Reportes y exportación (impacto Electron)

- `report-filters` (periodos + rango con `<input type="date">`).
- `export-buttons`: `window.print()` (✅), PDF (`doc.save`), Excel (`Blob`+`createObjectURL`+
  `a.click()`). Funcionan en Electron pero la **UX nativa** aconseja `dialog.showSaveDialog` + `fs`.

## 6.11 Configuración y backup (impacto Electron)

- `general-form` (empresa/logo/tema; aplica el tema al instante con `useTheme().setTheme`),
  `admin-form` (nombre/email/contraseña).
- `backup-card`: descarga vía `<a href="/api/backup">` (🔴 depende de servidor) y restauración vía
  `FileReader.text()` + confirmación "RESTAURAR" + `restaurarBackup`.

## 6.12 Base de conocimiento

- `base-conocimiento` (Client): buscador insensible a acentos (`normalize("NFD")`), filtros por
  categoría, acordeones. `kb-data` (contenido) y `kb-illustrations` (9 ilustraciones **SVG inline**
  que se adaptan al tema). 100 % cliente, sin red → ✅ Electron.

### 🔎 Recomendaciones y observaciones del Capítulo 6

| Ítem | Prioridad |
|------|-----------|
| Reemplazar `window.prompt` del editor por diálogo propio (bloqueante en Electron) | 🔴 |
| Añadir `loading.tsx` a `reportes/` (coherencia con las demás listas) | 🟢 |
| Unificar colores de `incidencias-chart` con los tokens de tema | 🟡 |
| Re‑sanitizar HTML también en el render de solo lectura (defensa en profundidad) | 🟡 |
| Consolidar estado local duplicado (horas/min, tinta, papel) en react‑hook‑form | 🟢 |

---

# Capítulo 7 — Backend

> Autenticación, middleware, APIs, Server Actions, Services, Repositories, Validators, seguridad y
> gestión de errores.

## 7.1 Autenticación y middleware

- **`auth.config.ts` (Edge‑safe):** `session.strategy:"jwt"` (sin tabla de sesiones), `maxAge` 8 h,
  `trustHost:true`, callback `authorized` (lista blanca de rutas privadas), callbacks `jwt`/`session`.
- **`auth.ts` (Node):** proveedor `Credentials` con bcrypt + Prisma. Exporta `handlers`, `auth`,
  `signIn`, `signOut`. `authorize` no revela la causa del fallo (siempre `null`).
- **`middleware.ts`:** `NextAuth(authConfig).auth` con `matcher` que excluye `/api`, estáticos y
  `*.png/*.svg`. **Nota de seguridad:** `/api/backup` **no** queda cubierto por el middleware; su
  protección depende del check interno del handler.

## 7.2 APIs (Route Handlers)

- **`api/auth/[...nextauth]/route.ts`:** `export const { GET, POST } = handlers` (endpoints Auth.js).
- **`api/backup/route.ts` (GET):** verifica sesión (401 si no), llama `backupService.exportar()`,
  serializa **todo en memoria** y devuelve JSON con `Content-Disposition: attachment` y
  `Cache-Control: no-store`.

## 7.3 Server Actions (patrón y detalle)

Patrón uniforme (excepto `cerrarSesion`):

```
"use server"
await requireAuth();                       // autenticación
const parsed = schema.safeParse(input);    // validación
if (!parsed.success) return { success:false, message, fieldErrors };
// reglas de negocio (existencia, bloqueo de proyecto)
await service.metodo(parsed.data);         // delegación
revalidatePath(...);                       // invalidación de caché
return { success:true, data, message };    // ActionResult
```

- **Bloqueo de proyecto:** `impresion`/`salida`/`proyecto` actions comprueban `estaBloqueado`
  antes de mutar. `alternarBloqueoProyecto` es la única que no comprueba (es la vía de desbloqueo).
- **Backup:** `restaurarBackup` valida estructuralmente (no Zod) y revalida `('/', 'layout')`.
- **Auth:** `iniciarSesion` (firma `useActionState`) y `cerrarSesion` (sin try/catch ni auth‑guard).

## 7.4 Validadores Zod (tabla completa)

| Validador | Reglas clave |
|-----------|--------------|
| `auth` | `email` (`.email()`), `password` (min 1) |
| `configuracion` | `nombreEmpresa` 2–120, `logoUrl` url/`""`, `tema` enum; `admin`: `.refine` (si `passwordNueva` ⇒ `passwordActual` obligatoria), `passwordNueva` min 8 |
| `impresion` | `cantidad` 1–1e6, `tiempo` 0–1e6 (min); `impresionEditSchema` omite `proyectoId` |
| `incidencia` | `titulo` 2–160, `descripcion` `.refine` (sin tags no vacío), `estado` enum |
| `inventario` | `nombre` 1–120, `cantidad` 0–1e6 |
| `papel` | `nombre` 1–60, `rollos` 0–1e6, `id` min 1 |
| `proyecto` | `titulo` 2–120, `descripcion` ≤2000, `rutaImpresion` ≤500, `cantidadProduccion` `preprocess`(""→undefined) 0–1e7; `notas` ≤50000 |
| `salida` | `cantidad` 1–1e6, `destino` 2–160, `nota` ≤500 |
| `tinta` | `numero` ∈ {4,6,9}, `porcentaje` 0–100, `color` regex `^#[0-9A-Fa-f]{6}$` |

Patrones: `z.coerce.number()` para inputs de formulario, `.trim()`, `.optional().or(z.literal(""))`,
mensajes en español listos para UI. **Se reutilizan al 100 % en Electron.**

## 7.5 Services (lógica de negocio destacada)

- **`backup.service`:** `exportar()` (lectura secuencial de 11 tablas, incluye
  `usuarios.password`), `restaurar()` (transacción: borra hijos→padres, recrea padres→hijos;
  helper `conFechas` reconstruye `Date`).
- **`proyecto.service`:** ordenación **híbrida** (BD para reciente/antiguo/titulo; **memoria** para
  impresiones/tiempo → riesgo de escala), `guardarNotas` (sanitiza), `estaBloqueado`.
- **`tinta.service`/`papel.service`:** consumo derivado del **histórico de lecturas**
  (`consumoEnRango` con `gastado = max(0, anterior − actual)`). Reponer intra‑periodo puede
  infravalorar el consumo (limitación conocida). Reducir el nº de tintas **borra histórico**.
- **`dashboard.service`:** agregados (`aggregate`, `groupBy`, `count`) + serie de actividad con
  días inicializados a cero.
- **`reporte.service`:** `generar()` combina 5 fuentes en paralelo y produce `ReporteCompleto`.

## 7.6 Repositories (síntesis)

Adaptadores finos sobre Prisma. Métodos típicos: `contar`, `listar`, `obtener`, `crear`,
`actualizar`, `eliminar`, más específicos (`agregados`, `agruparPorEstado`, `listarEnRango`,
`conActividadEnRango`, `crearLectura`, `lecturaHasta/AntesDe`, `primeraLecturaDesde`,
`crearVarias`, `eliminarDesdeOrden`). `usuario.repository` no expone `crear`/`eliminar`
(provisionado por seed).

## 7.7 Gestión de errores

- Services devuelven promesas de Prisma o resultados de negocio (`{ok:false, error, campo}` en
  `configuracion`). Las Actions envuelven en `try/catch`, registran con `logger.error` y devuelven
  `ActionResult` de error. Nunca se filtran trazas al cliente.

### 🔎 Recomendaciones y observaciones del Capítulo 7

| Ítem | Prioridad |
|------|-----------|
| No incluir `usuarios.password` en el backup, o cifrar el archivo | 🔴 |
| Sustituir `mode:"insensitive"` por estrategia compatible con SQLite | 🔴 (para Electron) |
| No loguear emails en intentos fallidos (PII) | 🟡 |
| Paginar en BD la ordenación por métricas de proyectos | 🟡 |
| Validar `version` del backup al restaurar | 🟡 |
| Envolver `configurar` de tintas en transacción | 🟡 |

---

# Capítulo 8 — Base de Datos Actual

## 8.1 Datasource y generator

```prisma
generator client { provider = "prisma-client-js" }   // sin binaryTargets explícitos
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
```

## 8.2 Enums

| Enum | Valores | Uso |
|------|---------|-----|
| `EstadoIncidencia` | `ABIERTA`, `EN_PROCESO`, `RESUELTA` | Estado de incidencias |
| `RolUsuario` | `ADMIN` | Rol único (monousuario) |

> ⚠️ **SQLite no soporta enums nativos en Prisma** → al migrar deben pasar a `String` (validados en
> aplicación por Zod) o a tablas de lookup.

## 8.3 Modelos (10) — tabla resumen

| Modelo (tabla) | Campos clave | Relaciones | Índices |
|----------------|--------------|-----------|---------|
| `Usuario` (`usuarios`) | id(cuid), email(unique), password(bcrypt), nombre, rol(ADMIN), activo, timestamps | — | email único |
| `Proyecto` (`proyectos`) | id, titulo, descripcion?, rutaImpresion?, cantidadProduccion?(Int), notas?(HTML), bloqueado(bool), timestamps | 1‑N impresiones, 1‑N salidas | createdAt |
| `Impresion` (`impresiones`) | id, nombre, cantidad(def 1), tiempo(min, def 0), fecha(`@db.Date`), timestamps, proyectoId | N‑1 Proyecto (Cascade) | proyectoId, fecha |
| `Salida` (`salidas`) | id, cantidad(def 1), destino, nota?, fecha(`@db.Date`), timestamps, proyectoId | N‑1 Proyecto (Cascade) | proyectoId, fecha |
| `Incidencia` (`incidencias`) | id, titulo, descripcion(HTML, requerido), estado(def ABIERTA), timestamps | — | estado, createdAt |
| `Tinta` (`tintas`) | id, nombre, color(def #6366F1), orden, porcentaje(Float, def 100), timestamps | 1‑N LecturaTinta | orden |
| `LecturaTinta` (`lecturas_tinta`) | id, porcentaje(Float), fecha(`@db.Date`), createdAt, tintaId | N‑1 Tinta (Cascade) | tintaId, fecha |
| `Papel` (`papel`) | id, nombre(def "Papel"), rollos(def 0), orden, timestamps | 1‑N LecturaPapel | orden |
| `LecturaPapel` (`lecturas_papel`) | id, rollos, fecha(`@db.Date`), createdAt, papelId | N‑1 Papel (Cascade) | papelId, fecha |
| `Inventario` (`inventario`) | id, nombre, cantidad(def 0), timestamps | — | createdAt |
| `Configuracion` (`configuracion`) | id, nombreEmpresa(def), logoUrl?, tema(def "system"), updatedAt | — (registro único) | — |

## 8.4 Mapa de relaciones

```
Proyecto 1 ──< N Impresion     (onDelete: Cascade)
Proyecto 1 ──< N Salida         (onDelete: Cascade)
Tinta    1 ──< N LecturaTinta   (onDelete: Cascade)
Papel    1 ──< N LecturaPapel   (onDelete: Cascade)
Sin relaciones: Usuario, Incidencia, Inventario, Configuracion
```

Todas las relaciones usan `onDelete: Cascade` (compatible con SQLite si `PRAGMA foreign_keys=ON`,
que Prisma activa).

## 8.5 Patrón de series temporales (consumibles)

Tintas y papel implementan un **event‑sourcing ligero**: cada cambio de nivel/stock crea una
`Lectura` con fecha. El consumo por periodo se **deriva** comparando la lectura anterior al inicio
del rango con la última del rango (`gastado = max(0, anterior − actual)`).

## 8.6 Migraciones (historial)

5 migraciones PostgreSQL‑específicas (ver §3.2). `migration_lock.toml` fija `provider=postgresql`.

## 8.7 Consideraciones de migración de datos a SQLite

| Elemento | Estado en PostgreSQL | Acción para SQLite |
|----------|----------------------|--------------------|
| `provider` | `postgresql` | → `sqlite`, URL `file:` |
| Enums | `EstadoIncidencia`, `RolUsuario` | → `String` |
| `@db.Date` (7 campos) | tipo DATE | Verificar mapeo a DATETIME (SQLite sin tipo Date nativo) |
| `Float` | DOUBLE PRECISION | → REAL (OK) |
| `binaryTargets` | ausentes | declarar targets por plataforma |
| `migration_lock.toml` | `postgresql` | → `sqlite`; **baseline de migraciones nuevo** |
| Búsquedas | `mode:"insensitive"` | `COLLATE NOCASE`/`LIKE` o filtrado en JS |

### 🔎 Recomendaciones y observaciones del Capítulo 8

- Añadir `createdAt` a `Configuracion` (consistencia) — 🟢.
- El modelo es pequeño y limpio: **excelente candidato** para SQLite local.

---

# Capítulo 9 — Migración a Electron

> **Capítulo más importante.** Guía profesional de conversión. No incluye código; describe
> arquitectura, procesos, IPC, seguridad, empaquetado, actualizaciones, firmado y distribución.

## 9.1 Principio rector

La arquitectura por capas permite **conservar intacta** la lógica de negocio
(`services/`, `repositories/`, `validators/`, `types/`, gran parte de `lib/`). La migración es,
en esencia, **sustituir el transporte** (HTTP/Server Actions/cookies) por el modelo de procesos de
Electron (Main/Renderer/IPC) y **cambiar el motor de datos** (PostgreSQL → local).

## 9.2 Arquitectura recomendada

Existen dos estrategias viables:

**Estrategia A — "Next embebido" (menor reescritura de UI):**
Empaquetar Next.js en modo `output:"standalone"` y arrancarlo como **servidor local** dentro del
proceso Main de Electron (en `127.0.0.1:puerto`), cargando la `BrowserWindow` contra esa URL. Se
conservan RSC, Server Actions, `next/navigation` y el routing. Solo se resuelve la base de datos
(SQLite) y las descargas/impresión. **Ventaja:** mínima reescritura del frontend. **Inconveniente:**
se arrastra la complejidad de un servidor Node embebido y de Auth.js.

**Estrategia B — "IPC nativo" (arquitectura de escritorio pura, recomendada a medio plazo):**
Convertir el frontend en una SPA (renderer) y mover toda la lógica al proceso Main como **handlers
IPC**. Se elimina Next server, Auth.js web y el middleware. **Ventaja:** app de escritorio idiomática,
más ligera y mantenible. **Inconveniente:** requiere adaptar routing (`next/navigation` →
`HashRouter`) y reescribir la capa `actions/` como IPC.

> **Recomendación:** empezar por **A** para llegar rápido a un ejecutable funcional (validación de
> mercado), y evolucionar a **B** por módulos. Este documento detalla el objetivo **B**, que es el
> destino arquitectónico correcto para una app local monousuario.

## 9.3 Separación Main / Renderer

```
┌──────────────────────── Proceso MAIN (Node) ────────────────────────┐
│  · Ciclo de vida de la app, ventanas (BrowserWindow)                 │
│  · Persistencia local (SQLite) — la ÚNICA capa con acceso a datos    │
│  · Handlers IPC = reencarnación de src/actions/* (Zod + reglas)      │
│  · Servicios y repositorios REUTILIZADOS sin cambios                 │
│  · Sesión local (guard), diálogos nativos (save/open), fs, logs      │
└───────────────▲───────────────────────────────┬─────────────────────┘
                │ ipcMain.handle / webContents.send │ (eventos de datos)
   preload.js (contextBridge) expone window.api    │
                │ ipcRenderer.invoke                 ▼
┌──────────────────────── Proceso RENDERER (Chromium) ─────────────────┐
│  · React 19 + componentes actuales (islas Client) reutilizados       │
│  · Router local (HashRouter) sustituye next/navigation               │
│  · Estado de datos con React Query/SWR (invalida al recibir eventos) │
└──────────────────────────────────────────────────────────────────────┘
```

## 9.4 IPC — Comunicación entre procesos

- Cada Server Action se convierte en un **handler** `ipcMain.handle("dominio:accion", fn)`. La
  función conserva **la misma validación Zod y las mismas reglas de negocio**; solo cambia el
  transporte.
- Un **preload script** con `contextBridge.exposeInMainWorld("api", {...})` expone funciones
  tipadas al renderer (`window.api.crearProyecto(input)` → `ipcRenderer.invoke("proyecto:crear", input)`).
- **`ActionResult<T>` se mantiene idéntico** (es serializable) → contrato ya listo para IPC.

**Mapa de conversión:**

| Concepto Next.js | Sustituto Electron |
|------------------|--------------------|
| `"use server"` + función | `ipcMain.handle("dominio:accion", …)` |
| import de la action en el cliente | `window.api.*` vía preload + `contextBridge` |
| `requireAuth()` (cookie JWT) | Guard local: bandera de sesión en Main (wrapper `conAuth`) |
| `revalidatePath()` | `webContents.send("datos:cambiados", {recurso})` + invalidación en el renderer |
| `/api/backup` (descarga) | `dialog.showSaveDialog` + `fs.writeFile` |
| `/api/auth/[...nextauth]` + middleware | Eliminados → IPC `auth:login/logout/session` + guard de navegación |
| Validación Zod | **Idéntica** en el handler |
| Services / Repositories | **Idénticos** |

## 9.5 Seguridad (configuración obligatoria de Electron)

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` en cada `BrowserWindow`.
- Exponer **solo** una API mínima y tipada por `contextBridge` (nunca `ipcRenderer` crudo).
- **CSP estricta** en el renderer (sin `unsafe-eval`; permitir `data:` solo si es imprescindible).
- Validar **todas** las entradas IPC con Zod en el Main (ya disponible).
- No abrir URLs externas en la ventana; interceptar `will-navigate`/`setWindowOpenHandler`.
- Detalle ampliado en el **Capítulo 12**.

## 9.6 Empaquetado

- **Herramienta recomendada:** `electron-builder` (madura, multiplataforma, firma e instaladores).
  Alternativa: `electron-forge`.
- **Prisma:** declarar `binaryTargets` para las plataformas objetivo y empaquetar el **query engine**
  como `extraResources` (fuera del asar). Ejecutar `prisma generate` en el build.
- **better‑sqlite3** (si se adopta, ver Cap. 10): módulo nativo → recompilar con
  `electron-rebuild`/`@electron/rebuild` por plataforma; incluir el `.node` correcto.
- **Assets:** la fuente Inter (`next/font`) y las ilustraciones SVG ya se empaquetan; no hay
  imágenes remotas.

## 9.7 Actualizaciones automáticas

- **`electron-updater`** (de electron‑builder) con un feed de actualización (GitHub Releases,
  S3, o servidor propio). Firmar los artefactos para que el updater los acepte.
- Estrategia de **migración de esquema en actualizaciones:** al arrancar una versión nueva,
  aplicar migraciones SQLite pendientes de forma idempotente (ver Cap. 10 §10.6) **antes** de abrir
  la ventana principal, con backup automático previo del archivo `.db`.

## 9.8 Firmado de código

- **Windows:** certificado Authenticode (EV recomendado para evitar SmartScreen).
- **macOS:** firma con Apple Developer ID + **notarización** (obligatoria) + `hardened runtime`.
- **Linux:** AppImage/deb/rpm; firma opcional.

## 9.9 Distribución e instaladores

| Plataforma | Formato recomendado |
|------------|---------------------|
| Windows | NSIS (`.exe`) y/o MSI |
| macOS | `.dmg` (universal: x64 + arm64) |
| Linux | AppImage (portable) + `.deb`/`.rpm` |

## 9.10 Optimización y gestión de memoria

- Un solo `PrismaClient` en el Main; `prisma.$disconnect()` en `app.on("before-quit")`.
- Lazy‑load de módulos pesados (jsPDF/ExcelJS) solo al exportar.
- Reutilizar la ventana; evitar fugas de listeners IPC (retirar en `destroy`).
- SQLite en modo **WAL** para lecturas concurrentes y mejor rendimiento.

## 9.11 Piezas que requieren reescritura específica

| Pieza | Problema | Solución |
|-------|----------|----------|
| `rich-text-editor` (`window.prompt`) | Deshabilitado en Electron | Diálogo Radix propio para URL de enlace/imagen |
| `backup-card` (`<a href="/api/backup">`) | Depende de servidor | IPC `backup:export` + `dialog.showSaveDialog` |
| Exportadores PDF/Excel (descarga DOM) | UX no nativa | IPC → `fs.writeFile` con diálogo de guardado |
| `use-query-params` / `next/navigation` | Requiere runtime Next | `HashRouter` + estado local |
| Auth.js (SessionProvider, signIn/out) | Modelo web | Sesión local monousuario |
| `window.print()` | OK, pero mejorable | `webContents.print()`/`printToPDF` opcional |

### 🔎 Recomendaciones y observaciones del Capítulo 9

- **Congelar** una interfaz `Puerto de datos` (las firmas de las Actions actuales) y hacer que
  tanto la web como Electron la implementen; así el frontend no distingue el transporte.
- Priorizar la **Estrategia A** para un MVP de escritorio en semanas, con hoja de ruta a **B**.

---

# Capítulo 10 — Persistencia Local

> Requisito: la app **no debe depender** de MySQL, PostgreSQL, MariaDB, SQL Server, Docker ni
> servidores externos. Todo debe funcionar con **archivos locales**. A continuación se comparan las
> tecnologías candidatas y se selecciona **una única opción** justificada.

## 10.1 Criterios de evaluación (ponderados según prioridades del proyecto)

Prioridades declaradas: cero instalación · un único archivo de BD · máxima estabilidad · alto
rendimiento · copias de seguridad sencillas · fácil despliegue · Windows/Linux/macOS · capacidad de
crecer.

## 10.2 Comparativa de motores

### SQLite (motor)
- **Ventajas:** estándar de facto para persistencia local embebida; **un único archivo**; cero
  instalación; extremadamente estable y probado; transaccional (ACID); excelente rendimiento en
  lectura; backup = copiar un archivo; multiplataforma total; soporta millones de registros.
- **Desventajas:** concurrencia de escritura limitada (un escritor a la vez; mitigado con WAL); sin
  tipos ricos (fechas/enums como texto/entero).
- **Escalabilidad:** sobrada para una app monousuario (miles/millones de filas).
- **Backup:** trivial (copiar `.db`, o `VACUUM INTO`).
- **Veredicto:** **base ideal** para este proyecto.

### better-sqlite3 (driver)
- **Ventajas:** el driver SQLite más rápido para Node/Electron; **API síncrona** (simple y sin
  overhead de promesas); muy estable; ideal para el proceso Main.
- **Desventajas:** módulo **nativo** → requiere `electron-rebuild` por plataforma.
- **Veredicto:** **driver recomendado** para SQLite en Electron.

### SQLite + Prisma
- **Ventajas:** **reutiliza casi el 100 % de la capa de datos actual** (repositorios/servicios);
  tipado excelente; migraciones gestionadas.
- **Desventajas:** empaquetar el **query engine** por plataforma es delicado con electron‑builder;
  enums no soportados en SQLite; `mode:"insensitive"` no soportado; peso extra del engine.
- **Veredicto:** **máxima reutilización de código** a cambio de fricción de empaquetado.

### SQLite + Drizzle
- **Ventajas:** ORM ligero, tipado, **sin engine binario** (usa el driver directamente, p. ej.
  better‑sqlite3); SQL cercano; arranque rápido; empaquetado más simple que Prisma.
- **Desventajas:** **reescribir** toda la capa de repositorios; curva de aprendizaje; migraciones
  propias (drizzle‑kit).
- **Veredicto:** **mejor rendimiento y empaquetado**, a costa de reescritura.

### SQLite puro (sin ORM)
- **Ventajas:** control total; máximo rendimiento; cero abstracción.
- **Desventajas:** perder el tipado y toda la capa Prisma; mucho SQL manual; más propenso a errores.
- **Veredicto:** innecesario aquí (se pierde el valor del tipado ya existente).

### LibSQL (Turso)
- **Ventajas:** fork de SQLite compatible; permite modo local (archivo) y remoto/replicado; driver
  con API async; futura sincronización en la nube.
- **Desventajas:** ecosistema más joven; valor real (sync) solo si se necesita nube.
- **Veredicto:** interesante **si** el roadmap contempla sincronización multi‑dispositivo; hoy sobra.

### PGlite (Postgres en WASM)
- **Ventajas:** Postgres real embebido en WASM; **conservaría enums y `mode:"insensitive"`**;
  compatibilidad de dialecto con las migraciones actuales.
- **Desventajas:** proyecto joven; rendimiento y madurez inferiores a SQLite nativo; peso WASM;
  menos idóneo en el proceso Main que un driver nativo.
- **Veredicto:** reduce fricción de dialecto, pero **sacrifica estabilidad/rendimiento** frente a SQLite.

### DuckDB
- **Ventajas:** orientado a analítica (OLAP) columnar; brutal para agregaciones/reportes.
- **Desventajas:** pensado para análisis, no para OLTP transaccional de una app CRUD; menos idóneo
  para escrituras frecuentes.
- **Veredicto:** **desalineado** con el patrón CRUD del proyecto.

### Realm (Atlas Device SDK)
- **Ventajas:** base de datos de objetos orientada a móvil/local; reactividad; sync opcional.
- **Desventajas:** modelo de objetos (no relacional); reescritura total; futuro incierto tras la
  adquisición por MongoDB; orientación móvil.
- **Veredicto:** **inadecuado** para un modelo relacional ya definido.

### LokiJS
- **Ventajas:** base de datos en memoria en JS puro; sin binarios; muy simple.
- **Desventajas:** **en memoria** con persistencia por volcado; no ACID robusto; no apta para datos
  críticos ni grandes volúmenes; proyecto poco mantenido.
- **Veredicto:** **descartada** por durabilidad/robustez insuficientes.

### RxDB
- **Ventajas:** base de datos reactiva local‑first con sync; observabilidad; múltiples adaptadores.
- **Desventajas:** NoSQL/documental; reescritura total; complejidad alta; overhead para una app CRUD
  sencilla.
- **Veredicto:** sobredimensionada; el modelo es relacional.

### IndexedDB
- **Ventajas:** nativa del navegador/renderer; sin binarios; asíncrona.
- **Desventajas:** vive en el **renderer** (no en Main); API de bajo nivel; NoSQL; no es "un único
  archivo" gestionable; consultas relacionales complejas costosas; backup no trivial.
- **Veredicto:** **inadecuada** para la capa de datos de negocio de esta app.

## 10.3 Tabla comparativa sintética

| Opción | Cero instal. | 1 archivo | Estabilidad | Rendimiento OLTP | Backup | Multiplataforma | Reutiliza código | Complejidad |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **SQLite + Prisma** | ✅ | ✅ | ★★★★★ | ★★★★☆ | ★★★★★ | ✅ | **★★★★★** | Media (engine) |
| SQLite + Drizzle | ✅ | ✅ | ★★★★★ | ★★★★★ | ★★★★★ | ✅ | ★★☆☆☆ | Media |
| SQLite puro (better‑sqlite3) | ✅ | ✅ | ★★★★★ | ★★★★★ | ★★★★★ | ✅ | ★☆☆☆☆ | Alta |
| LibSQL | ✅ | ✅ | ★★★★☆ | ★★★★☆ | ★★★★★ | ✅ | ★★★☆☆ | Media |
| PGlite | ✅ | ✅ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ✅ | ★★★★☆ | Media |
| DuckDB | ✅ | ✅ | ★★★★☆ | ★★☆☆☆ (OLTP) | ★★★★★ | ✅ | ★★☆☆☆ | Media |
| Realm | ✅ | ✅ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ✅ | ☆☆☆☆☆ | Alta |
| RxDB | ✅ | ⚠️ | ★★★☆☆ | ★★★☆☆ | ★★★☆☆ | ✅ | ☆☆☆☆☆ | Alta |
| LokiJS | ✅ | ⚠️ | ★★☆☆☆ | ★★★☆☆ | ★★★☆☆ | ✅ | ★☆☆☆☆ | Baja |
| IndexedDB | ✅ | ❌ | ★★★☆☆ | ★★★☆☆ | ★★☆☆☆ | ✅ | ☆☆☆☆☆ | Media |

## 10.4 Decisión: **SQLite, accedido mediante Prisma (`provider = "sqlite"`)**

**Selección única:** **SQLite como motor + Prisma como ORM (provider `sqlite`), con driver del
propio Prisma.** El archivo de base de datos vivirá en el directorio de datos del usuario
(`app.getPath("userData")`).

### Justificación técnica

1. **Máxima reutilización del código existente.** Toda la capa de datos (9 repositorios, 11
   servicios, tipos, DTOs) ya está escrita sobre Prisma. Mantener Prisma preserva ese activo y
   **reduce drásticamente el riesgo y el tiempo** de migración. Cambiar de ORM (Drizzle/puro)
   obligaría a reescribir y re‑probar toda la capa de datos.
2. **Cumple todas las prioridades:** SQLite es **un único archivo**, **cero instalación**, de
   **máxima estabilidad** (el motor más desplegado del mundo), **alto rendimiento** en el patrón
   OLTP de la app, **backup trivial** (copiar el `.db`, que además ya se contempla en `.gitignore`),
   **multiplataforma** y con **margen de crecimiento** de sobra (millones de filas).
3. **Alineado con el estado actual:** el proyecto ya está preparado (`.gitignore` ignora `*.db`,
   CUIDs generados en aplicación e independientes de la BD, relaciones en cascada compatibles).

### Coste asumido y mitigaciones

| Fricción de Prisma+SQLite | Mitigación |
|---------------------------|------------|
| Empaquetar el **query engine** por plataforma | Declarar `binaryTargets`; incluir el engine como `extraResources`; validar en CI por plataforma |
| **Enums** no soportados | Convertir `EstadoIncidencia`/`RolUsuario` a `String` + validación Zod (ya existente) |
| **`mode:"insensitive"`** no soportado | Usar `COLLATE NOCASE`/`LIKE`, o normalizar y filtrar en JS |
| **Migraciones** PostgreSQL no portables | Generar un **baseline SQLite nuevo** con `prisma migrate`; aplicar en primer arranque/actualización |
| `@db.Date` | Revisar mapeo a DATETIME; normalizar a "solo fecha" en la capa de servicio |

### Plan B documentado (si el empaquetado de Prisma resultara inviable)

Adoptar **Drizzle ORM + better‑sqlite3**: elimina el engine binario y mejora el rendimiento y el
empaquetado, a cambio de **reescribir la capa de repositorios** (los servicios, al depender de una
interfaz de repositorio, cambiarían poco si se respeta el contrato). Esta es la evolución natural si
se prioriza el tamaño del binario y el arranque frente a la reutilización.

## 10.5 Estrategia de datos "solo fecha"

Los 7 campos `@db.Date` deben normalizarse en la capa de servicio (truncar a medianoche local) para
mantener el comportamiento actual, dado que SQLite no distingue Date de DateTime.

## 10.6 Migraciones e inicialización en Electron

- **Primer arranque:** detectar BD ausente/vacía → crear el archivo, aplicar el esquema (baseline
  SQLite) y ejecutar el **seed esencial** (solo admin + config; **sin datos demo**), forzando al
  usuario a establecer una contraseña.
- **Actualizaciones:** aplicar migraciones pendientes de forma idempotente **con backup previo**
  automático del `.db`.

### 🔎 Recomendaciones y observaciones del Capítulo 10

- Activar **WAL** (`PRAGMA journal_mode=WAL`) y `foreign_keys=ON` al abrir la conexión.
- Programar **backups automáticos** rotados del archivo `.db` (diario/al cerrar) además del export
  JSON existente.

---

# Capítulo 11 — Sistema de Archivos

> Ubicaciones recomendadas por Electron (`app.getPath(...)`) para cada tipo de dato.

| Recurso | Ruta Electron recomendada | Notas |
|---------|---------------------------|-------|
| **Base de datos** (`.db` SQLite) | `app.getPath("userData")/impresionweb.db` | Persistente por usuario; incluido en backups |
| **Configuración** de la app | `userData/config.json` (o tabla `Configuracion`) | Preferencias (tema, empresa) |
| **Logs** | `app.getPath("logs")` o `userData/logs/` | Rotados; el `logger` actual debe escribir a archivo |
| **Caché** | `app.getPath("cache")` / `userData/cache/` | Regenerable; borrable sin pérdida |
| **Imágenes / logo** | `userData/assets/` | Copiar el logo elegido a esta carpeta y guardar la ruta |
| **Documentos / PDFs exportados** | `app.getPath("documents")` (diálogo de guardado) | El usuario elige; no en `userData` |
| **Excel exportados** | `app.getPath("downloads")` o diálogo | Igual que PDF |
| **Backups (`.json`)** | `app.getPath("documents")/ImpresionWeb Backups/` o diálogo | Export manual + copias automáticas del `.db` |
| **Temporales** | `app.getPath("temp")` | Limpiar tras uso |

**Principios:**
- **Nunca** escribir dentro del directorio de instalación (solo lectura / rompe firma).
- Datos críticos (BD, config) en `userData`; artefactos que el usuario "se lleva" (PDF/Excel/backup)
  vía **diálogo de guardado** en `documents`/`downloads`.
- El `DATABASE_URL` debe fijarse en el Main (`file:` + ruta en `userData`) **antes** de instanciar
  Prisma.

### 🔎 Recomendaciones y observaciones del Capítulo 11

- Implementar una utilidad central de rutas (`paths.ts`) en el Main que resuelva todas estas
  ubicaciones, para no dispersar `getPath` por el código — 🟢.

---

# Capítulo 12 — Seguridad

## 12.1 Estado actual (web)

- **Protección de rutas** por middleware (lista blanca) + guardia en `(dashboard)/layout`.
- **Autenticación** con bcrypt (coste 12) y JWT en cookie (8 h). Fallos genéricos (no revelan causa).
- **Sanitización** del HTML de Tiptap por regex antes de persistir (`sanitizarHtml`).
- **Confirmación fuerte** ("RESTAURAR") en la restauración destructiva.
- **`poweredByHeader:false`**; `Cache-Control: no-store` en el backup.

## 12.2 Debilidades detectadas (aplican a web y/o Electron)

| Debilidad | Riesgo | Prioridad |
|-----------|--------|-----------|
| Sanitización HTML **por regex** (evasiones conocidas) | XSS almacenado si el contenido deja de ser de confianza | 🔴 |
| Backup incluye **hash de contraseña** sin cifrar | Ataque offline si el archivo se filtra | 🔴 |
| Emails logueados en intentos fallidos | PII en logs / enumeración | 🟡 |
| `/api/backup` fuera del `matcher` del middleware | Frágil si se añaden endpoints | 🟡 |
| Render de HTML sin re‑sanitizar en cliente | Defensa en profundidad ausente | 🟡 |

## 12.3 Seguridad específica de Electron (obligatoria)

- **Context Isolation** (`contextIsolation:true`) + **sin `nodeIntegration`** + **`sandbox:true`**.
- **IPC seguro:** exponer solo una API mínima por `contextBridge`; **validar toda entrada IPC con
  Zod** en el Main (ya disponible); nombrar canales por dominio (`proyecto:crear`).
- **CSP estricta** en el renderer; prohibir `eval`; restringir orígenes.
- **Protección frente a RCE:** no ejecutar contenido remoto; `setWindowOpenHandler` → denegar o abrir
  en el navegador externo; interceptar `will-navigate`.
- **Path Traversal:** al guardar/leer archivos elegidos por el usuario, **normalizar y validar** las
  rutas; nunca construir rutas a partir de entrada sin sanear.
- **Gestión de credenciales / secretos:** guardar el hash/estado de sesión con **`safeStorage`**
  (Keychain/DPAPI/libsecret) en lugar de texto plano; no persistir contraseñas en claro.
- **Almacenamiento seguro:** considerar **cifrar el archivo `.db`** (p. ej. SQLCipher) o al menos
  cifrar los backups que contengan el hash.
- **Firma y actualizaciones seguras:** firmar el binario (Cap. 9.8) y verificar la firma de las
  actualizaciones (`electron-updater` con feed firmado).

## 12.4 Recomendaciones concretas

1. Sustituir la sanitización regex por **DOMPurify** (nativo en el renderer de Electron).
2. **Excluir la contraseña** del backup, o **cifrar** el archivo exportado.
3. Migrar la sesión a **`safeStorage`** en Electron.
4. Añadir CSP y las banderas de aislamiento desde el primer día del proyecto Electron.

### 🔎 Recomendaciones y observaciones del Capítulo 12

- La seguridad en Electron es **responsabilidad del desarrollador** (no hay sandbox de servidor):
  aplicar el checklist oficial de seguridad de Electron como criterio de aceptación.

---

# Capítulo 13 — Rendimiento

## 13.1 Estado actual y optimizaciones presentes

- **RSC + `Promise.all`** para paralelizar consultas por página.
- **Índices** en las columnas de filtro/orden (`createdAt`, `fecha`, `estado`, FKs, `orden`).
- **Agregaciones en BD** (`aggregate`, `groupBy`, `count`) para el dashboard.
- **`optimizePackageImports`** (lucide, recharts) reduce el bundle.
- **Debounce** de búsqueda (350 ms).

## 13.2 Puntos de mejora

| Punto | Impacto | Prioridad |
|-------|---------|-----------|
| Ordenar proyectos por métricas **en memoria** (trae todo el conjunto) | Degrada con muchos proyectos | 🟡 |
| Backup **serializa todo en memoria** | Irrelevante en local; malo a gran escala | 🟢 (local) |
| `proyecto.listar` incluye **todas** las impresiones para métricas | N+1 en volumen | 🟡 |
| `framer-motion` posiblemente sin uso | Bundle innecesario | 🟢 |

## 13.3 Rendimiento en Electron

- **SQLite en WAL** + `better-sqlite3` (si se adopta) → lecturas muy rápidas y síncronas en el Main.
- **Lazy‑load** de jsPDF/ExcelJS solo al exportar.
- **Memoria:** un único `PrismaClient`; cerrar conexión al salir; retirar listeners IPC.
- **Arranque:** con Estrategia A (Next embebido) el arranque es más lento (levantar server); con
  Estrategia B (SPA + IPC) el arranque es más ligero.
- **CPU:** las agregaciones se resuelven en SQLite; para reportes muy pesados, considerar índices
  adicionales o vistas.

### 🔎 Recomendaciones y observaciones del Capítulo 13

- Sustituir el cálculo de métricas de proyecto por **agregados SQL** (`_count`/`_sum`) para paginar
  en BD y eliminar el ordenamiento en memoria — 🟡.
- Medir el tamaño final del binario; el engine de Prisma añade peso (contrapeso del Plan B/Drizzle).

---

# Capítulo 14 — Roadmap Completo

> Migración por fases. Cada fase incluye objetivos, riesgos, dependencias, tiempo estimado,
> prioridad, resultado esperado y criterios de aceptación. Estimaciones para 1 desarrollador
> full‑stack con experiencia en Electron (orientativas).

## Fase 0 — Preparación y decisiones (base)
- **Objetivos:** congelar el "Puerto de datos" (firmas de Actions), elegir Estrategia A/B, fijar
  `engines`, auditar `framer-motion`, crear `tsconfig.main.json`.
- **Riesgos:** decisiones arquitectónicas mal tomadas se pagan caro después.
- **Dependencias:** este documento.
- **Tiempo:** 3–5 días. **Prioridad:** 🔴.
- **Resultado:** ADR (Architecture Decision Record) y esqueleto de proyecto Electron.
- **Aceptación:** app Electron "hola mundo" que abre una `BrowserWindow` con las banderas de
  seguridad correctas.

## Fase 1 — Persistencia local (SQLite + Prisma)
- **Objetivos:** cambiar `provider` a `sqlite`; enums→String; resolver `mode:"insensitive"`;
  baseline de migraciones SQLite; `DATABASE_URL` en `userData`; empaquetar el query engine.
- **Riesgos:** empaquetado del engine por plataforma; regresiones en búsquedas.
- **Dependencias:** Fase 0.
- **Tiempo:** 1–2 semanas. **Prioridad:** 🔴.
- **Resultado:** los repositorios/servicios actuales operando contra SQLite local.
- **Aceptación:** suite de pruebas de CRUD verde en Windows/macOS/Linux con un `.db` local.

## Fase 2 — Capa IPC (Main) y puente preload
- **Objetivos:** reencarnar `src/actions/*` como handlers IPC (conservando Zod y reglas);
  `contextBridge`; guard de sesión local; sustituir `revalidatePath` por eventos.
- **Riesgos:** olvidar validación en algún handler; fugas de listeners.
- **Dependencias:** Fase 1.
- **Tiempo:** 1–2 semanas. **Prioridad:** 🔴.
- **Resultado:** `window.api.*` tipado disponible en el renderer.
- **Aceptación:** todas las mutaciones funcionan por IPC con `ActionResult`.

## Fase 3 — Autenticación local
- **Objetivos:** sustituir Auth.js por login local (bcrypt), sesión en memoria/`safeStorage`,
  seed esencial en primer arranque con contraseña obligatoria.
- **Riesgos:** seguridad de la sesión local; UX del primer arranque.
- **Dependencias:** Fases 1–2.
- **Tiempo:** 4–6 días. **Prioridad:** 🔴.
- **Resultado:** login funcional sin servidor.
- **Aceptación:** no se puede operar sin autenticar; cambio de contraseña forzado el primer día.

## Fase 4 — Routing y frontend
- **Objetivos:** sustituir `next/navigation`/`useQueryParams` por `HashRouter` + estado; integrar
  React Query/SWR con los eventos de datos; reemplazar `window.prompt` del editor por diálogo propio.
- **Riesgos:** dispersión de `next/navigation`; regresiones de búsqueda/filtro/paginación.
- **Dependencias:** Fase 2.
- **Tiempo:** 1–2 semanas. **Prioridad:** 🟡.
- **Resultado:** SPA navegable sin runtime Next server.
- **Aceptación:** paridad funcional con la web en navegación y filtros.

## Fase 5 — Archivos: exportación, backup, impresión
- **Objetivos:** IPC para PDF/Excel (`dialog`+`fs`), export/restore de backup por diálogo,
  `webContents.print()`; rutas de archivos según Cap. 11.
- **Riesgos:** rutas/permeabilidad de path traversal.
- **Dependencias:** Fases 2, 4.
- **Tiempo:** 4–6 días. **Prioridad:** 🟡.
- **Resultado:** exportaciones y backups nativos.
- **Aceptación:** guardar PDF/Excel/backup con diálogo nativo y restaurar correctamente.

## Fase 6 — Seguridad y endurecimiento
- **Objetivos:** DOMPurify, CSP, `safeStorage`, cifrado de backups, checklist de Electron.
- **Dependencias:** Fases 2–5.
- **Tiempo:** 4–6 días. **Prioridad:** 🔴.
- **Aceptación:** auditoría de seguridad de Electron superada.

## Fase 7 — Empaquetado, firma, actualizaciones
- **Objetivos:** `electron-builder`, instaladores por plataforma, firma/notarización,
  `electron-updater`, migraciones con backup previo.
- **Dependencias:** Fases 1–6.
- **Tiempo:** 1–2 semanas. **Prioridad:** 🔴.
- **Aceptación:** instaladores firmados que se actualizan solos en las 3 plataformas.

## Fase 8 — QA, rendimiento y pulido
- **Objetivos:** pruebas E2E, métricas de arranque/memoria, optimización de consultas, telemetría de
  errores opcional (Sentry).
- **Dependencias:** todas.
- **Tiempo:** 1–2 semanas. **Prioridad:** 🟡.
- **Aceptación:** criterios de rendimiento y estabilidad definidos y cumplidos.

**Duración total orientativa:** ~8–12 semanas (1 desarrollador), reducible con Estrategia A para un
MVP funcional más temprano.

### 🔎 Recomendaciones y observaciones del Capítulo 14

- Entregar valor pronto: **Estrategia A** puede producir un ejecutable funcional al final de la Fase 1
  (Next embebido + SQLite), y migrar a IPC (Fases 2–4) de forma incremental.

---

# Capítulo 15 — Riesgos Técnicos

| # | Riesgo | Probabilidad | Impacto | Prevención | Mitigación/solución |
|---|--------|:---:|:---:|-----------|---------------------|
| 1 | Empaquetado del **query engine de Prisma** por plataforma | Alta | Alto | `binaryTargets` + CI multiplataforma temprano | Plan B: Drizzle + better‑sqlite3 |
| 2 | **Enums** SQLite incompatibles | Alta | Medio | Convertir a String desde Fase 1 | Validación Zod (ya existe) |
| 3 | **`mode:"insensitive"`** roto en SQLite | Alta | Medio | Auditar búsquedas | `COLLATE NOCASE`/filtrado JS |
| 4 | **`window.prompt`** del editor no funciona | Alta | Medio | Reemplazo temprano | Diálogo Radix propio |
| 5 | **Auth.js** difícil de encajar en Electron | Media | Alto | Rediseño a auth local (Fase 3) | Sesión local + `safeStorage` |
| 6 | **Migraciones** PostgreSQL no portables | Alta | Medio | Baseline SQLite nuevo | Aplicación idempotente + backup previo |
| 7 | **Módulos nativos** (better‑sqlite3) sin recompilar | Media | Alto | `electron-rebuild` en build | CI por plataforma |
| 8 | **Firma/notarización** (macOS) mal configurada | Media | Alto | Preparar certificados pronto | Documentar proceso; probar en Fase 7 |
| 9 | **Corrupción del `.db`** local | Baja | Alto | WAL + backups automáticos | Restauración desde backup |
| 10 | **Fuga de secretos** (backup con hash) | Media | Alto | Excluir/cifrar contraseña | Cifrado de backups |
| 11 | **Seguridad Electron** mal configurada (RCE/XSS) | Media | Crítico | Checklist desde Fase 0 | CSP + aislamiento + DOMPurify |
| 12 | **Dispersión de `next/navigation`** complica el routing | Media | Medio | Inventariar usos | Abstracción de routing |
| 13 | **Tamaño del binario** elevado (engine Prisma) | Media | Bajo | Medir pronto | Plan B Drizzle |
| 14 | **`@db.Date`** cambia semántica en SQLite | Media | Medio | Normalizar en servicio | Truncado a medianoche |

### 🔎 Recomendaciones y observaciones del Capítulo 15

- Los riesgos 1, 5 y 11 son los **críticos**: abordarlos con pruebas de concepto en las Fases 0–1
  antes de comprometer el resto del cronograma.

---

# Capítulo 16 — Conclusiones

## 16.1 Estado del proyecto

ImpresiónWeb es una aplicación **bien arquitecturada**, con una separación de responsabilidades
ejemplar, tipado extremo a extremo y un modelo de datos pequeño y coherente. Su naturaleza
**monousuario y privada** la convierte en una candidata natural para convertirse en una **aplicación
de escritorio local** con Electron.

## 16.2 Estrategia de migración (síntesis)

- **Conservar** sin cambios la lógica de negocio: `services/`, `repositories/`, `validators/`,
  `types/` y buena parte de `lib/`. Es el **70 % del backend** y el activo más valioso.
- **Sustituir el transporte:** `actions/` → **handlers IPC**; `middleware`/`api` → **eliminados/IPC**;
  `requireAuth` → **guard local**; `revalidatePath` → **eventos**.
- **Cambiar el motor de datos:** PostgreSQL → **SQLite vía Prisma** (`provider="sqlite"`), archivo
  en `userData`, resolviendo enums, `@db.Date` y `mode:"insensitive"`.
- **Adaptar piezas concretas del frontend:** `window.prompt` del editor, descargas/backup por
  diálogos nativos, y routing (`next/navigation` → `HashRouter`).

## 16.3 Por qué la arquitectura elegida es la mejor

- **SQLite + Prisma** maximiza la reutilización del código ya escrito, cumple **todas** las
  prioridades (cero instalación, un solo archivo, estabilidad, rendimiento, backup trivial,
  multiplataforma, crecimiento) y mantiene el tipado. El **Plan B (Drizzle + better‑sqlite3)** queda
  documentado como evolución si el empaquetado del engine se vuelve un obstáculo.
- El modelo **IPC nativo (Estrategia B)** produce una app de escritorio idiomática, ligera y segura,
  mientras que la **Estrategia A (Next embebido)** permite un MVP temprano. La combinación
  "A primero, B después" **minimiza el riesgo** y **entrega valor pronto**.

## 16.4 Prioridades inmediatas

1. Prueba de concepto de **SQLite + Prisma empaquetado** en las 3 plataformas (riesgo #1).
2. Rediseño de **autenticación local** (riesgo #5).
3. **Endurecimiento de seguridad** de Electron desde el primer día (riesgo #11).
4. Corrección de la **deuda de seguridad** heredada (sanitización, backup con hash).

## 16.5 Cierre

El proyecto llega a esta migración en una posición **favorable**: la deuda técnica es acotada y está
inventariada, la lógica de negocio es portable, y no existen dependencias de red en el render. Con la
hoja de ruta de 8 fases y la selección de persistencia justificada, la conversión a Electron es
**viable, de riesgo controlado y de alto valor** para un producto que, por diseño, encaja mejor como
aplicación de escritorio local que como servicio web.

---

# Apéndice A — Registro consolidado de deuda técnica

| # | Ítem | Ubicación | Impacto | Prioridad |
|---|------|-----------|---------|-----------|
| 1 | Sanitización XSS por regex (usar DOMPurify) | `lib/sanitize.ts` | Seguridad | 🔴 |
| 2 | Backup expone hash de contraseña sin cifrar | `backup.service.ts`, `api/backup` | Seguridad | 🔴 |
| 3 | `mode:"insensitive"` incompatible con SQLite | services (proyecto/incidencia/inventario/salida) | Migración | 🔴 |
| 4 | `window.prompt` en el editor Tiptap | `rich-text-editor.tsx` | Roto en Electron | 🔴 |
| 5 | Auth.js beta acoplada a servidor/cookies | `auth.*`, `middleware`, `session.ts` | Migración | 🔴 |
| 6 | Migraciones PostgreSQL no portables | `prisma/migrations/*` | Migración | 🔴 |
| 7 | Falta `binaryTargets` en el generator | `schema.prisma` | Empaquetado | 🟡 |
| 8 | Ordenación por métricas en memoria | `proyecto.service.listar` | Rendimiento | 🟡 |
| 9 | `proyecto.listar` trae todas las impresiones | `proyecto.repository` | Rendimiento | 🟡 |
| 10 | Emails en logs de intentos fallidos | `auth.ts` | Privacidad | 🟡 |
| 11 | `restaurar` no valida `version` del backup | `backup.service` | Robustez | 🟡 |
| 12 | Consumo tinta/papel infravalora reposiciones | `tinta/papel.service` | Exactitud | 🟡 |
| 13 | `/api/backup` fuera del middleware | `middleware.ts` | Seguridad | 🟡 |
| 14 | Colores hardcodeados en `incidencias-chart` | `incidencias-chart.tsx` | Consistencia | 🟡 |
| 15 | Reducir nº de tintas borra histórico | `tinta.service.configurar` | Pérdida de datos | 🟡 |
| 16 | Render de HTML sin re‑sanitizar en cliente | `incidencia-view-dialog`, `proyecto-notas` | Defensa profundidad | 🟡 |
| 17 | `configuracion.actualizar` no atómico / casts frágiles | `configuracion.repository` | Robustez | 🟡 |
| 18 | `calcularRango` sin validar entradas / TZ local | `lib/dates.ts` | Robustez | 🟡 |
| 19 | Falta `output:"standalone"` (Estrategia A) | `next.config.mjs` | Migración | 🟡 |
| 20 | `Configuracion` sin `createdAt` | `schema.prisma` | Consistencia | 🟢 |
| 21 | `RolUsuario` con un único valor | `schema.prisma` | Sobre‑ingeniería | 🟢 |
| 22 | `framer-motion` posiblemente sin uso | `package.json` | Bundle | 🟢 |
| 23 | `reportes/` sin `loading.tsx` | `app/(dashboard)/reportes` | UX | 🟢 |
| 24 | Rama muerta en `logger.escribir` | `lib/logger.ts` | Cosmético | 🟢 |
| 25 | `useQueryParams` usa `push` (llena historial) | `hooks/use-query-params` | UX | 🟢 |
| 26 | Estado local duplicado fuera de RHF | varios diálogos | Mantenibilidad | 🟢 |
| 27 | Falta `engines` en `package.json` | `package.json` | Reproducibilidad | 🟢 |

---

# Apéndice B — Inventario completo de archivos

**Raíz:** `package.json`, `package-lock.json`, `tsconfig.json`, `.eslintrc.json`,
`postcss.config.mjs`, `components.json`, `next.config.mjs`, `tailwind.config.ts`, `.env.example`,
`.gitignore`, `next-env.d.ts`, `README.md`, `BIBLIA_DEL_PROYECTO.md`.

**prisma/:** `schema.prisma`, `seed.ts`, `migrations/{0001_init, 0002_tintas, 0003_papel,
0004_inventario_bloqueo_ruta, 0005_proyecto_produccion_notas}/migration.sql`,
`migrations/migration_lock.toml`.

**src/app/:** `layout.tsx`, `page.tsx`, `not-found.tsx`, `globals.css`, `login/page.tsx`,
`api/auth/[...nextauth]/route.ts`, `api/backup/route.ts`, `(dashboard)/{layout, error}.tsx`,
`(dashboard)/dashboard/{page, loading}.tsx`, `(dashboard)/proyectos/{page, loading}.tsx`,
`(dashboard)/proyectos/[id]/page.tsx`, `(dashboard)/salidas/{page, loading}.tsx`,
`(dashboard)/inventario/{page, loading}.tsx`, `(dashboard)/tintas/{page, loading}.tsx`,
`(dashboard)/incidencias/{page, loading}.tsx`, `(dashboard)/reportes/page.tsx`,
`(dashboard)/configuracion/page.tsx`, `(dashboard)/base-conocimiento/page.tsx`.

**src/actions/:** `auth, backup, configuracion, impresion, incidencia, inventario, papel, proyecto,
salida, tinta`.actions.ts.

**src/services/:** `backup, configuracion, dashboard, impresion, incidencia, inventario, papel,
proyecto, reporte, salida, tinta`.service.ts.

**src/repositories/:** `configuracion, impresion, incidencia, inventario, papel, proyecto, salida,
tinta, usuario`.repository.ts.

**src/validators/:** `auth, configuracion, impresion, incidencia, inventario, papel, proyecto,
salida, tinta`.validator.ts.

**src/lib/:** `prisma, session, sanitize, dates, format, constants, logger, utils`.ts,
`export/{pdf-report, excel-report}.ts`.

**src/hooks/:** `use-query-params.ts`. **src/types/:** `index.ts`, `next-auth.d.ts`.
**src/:** `auth.ts`, `auth.config.ts`, `middleware.ts`.

**src/components/ui/:** avatar, badge, button, card, dialog, dropdown-menu, input, label, popover,
select, separator, skeleton, sonner, switch, table, tabs, textarea, tooltip.

**src/components/shared/:** breadcrumbs, confirm-dialog, empty-state, page-header, pagination,
search-bar, sort-select, table-skeleton, theme-toggle.

**src/components/layout/:** header, sidebar, sidebar-nav, mobile-nav, nav-config, user-menu.

**src/components/providers/:** theme-provider.

**src/components/dashboard/:** stat-card, activity-chart, incidencias-chart.

**src/components/auth/:** login-form.

**src/components/proyectos/:** proyecto-actions, proyecto-form-dialog, proyecto-notas,
impresion-actions, impresion-form-dialog.

**src/components/salidas/:** salida-actions, salida-form-dialog.

**src/components/inventario/:** inventario-actions, inventario-form-dialog.

**src/components/tintas/:** configurar-tintas-inicial, configurar-tintas, tinta-card,
tinta-edit-dialog, papel-card, papel-add-dialog, papel-edit-dialog.

**src/components/incidencias/:** estado-badge, estado-filter, incidencia-actions,
incidencia-form-dialog, incidencia-view-dialog, rich-text-editor.

**src/components/reportes/:** report-filters, export-buttons.

**src/components/configuracion/:** general-form, admin-form, backup-card.

**src/components/base-conocimiento/:** base-conocimiento, kb-data, kb-illustrations.

---

> **Fin del documento.** Esta Biblia debe mantenerse viva: actualícese en cada cambio estructural
> (nuevo modelo Prisma, nueva ruta, nueva dependencia o decisión arquitectónica) para conservar su
> valor como fuente única de verdad durante toda la migración a Electron y más allá.
