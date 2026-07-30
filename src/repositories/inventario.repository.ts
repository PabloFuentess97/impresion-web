import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Inventario.
 * Encapsula el acceso a la base de datos de los artículos de inventario.
 */
export const inventarioRepository = {
  contar(where?: Prisma.InventarioWhereInput) {
    return prisma.inventario.count({ where });
  },

  listar(params: {
    where?: Prisma.InventarioWhereInput;
    orderBy?: Prisma.InventarioOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    return prisma.inventario.findMany({
      where: params.where,
      orderBy: params.orderBy ?? { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });
  },

  obtener(id: string) {
    return prisma.inventario.findUnique({ where: { id } });
  },

  crear(data: Prisma.InventarioCreateInput) {
    return prisma.inventario.create({ data });
  },

  actualizar(id: string, data: Prisma.InventarioUpdateInput) {
    return prisma.inventario.update({ where: { id }, data });
  },

  eliminar(id: string) {
    return prisma.inventario.delete({ where: { id } });
  },
};
