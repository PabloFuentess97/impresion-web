import type { EstadoIncidencia, Prisma } from "@prisma/client";
import { incidenciaRepository } from "@/repositories/incidencia.repository";
import { PAGINA_TAMANO } from "@/lib/constants";
import type { Incidencia, Paginado } from "@/types";
import type { IncidenciaInput } from "@/validators/incidencia.validator";
import { sanitizarHtml } from "@/lib/sanitize";

/**
 * Servicio de Incidencias.
 */
export const incidenciaService = {
  async listar(opciones: {
    busqueda?: string;
    estado?: EstadoIncidencia | "TODAS";
    pagina?: number;
  }): Promise<Paginado<Incidencia>> {
    const pagina = Math.max(1, opciones.pagina ?? 1);
    const busqueda = opciones.busqueda?.trim();

    const where: Prisma.IncidenciaWhereInput = {
      ...(busqueda
        ? { titulo: { contains: busqueda, mode: "insensitive" } }
        : {}),
      ...(opciones.estado && opciones.estado !== "TODAS"
        ? { estado: opciones.estado }
        : {}),
    };

    const [total, items] = await Promise.all([
      incidenciaRepository.contar(where),
      incidenciaRepository.listar({
        where,
        skip: (pagina - 1) * PAGINA_TAMANO,
        take: PAGINA_TAMANO,
      }),
    ]);

    return {
      items,
      total,
      pagina,
      totalPaginas: Math.max(1, Math.ceil(total / PAGINA_TAMANO)),
      tamano: PAGINA_TAMANO,
    };
  },

  obtener(id: string) {
    return incidenciaRepository.obtener(id);
  },

  /** Crea una incidencia sanitizando el HTML de la descripción. */
  crear(data: IncidenciaInput) {
    return incidenciaRepository.crear({
      titulo: data.titulo,
      descripcion: sanitizarHtml(data.descripcion),
      estado: data.estado,
    });
  },

  actualizar(id: string, data: IncidenciaInput) {
    return incidenciaRepository.actualizar(id, {
      titulo: data.titulo,
      descripcion: sanitizarHtml(data.descripcion),
      estado: data.estado,
    });
  },

  eliminar(id: string) {
    return incidenciaRepository.eliminar(id);
  },
};
