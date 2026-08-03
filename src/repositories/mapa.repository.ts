import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Repositorio del mapa visual de almacenaje. */
export const mapaRepository = {
  listarEstancias() {
    return prisma.estanciaMapa.findMany({
      orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
      include: {
        zonas: {
          orderBy: { createdAt: "asc" },
          include: {
            ubicaciones: {
              orderBy: { createdAt: "desc" },
              include: {
                impresion: {
                  include: { proyecto: { select: { id: true, titulo: true } } },
                },
              },
            },
          },
        },
      },
    });
  },

  contarEstancias() {
    return prisma.estanciaMapa.count();
  },

  obtenerEstancia(id: string) {
    return prisma.estanciaMapa.findUnique({ where: { id } });
  },

  crearEstancia(data: Prisma.EstanciaMapaCreateInput) {
    return prisma.estanciaMapa.create({ data });
  },

  actualizarEstancia(id: string, data: Prisma.EstanciaMapaUpdateInput) {
    return prisma.estanciaMapa.update({ where: { id }, data });
  },

  eliminarEstancia(id: string) {
    return prisma.estanciaMapa.delete({ where: { id } });
  },

  crearZona(data: Prisma.ZonaMapaCreateInput) {
    return prisma.zonaMapa.create({ data });
  },

  obtenerZona(id: string) {
    return prisma.zonaMapa.findUnique({ where: { id } });
  },

  actualizarZona(id: string, data: Prisma.ZonaMapaUpdateInput) {
    return prisma.zonaMapa.update({ where: { id }, data });
  },

  eliminarZona(id: string) {
    return prisma.zonaMapa.delete({ where: { id } });
  },

  listarImpresiones() {
    return prisma.impresion.findMany({
      orderBy: [{ fecha: "desc" }, { createdAt: "desc" }],
      include: {
        proyecto: { select: { id: true, titulo: true } },
        ubicaciones: {
          include: { zona: { select: { id: true, nombre: true, estanciaId: true } } },
        },
      },
    });
  },

  crearUbicacion(data: Prisma.UbicacionImpresionCreateInput) {
    return prisma.ubicacionImpresion.create({ data });
  },

  actualizarUbicacion(id: string, data: Prisma.UbicacionImpresionUpdateInput) {
    return prisma.ubicacionImpresion.update({ where: { id }, data });
  },

  eliminarUbicacion(id: string) {
    return prisma.ubicacionImpresion.delete({ where: { id } });
  },
};
