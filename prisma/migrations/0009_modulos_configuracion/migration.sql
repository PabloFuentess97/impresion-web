-- CreateTable
CREATE TABLE "modulos_configuracion" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modulos_configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modulos_configuracion_clave_key" ON "modulos_configuracion"("clave");

-- CreateIndex
CREATE INDEX "modulos_configuracion_activo_idx" ON "modulos_configuracion"("activo");

-- Seed default modules. Configuracion and users are intentionally not toggleable.
INSERT INTO "modulos_configuracion" ("id", "clave", "activo", "createdAt", "updatedAt") VALUES
('mod_dashboard', 'dashboard', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_proyectos', 'proyectos', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_salidas', 'salidas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_recogidas', 'recogidas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_mapa', 'mapa', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_inventario', 'inventario', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_tintas', 'tintas', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_incidencias', 'incidencias', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_reportes', 'reportes', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mod_base_conocimiento', 'base-conocimiento', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("clave") DO NOTHING;
