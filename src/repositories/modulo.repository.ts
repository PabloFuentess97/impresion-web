import { prisma } from "@/lib/prisma";
import { MODULOS_ACTIVABLES, type ClaveModulo } from "@/lib/modules";

/** Repositorio de configuracion de modulos activables. */
export const moduloRepository = {
  async asegurarDefaults() {
    await prisma.moduloConfiguracion.createMany({
      data: MODULOS_ACTIVABLES.map((modulo) => ({
        clave: modulo.clave,
        activo: true,
      })),
      skipDuplicates: true,
    });
  },

  async listar() {
    await this.asegurarDefaults();
    return prisma.moduloConfiguracion.findMany({
      orderBy: { createdAt: "asc" },
    });
  },

  async obtener(clave: ClaveModulo) {
    await this.asegurarDefaults();
    return prisma.moduloConfiguracion.findUnique({ where: { clave } });
  },

  async actualizar(clave: ClaveModulo, activo: boolean) {
    return prisma.moduloConfiguracion.upsert({
      where: { clave },
      create: { clave, activo },
      update: { activo },
    });
  },
};
