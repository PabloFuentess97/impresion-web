-- CreateTable
CREATE TABLE "tintas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366F1',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "porcentaje" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tintas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturas_tinta" (
    "id" TEXT NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tintaId" TEXT NOT NULL,

    CONSTRAINT "lecturas_tinta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tintas_orden_idx" ON "tintas"("orden");

-- CreateIndex
CREATE INDEX "lecturas_tinta_tintaId_idx" ON "lecturas_tinta"("tintaId");

-- CreateIndex
CREATE INDEX "lecturas_tinta_fecha_idx" ON "lecturas_tinta"("fecha");

-- AddForeignKey
ALTER TABLE "lecturas_tinta" ADD CONSTRAINT "lecturas_tinta_tintaId_fkey" FOREIGN KEY ("tintaId") REFERENCES "tintas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

