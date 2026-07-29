import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Tintas y sus lecturas.
 */
export const tintaRepository = {
  listar() {
    return prisma.tinta.findMany({ orderBy: { orden: "asc" } });
  },

  contar() {
    return prisma.tinta.count();
  },

  obtener(id: string) {
    return prisma.tinta.findUnique({ where: { id } });
  },

  crear(data: Prisma.TintaCreateInput) {
    return prisma.tinta.create({ data });
  },

  crearVarias(data: Prisma.TintaCreateManyInput[]) {
    return prisma.tinta.createMany({ data });
  },

  actualizar(id: string, data: Prisma.TintaUpdateInput) {
    return prisma.tinta.update({ where: { id }, data });
  },

  eliminarDesdeOrden(ordenMinimo: number) {
    return prisma.tinta.deleteMany({ where: { orden: { gte: ordenMinimo } } });
  },

  /** Registra una lectura histórica del porcentaje. */
  crearLectura(tintaId: string, porcentaje: number) {
    return prisma.lecturaTinta.create({ data: { tintaId, porcentaje } });
  },

  /** Última lectura de una tinta con fecha <= referencia. */
  lecturaHasta(tintaId: string, hasta: Date) {
    return prisma.lecturaTinta.findFirst({
      where: { tintaId, fecha: { lte: hasta } },
      orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
    });
  },

  /** Última lectura de una tinta estrictamente anterior a una fecha. */
  lecturaAntesDe(tintaId: string, fecha: Date) {
    return prisma.lecturaTinta.findFirst({
      where: { tintaId, fecha: { lt: fecha } },
      orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
    });
  },

  /** Primera lectura de una tinta con fecha >= referencia. */
  primeraLecturaDesde(tintaId: string, desde: Date) {
    return prisma.lecturaTinta.findFirst({
      where: { tintaId, fecha: { gte: desde } },
      orderBy: [{ fecha: "asc" }, { createdAt: "asc" }],
    });
  },
};
