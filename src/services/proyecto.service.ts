import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { proyectoRepository } from "@/repositories/proyecto.repository";
import { PAGINA_TAMANO } from "@/lib/constants";
import type {
  Paginado,
  ProyectoConMetricas,
  ProyectoDetalle,
} from "@/types";
import type { ProyectoInput } from "@/validators/proyecto.validator";

export type OrdenProyecto =
  | "reciente"
  | "antiguo"
  | "titulo"
  | "impresiones"
  | "tiempo";

/**
 * Servicio de Proyectos. Contiene la lógica de negocio: cálculo de métricas,
 * paginación, búsqueda y ordenación.
 */
export const proyectoService = {
  /** Lista proyectos con búsqueda, ordenación y paginación. */
  async listar(opciones: {
    busqueda?: string;
    pagina?: number;
    orden?: OrdenProyecto;
  }): Promise<Paginado<ProyectoConMetricas>> {
    const pagina = Math.max(1, opciones.pagina ?? 1);
    const busqueda = opciones.busqueda?.trim();

    const where: Prisma.ProyectoWhereInput = busqueda
      ? {
          OR: [
            { titulo: { contains: busqueda, mode: "insensitive" } },
            { descripcion: { contains: busqueda, mode: "insensitive" } },
          ],
        }
      : {};

    // La ordenación por métricas agregadas se resuelve en memoria porque
    // dependen de las impresiones relacionadas.
    const ordenBd: Prisma.ProyectoOrderByWithRelationInput =
      opciones.orden === "antiguo"
        ? { createdAt: "asc" }
        : opciones.orden === "titulo"
          ? { titulo: "asc" }
          : { createdAt: "desc" };

    const total = await proyectoRepository.contar(where);

    // Cuando se ordena por métricas, traemos todo el conjunto filtrado y
    // ordenamos/paginamos en memoria.
    const ordenPorMetrica =
      opciones.orden === "impresiones" || opciones.orden === "tiempo";

    const registros = await proyectoRepository.listar({
      where,
      orderBy: ordenBd,
      skip: ordenPorMetrica ? undefined : (pagina - 1) * PAGINA_TAMANO,
      take: ordenPorMetrica ? undefined : PAGINA_TAMANO,
    });

    let items: ProyectoConMetricas[] = registros.map((p) =>
      this.calcularMetricas(p),
    );

    if (ordenPorMetrica) {
      items.sort((a, b) =>
        opciones.orden === "impresiones"
          ? b.totalImpresiones - a.totalImpresiones
          : b.tiempoTotal - a.tiempoTotal,
      );
      items = items.slice((pagina - 1) * PAGINA_TAMANO, pagina * PAGINA_TAMANO);
    }

    return {
      items,
      total,
      pagina,
      totalPaginas: Math.max(1, Math.ceil(total / PAGINA_TAMANO)),
      tamano: PAGINA_TAMANO,
    };
  },

  /** Calcula métricas agregadas de un proyecto a partir de sus impresiones. */
  calcularMetricas(proyecto: {
    id: string;
    titulo: string;
    descripcion: string | null;
    rutaImpresion: string | null;
    bloqueado: boolean;
    createdAt: Date;
    updatedAt: Date;
    impresiones: { cantidad: number; tiempo: number }[];
  }): ProyectoConMetricas {
    const totalImpresiones = proyecto.impresiones.length;
    const cantidadTotal = proyecto.impresiones.reduce(
      (acc, i) => acc + i.cantidad,
      0,
    );
    const tiempoTotal = proyecto.impresiones.reduce(
      (acc, i) => acc + i.tiempo,
      0,
    );
    return {
      id: proyecto.id,
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion,
      rutaImpresion: proyecto.rutaImpresion,
      bloqueado: proyecto.bloqueado,
      createdAt: proyecto.createdAt,
      updatedAt: proyecto.updatedAt,
      totalImpresiones,
      cantidadTotal,
      tiempoTotal,
    };
  },

  /** Obtiene el detalle completo de un proyecto con sus impresiones. */
  async obtenerDetalle(id: string): Promise<ProyectoDetalle | null> {
    const proyecto = await proyectoRepository.obtenerConImpresiones(id);
    if (!proyecto) return null;

    const cantidadTotal = proyecto.impresiones.reduce(
      (acc, i) => acc + i.cantidad,
      0,
    );
    const tiempoTotal = proyecto.impresiones.reduce(
      (acc, i) => acc + i.tiempo,
      0,
    );

    return {
      ...proyecto,
      totalImpresiones: proyecto.impresiones.length,
      cantidadTotal,
      tiempoTotal,
    };
  },

  crear(data: ProyectoInput) {
    return proyectoRepository.crear({
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      rutaImpresion: data.rutaImpresion || null,
    });
  },

  actualizar(id: string, data: ProyectoInput) {
    return proyectoRepository.actualizar(id, {
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      rutaImpresion: data.rutaImpresion || null,
    });
  },

  /** Bloquea o desbloquea un proyecto. */
  alternarBloqueo(id: string, bloqueado: boolean) {
    return proyectoRepository.actualizar(id, { bloqueado });
  },

  eliminar(id: string) {
    return proyectoRepository.eliminar(id);
  },

  obtener(id: string) {
    return proyectoRepository.obtener(id);
  },

  /** Lista ligera de proyectos (id y título) para selectores. */
  listarSimple() {
    return prisma.proyecto.findMany({
      select: { id: true, titulo: true },
      orderBy: { titulo: "asc" },
    });
  },
};
