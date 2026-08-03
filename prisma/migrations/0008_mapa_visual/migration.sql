-- CreateTable
CREATE TABLE "estancias_mapa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "ancho" INTEGER NOT NULL DEFAULT 1200,
    "alto" INTEGER NOT NULL DEFAULT 800,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estancias_mapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zonas_mapa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "ancho" DOUBLE PRECISION NOT NULL,
    "alto" DOUBLE PRECISION NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366F1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estanciaId" TEXT NOT NULL,

    CONSTRAINT "zonas_mapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones_impresion" (
    "id" TEXT NOT NULL,
    "cantidad" INTEGER,
    "nota" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "impresionId" TEXT NOT NULL,
    "zonaId" TEXT NOT NULL,

    CONSTRAINT "ubicaciones_impresion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "estancias_mapa_orden_idx" ON "estancias_mapa"("orden");

-- CreateIndex
CREATE INDEX "zonas_mapa_estanciaId_idx" ON "zonas_mapa"("estanciaId");

-- CreateIndex
CREATE INDEX "ubicaciones_impresion_impresionId_idx" ON "ubicaciones_impresion"("impresionId");

-- CreateIndex
CREATE INDEX "ubicaciones_impresion_zonaId_idx" ON "ubicaciones_impresion"("zonaId");

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_impresion_impresionId_zonaId_key" ON "ubicaciones_impresion"("impresionId", "zonaId");

-- AddForeignKey
ALTER TABLE "zonas_mapa" ADD CONSTRAINT "zonas_mapa_estanciaId_fkey" FOREIGN KEY ("estanciaId") REFERENCES "estancias_mapa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicaciones_impresion" ADD CONSTRAINT "ubicaciones_impresion_impresionId_fkey" FOREIGN KEY ("impresionId") REFERENCES "impresiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicaciones_impresion" ADD CONSTRAINT "ubicaciones_impresion_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "zonas_mapa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
