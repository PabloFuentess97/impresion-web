import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Impresiones.
 */
export const impresionRepository = {
  obtener(id: string) {
    return prisma.impresion.findUnique({ where: { id } });
  },

  crear(data: Prisma.ImpresionUncheckedCreateInput) {
    return prisma.impresion.create({ data });
  },

  actualizar(id: string, data: Prisma.ImpresionUpdateInput) {
    return prisma.impresion.update({ where: { id }, data });
  },

  eliminar(id: string) {
    return prisma.impresion.delete({ where: { id } });
  },

  contar(where?: Prisma.ImpresionWhereInput) {
    return prisma.impresion.count({ where });
  },

  /** Suma de cantidad y tiempo con un filtro opcional. */
  agregados(where?: Prisma.ImpresionWhereInput) {
    return prisma.impresion.aggregate({
      where,
      _sum: { cantidad: true, tiempo: true },
      _count: { _all: true },
    });
  },

  /** Impresiones en un rango, incluyendo el proyecto (para reportes). */
  listarEnRango(desde: Date, hasta: Date) {
    return prisma.impresion.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      include: { proyecto: { select: { id: true, titulo: true } } },
      orderBy: { fecha: "desc" },
    });
  },

  /** Impresiones agrupadas por fecha (para gráficos de actividad). */
  listarDesde(desde: Date) {
    return prisma.impresion.findMany({
      where: { fecha: { gte: desde } },
      select: { fecha: true, cantidad: true, tiempo: true },
      orderBy: { fecha: "asc" },
    });
  },
};
