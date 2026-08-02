import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Recogidas.
 */
export const recogidaRepository = {
  contar(where?: Prisma.RecogidaWhereInput) {
    return prisma.recogida.count({ where });
  },

  listar(params: {
    where?: Prisma.RecogidaWhereInput;
    skip?: number;
    take?: number;
  }) {
    return prisma.recogida.findMany({
      where: params.where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
      include: { proyecto: { select: { id: true, titulo: true } } },
    });
  },

  obtener(id: string) {
    return prisma.recogida.findUnique({
      where: { id },
      include: { proyecto: { select: { id: true, titulo: true } } },
    });
  },

  crear(data: Prisma.RecogidaCreateInput) {
    return prisma.recogida.create({ data });
  },

  actualizar(id: string, data: Prisma.RecogidaUpdateInput) {
    return prisma.recogida.update({ where: { id }, data });
  },
};
