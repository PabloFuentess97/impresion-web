-- AlterTable
ALTER TABLE "proyectos" ADD COLUMN     "rutaImpresion" TEXT,
ADD COLUMN     "bloqueado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "inventario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventario_createdAt_idx" ON "inventario"("createdAt");
