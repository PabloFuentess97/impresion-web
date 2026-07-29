import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Repositorio de Papel y sus lecturas.
 */
export const papelRepository = {
  listar() {
    return prisma.papel.findMany({ orderBy: { orden: "asc" } });
  },

  contar() {
    return prisma.papel.count();
  },

  obtener(id: string) {
    return prisma.papel.findUnique({ where: { id } });
  },

  crear(data: Prisma.PapelCreateInput) {
    return prisma.papel.create({ data });
  },

  actualizar(id: string, data: Prisma.PapelUpdateInput) {
    return prisma.papel.update({ where: { id }, data });
  },

  eliminar(id: string) {
    return prisma.papel.delete({ where: { id } });
  },

  /** Registra una lectura histórica del número de rollos. */
  crearLectura(papelId: string, rollos: number) {
    return prisma.lecturaPapel.create({ data: { papelId, rollos } });
  },

  lecturaHasta(papelId: string, hasta: Date) {
    return prisma.lecturaPapel.findFirst({
      where: { papelId, fecha: { lte: hasta } },
      orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
    });
  },

  lecturaAntesDe(papelId: string, fecha: Date) {
    return prisma.lecturaPapel.findFirst({
      where: { papelId, fecha: { lt: fecha } },
      orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
    });
  },

  primeraLecturaDesde(papelId: string, desde: Date) {
    return prisma.lecturaPapel.findFirst({
      where: { papelId, fecha: { gte: desde } },
      orderBy: [{ fecha: "asc" }, { createdAt: "asc" }],
    });
  },
};
