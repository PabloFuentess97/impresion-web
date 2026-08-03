import type { Prisma } from "@prisma/client";
import { salidaRepository } from "@/repositories/salida.repository";
import { normalizarTamanoPagina } from "@/lib/constants";
import type { Paginado } from "@/types";
import type { SalidaInput } from "@/validators/salida.validator";

export interface SalidaConProyecto {
  id: string;
  cantidad: number;
  destino: string;
  nota: string | null;
  fecha: Date;
  proyectoId: string;
  proyecto: { id: string; titulo: string };
}

/**
 * Servicio de Salidas.
 */
export const salidaService = {
  async listar(opciones: {
    busqueda?: string;
    proyectoId?: string;
    pagina?: number;
    tamano?: number;
  }): Promise<Paginado<SalidaConProyecto>> {
    const pagina = Math.max(1, opciones.pagina ?? 1);
    const tamano = normalizarTamanoPagina(opciones.tamano);
    const busqueda = opciones.busqueda?.trim();

    const where: Prisma.SalidaWhereInput = {
      ...(busqueda
        ? {
            OR: [
              { destino: { contains: busqueda, mode: "insensitive" } },
              { proyecto: { titulo: { contains: busqueda, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(opciones.proyectoId ? { proyectoId: opciones.proyectoId } : {}),
    };

    const [total, registros] = await Promise.all([
      salidaRepository.contar(where),
      salidaRepository.listar({
        where,
        skip: (pagina - 1) * tamano,
        take: tamano,
      }),
    ]);

    return {
      items: registros as SalidaConProyecto[],
      total,
      pagina,
      totalPaginas: Math.max(1, Math.ceil(total / tamano)),
      tamano,
    };
  },

  listarPorProyecto(proyectoId: string) {
    return salidaRepository.listarPorProyecto(proyectoId);
  },

  obtener(id: string) {
    return salidaRepository.obtener(id);
  },

  crear(data: SalidaInput) {
    return salidaRepository.crear({
      proyectoId: data.proyectoId,
      cantidad: data.cantidad,
      destino: data.destino,
      nota: data.nota || null,
    });
  },

  actualizar(id: string, data: Omit<SalidaInput, "proyectoId">) {
    return salidaRepository.actualizar(id, {
      cantidad: data.cantidad,
      destino: data.destino,
      nota: data.nota || null,
    });
  },

  eliminar(id: string) {
    return salidaRepository.eliminar(id);
  },
};
