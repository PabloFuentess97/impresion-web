import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Configuración (registro único).
 */
export const configuracionRepository = {
  /** Obtiene la configuración; la crea con valores por defecto si no existe. */
  async obtenerOCrear() {
    const existente = await prisma.configuracion.findFirst();
    if (existente) return existente;
    return prisma.configuracion.create({
      data: { nombreEmpresa: "ImpresiónWeb", tema: "system" },
    });
  },

  async actualizar(data: Prisma.ConfiguracionUpdateInput) {
    const existente = await prisma.configuracion.findFirst();
    if (!existente) {
      return prisma.configuracion.create({
        data: {
          nombreEmpresa: (data.nombreEmpresa as string) ?? "ImpresiónWeb",
          tema: (data.tema as string) ?? "system",
          logoUrl: (data.logoUrl as string) ?? null,
        },
      });
    }
    return prisma.configuracion.update({
      where: { id: existente.id },
      data,
    });
  },
};
