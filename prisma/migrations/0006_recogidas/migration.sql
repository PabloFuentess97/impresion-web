-- CreateEnum
CREATE TYPE "EstadoRecogida" AS ENUM ('PENDIENTE', 'APROBADA', 'DENEGADA');

-- AlterTable
ALTER TABLE "configuracion" ADD COLUMN     "recogidaToken" TEXT;

-- CreateTable
CREATE TABLE "recogidas" (
    "id" TEXT NOT NULL,
    "nbi" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidades" INTEGER NOT NULL,
    "estado" "EstadoRecogida" NOT NULL DEFAULT 'PENDIENTE',
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltoEn" TIMESTAMP(3),
    "salidaId" TEXT,
    "proyectoId" TEXT NOT NULL,

    CONSTRAINT "recogidas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recogidas_estado_idx" ON "recogidas"("estado");

-- CreateIndex
CREATE INDEX "recogidas_proyectoId_idx" ON "recogidas"("proyectoId");

-- CreateIndex
CREATE INDEX "recogidas_createdAt_idx" ON "recogidas"("createdAt");

-- AddForeignKey
ALTER TABLE "recogidas" ADD CONSTRAINT "recogidas_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
