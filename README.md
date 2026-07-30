# ImpresiónWeb

Aplicación SaaS para la **gestión de proyectos de impresión 3D**, con control de
impresiones, salidas de material, incidencias y generación de reportes.

Construida con **Next.js 15 (App Router)**, **TypeScript**, **PostgreSQL**,
**Prisma**, **TailwindCSS**, **shadcn/ui**, **Auth.js (NextAuth v5)**, **Tiptap**
y **Recharts**. Diseño moderno inspirado en Linear, Vercel y Notion, con modo
claro/oscuro y totalmente en español.

---

## ✨ Características

- 🔐 **Autenticación de administrador** (sin registro público) con Auth.js + bcrypt.
- 📊 **Dashboard** con tarjetas estadísticas y gráficos de actividad.
- 📁 **Proyectos** con CRUD completo, búsqueda, ordenación y paginación.
  Incluyen **ruta de impresión** (texto plano) y **bloqueo**: los proyectos
  bloqueados se resaltan en el listado y quedan en **solo lectura** (no se
  pueden editar/eliminar ni cambiar sus impresiones y salidas); desbloquear
  requiere confirmación.
- 🖨️ **Impresiones** por proyecto (nombre, cantidad, tiempo, fecha automática).
- 🚚 **Salidas** de material: unidades de un proyecto enviadas a un destino.
- 📦 **Inventario** de artículos con nombre y cantidad (búsqueda, orden y
  paginación).
- 🎨 **Tintas y papel**: tintas configurables (4, 6 o 9) con control de nivel
  (%) y stock de rollos de papel; con histórico. Los reportes comparan el
  valor anterior con el actual y muestran el consumo de tinta y de papel.
- ⚠️ **Incidencias** con editor de texto enriquecido (Tiptap) y estados.
- 📈 **Reportes** diario/semanal/mensual/personalizado con exportación a
  **PDF** y **Excel**, e **impresión** directa.
- ⚙️ **Configuración** de empresa, logo, tema y datos del administrador.
- 💾 **Copias de seguridad**: descarga de un volcado completo (JSON) de toda
  la base de datos y **restauración** desde archivo (con confirmación fuerte).
- 🌗 **Modo claro / oscuro** y diseño responsive.

---

## 🧱 Arquitectura

El código sigue una separación por capas (Clean Architecture) y principios SOLID:

```
src/
├── app/            → Rutas (App Router), layouts y páginas
├── actions/        → Server Actions (validan, autorizan y orquestan)
├── services/       → Lógica de negocio
├── repositories/   → Acceso a datos (Prisma)
├── validators/     → Esquemas de validación (Zod)
├── components/     → Componentes de UI (ui/, layout/, shared/, por módulo)
├── hooks/          → Hooks reutilizables
├── lib/            → Utilidades, auth, prisma, formato, exportación
└── types/          → Tipos compartidos
prisma/             → Esquema, migraciones y seed
```

> La lógica **no** se escribe en los componentes: fluye
> `componente → action → service → repository`.

---

## 🚀 Puesta en marcha (local)

### 1. Requisitos

- Node.js 18.18+ (recomendado 20/22)
- PostgreSQL 13+

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Edita `DATABASE_URL` con tus credenciales de PostgreSQL y genera un `AUTH_SECRET`:

```bash
npx auth secret
```

### 4. Crear la base de datos y aplicar el esquema

```bash
# Aplica las migraciones
npm run db:deploy

# (alternativa en desarrollo)
npm run db:push
```

### 5. Cargar datos iniciales (usuario admin + ejemplos)

```bash
npm run db:seed
```

Esto crea el administrador con las credenciales de `.env`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### 6. Arrancar en desarrollo

```bash
npm run dev
```

Abre <http://localhost:3000> e inicia sesión con las credenciales del seed.

**Credenciales por defecto:**
- Email: `admin@impresionweb.com`
- Contraseña: `Admin1234!`

---

## 📦 Scripts disponibles

| Script              | Descripción                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                       |
| `npm run build`     | Compila para producción (genera Prisma)      |
| `npm run start`     | Arranca el servidor de producción            |
| `npm run db:deploy` | Aplica migraciones en producción             |
| `npm run db:push`   | Sincroniza el esquema (desarrollo)           |
| `npm run db:seed`   | Carga datos iniciales                        |
| `npm run db:studio` | Abre Prisma Studio                           |
| `npm run lint`      | Ejecuta ESLint                               |

---

## ☁️ Despliegue en SeeNode

1. Crea una base de datos **PostgreSQL** en SeeNode y copia su cadena de conexión.
2. Configura las variables de entorno del proyecto:
   - `DATABASE_URL` → cadena de conexión de PostgreSQL
   - `AUTH_SECRET` → secreto aleatorio (`npx auth secret`)
   - `AUTH_URL` / `NEXTAUTH_URL` → URL pública del despliegue
   - `AUTH_TRUST_HOST` → `true`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NOMBRE`
3. Comando de build: `npm run build`
4. Comando de arranque: `npm run start`
5. Tras el primer despliegue, ejecuta las migraciones y el seed:
   ```bash
   npm run db:deploy && npm run db:seed
   ```

> El proyecto está optimizado para Node.js + PostgreSQL en SeeNode.

---

## 🔒 Seguridad

- Contraseñas cifradas con **bcrypt** (coste 12).
- Validación de todas las entradas con **Zod**.
- Sanitización del HTML enriquecido (protección **XSS**).
- Protección de rutas mediante **middleware** de Auth.js.
- Sesiones **JWT** con expiración.
- Manejo centralizado de errores y logs.
