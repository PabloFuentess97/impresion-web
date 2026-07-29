import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Proyectos.
 * Encapsula todo el acceso a la base de datos relacionado con proyectos.
 */
export const proyectoRepository = {
  /** Cuenta proyectos que coincidan con un filtro opcional de búsqueda. */
  contar(where?: Prisma.ProyectoWhereInput) {
    return prisma.proyecto.count({ where });
  },

  /** Lista proyectos paginados con sus impresiones (para métricas). */
  listar(params: {
    where?: Prisma.ProyectoWhereInput;
    orderBy?: Prisma.ProyectoOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }) {
    return prisma.proyecto.findMany({
      where: params.where,
      orderBy: params.orderBy ?? { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
      include: {
        impresiones: {
          select: { id: true, cantidad: true, tiempo: true },
        },
      },
    });
  },

  /** Obtiene un proyecto por id con todas sus impresiones. */
  obtenerConImpresiones(id: string) {
    return prisma.proyecto.findUnique({
      where: { id },
      include: {
        impresiones: { orderBy: { fecha: "desc" } },
      },
    });
  },

  /** Obtiene un proyecto por id (sin relaciones). */
  obtener(id: string) {
    return prisma.proyecto.findUnique({ where: { id } });
  },

  crear(data: Prisma.ProyectoCreateInput) {
    return prisma.proyecto.create({ data });
  },

  actualizar(id: string, data: Prisma.ProyectoUpdateInput) {
    return prisma.proyecto.update({ where: { id }, data });
  },

  eliminar(id: string) {
    return prisma.proyecto.delete({ where: { id } });
  },

  /** Proyectos con actividad (impresiones creadas) dentro de un rango. */
  conActividadEnRango(desde: Date, hasta: Date) {
    return prisma.proyecto.findMany({
      where: {
        OR: [
          { updatedAt: { gte: desde, lte: hasta } },
          { impresiones: { some: { fecha: { gte: desde, lte: hasta } } } },
        ],
      },
      include: {
        impresiones: {
          where: { fecha: { gte: desde, lte: hasta } },
          select: { id: true, cantidad: true, tiempo: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  },
};
