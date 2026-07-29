import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Salidas.
 */
export const salidaRepository = {
  contar(where?: Prisma.SalidaWhereInput) {
    return prisma.salida.count({ where });
  },

  listar(params: {
    where?: Prisma.SalidaWhereInput;
    orderBy?: Prisma.SalidaOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    return prisma.salida.findMany({
      where: params.where,
      orderBy: params.orderBy ?? { fecha: "desc" },
      skip: params.skip,
      take: params.take,
      include: { proyecto: { select: { id: true, titulo: true } } },
    });
  },

  listarPorProyecto(proyectoId: string) {
    return prisma.salida.findMany({
      where: { proyectoId },
      orderBy: { fecha: "desc" },
    });
  },

  obtener(id: string) {
    return prisma.salida.findUnique({ where: { id } });
  },

  crear(data: Prisma.SalidaUncheckedCreateInput) {
    return prisma.salida.create({ data });
  },

  actualizar(id: string, data: Prisma.SalidaUpdateInput) {
    return prisma.salida.update({ where: { id }, data });
  },

  eliminar(id: string) {
    return prisma.salida.delete({ where: { id } });
  },

  agregados(where?: Prisma.SalidaWhereInput) {
    return prisma.salida.aggregate({
      where,
      _sum: { cantidad: true },
      _count: { _all: true },
    });
  },

  /** Salidas en un rango, con el proyecto (para reportes). */
  listarEnRango(desde: Date, hasta: Date) {
    return prisma.salida.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      include: { proyecto: { select: { id: true, titulo: true } } },
      orderBy: { fecha: "desc" },
    });
  },
};
