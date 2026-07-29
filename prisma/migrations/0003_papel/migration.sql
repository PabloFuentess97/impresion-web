-- CreateTable
CREATE TABLE "papel" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT 'Papel',
    "rollos" INTEGER NOT NULL DEFAULT 0,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "papel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturas_papel" (
    "id" TEXT NOT NULL,
    "rollos" INTEGER NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "papelId" TEXT NOT NULL,

    CONSTRAINT "lecturas_papel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "papel_orden_idx" ON "papel"("orden");

-- CreateIndex
CREATE INDEX "lecturas_papel_papelId_idx" ON "lecturas_papel"("papelId");

-- CreateIndex
CREATE INDEX "lecturas_papel_fecha_idx" ON "lecturas_papel"("fecha");

-- AddForeignKey
ALTER TABLE "lecturas_papel" ADD CONSTRAINT "lecturas_papel_papelId_fkey" FOREIGN KEY ("papelId") REFERENCES "papel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
