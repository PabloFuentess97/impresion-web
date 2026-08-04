-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('PENDIENTE', 'EN_PRODUCCION', 'PAUSADO', 'TERMINADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PrioridadProyecto" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- AlterTable
ALTER TABLE "proyectos"
ADD COLUMN "estado" "EstadoProyecto" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN "prioridad" "PrioridadProyecto" NOT NULL DEFAULT 'MEDIA',
ADD COLUMN "fechaInicio" DATE,
ADD COLUMN "fechaEntrega" DATE;

-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "descripcion" TEXT NOT NULL,
    "detalle" JSONB,
    "usuarioId" TEXT,
    "usuarioEmail" TEXT,
    "usuarioNombre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditoria_createdAt_idx" ON "auditoria"("createdAt");

-- CreateIndex
CREATE INDEX "auditoria_entidad_idx" ON "auditoria"("entidad");

-- CreateIndex
CREATE INDEX "auditoria_accion_idx" ON "auditoria"("accion");

-- CreateIndex
CREATE INDEX "auditoria_usuarioId_idx" ON "auditoria"("usuarioId");

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed new configurable modules.
INSERT INTO "modulos_configuracion" ("id", "clave", "activo", "createdAt", "updatedAt") VALUES
('mod_calendario', 'calendario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_auditoria', 'auditoria', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("clave") DO NOTHING;
