import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Incidencias.
 */
export const incidenciaRepository = {
  contar(where?: Prisma.IncidenciaWhereInput) {
    return prisma.incidencia.count({ where });
  },

  listar(params: {
    where?: Prisma.IncidenciaWhereInput;
    orderBy?: Prisma.IncidenciaOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    return prisma.incidencia.findMany({
      where: params.where,
      orderBy: params.orderBy ?? { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });
  },

  obtener(id: string) {
    return prisma.incidencia.findUnique({ where: { id } });
  },

  crear(data: Prisma.IncidenciaCreateInput) {
    return prisma.incidencia.create({ data });
  },

  actualizar(id: string, data: Prisma.IncidenciaUpdateInput) {
    return prisma.incidencia.update({ where: { id }, data });
  },

  eliminar(id: string) {
    return prisma.incidencia.delete({ where: { id } });
  },

  /** Agrupa incidencias por estado (para el dashboard). */
  agruparPorEstado() {
    return prisma.incidencia.groupBy({
      by: ["estado"],
      _count: { _all: true },
    });
  },

  /** Incidencias creadas dentro de un rango (para reportes). */
  listarEnRango(desde: Date, hasta: Date) {
    return prisma.incidencia.findMany({
      where: { createdAt: { gte: desde, lte: hasta } },
      orderBy: { createdAt: "desc" },
    });
  },
};
