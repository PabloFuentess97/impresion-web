import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Repositorio del historial de auditoria. */
export const auditoriaRepository = {
  contar(where?: Prisma.AuditoriaWhereInput) {
    return prisma.auditoria.count({ where });
  },

  listar(params: {
    where?: Prisma.AuditoriaWhereInput;
    skip?: number;
    take?: number;
  }) {
    return prisma.auditoria.findMany({
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: "desc" },
    });
  },

  crear(data: Prisma.AuditoriaCreateInput) {
    return prisma.auditoria.create({ data });
  },
};
