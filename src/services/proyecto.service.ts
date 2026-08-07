import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { proyectoRepository } from "@/repositories/proyecto.repository";
import { normalizarTamanoPagina } from "@/lib/constants";
import { sanitizarHtml } from "@/lib/sanitize";
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
  | "tiempo"
  | "prioridad"
  | "entrega";

/**
 * Servicio de Proyectos. Contiene la lógica de negocio: cálculo de métricas,
 * paginación, búsqueda y ordenación.
 */
export const proyectoService = {
  /** Lista proyectos con búsqueda, ordenación y paginación. */
  async listar(opciones: {
    busqueda?: string;
    pagina?: number;
    tamano?: number;
    orden?: OrdenProyecto;
  }): Promise<Paginado<ProyectoConMetricas>> {
    const pagina = Math.max(1, opciones.pagina ?? 1);
    const tamano = normalizarTamanoPagina(opciones.tamano);
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
          : opciones.orden === "entrega"
            ? { fechaEntrega: { sort: "asc", nulls: "last" } }
          : { createdAt: "desc" };

    const total = await proyectoRepository.contar(where);

    // Cuando se ordena por métricas, traemos todo el conjunto filtrado y
    // ordenamos/paginamos en memoria.
    const ordenPorMetrica =
      opciones.orden === "impresiones" ||
      opciones.orden === "tiempo" ||
      opciones.orden === "prioridad";

    const registros = await proyectoRepository.listar({
      where,
      orderBy: ordenBd,
      skip: ordenPorMetrica ? undefined : (pagina - 1) * tamano,
      take: ordenPorMetrica ? undefined : tamano,
    });

    let items: ProyectoConMetricas[] = registros.map((p) =>
      this.calcularMetricas(p),
    );

    if (opciones.orden === "impresiones" || opciones.orden === "tiempo") {
      items.sort((a, b) =>
        opciones.orden === "impresiones"
          ? b.totalImpresiones - a.totalImpresiones
          : b.tiempoTotal - a.tiempoTotal,
      );
    }

    if (opciones.orden === "prioridad") {
      const peso = { URGENTE: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };
      items.sort((a, b) => peso[b.prioridad] - peso[a.prioridad]);
    }

    if (ordenPorMetrica) {
      items = items.slice((pagina - 1) * tamano, pagina * tamano);
    }

    return {
      items,
      total,
      pagina,
      totalPaginas: Math.max(1, Math.ceil(total / tamano)),
      tamano,
    };
  },

  /** Calcula métricas agregadas de un proyecto a partir de impresiones y salidas. */
  calcularMetricas(proyecto: {
    id: string;
    titulo: string;
    descripcion: string | null;
    rutaImpresion: string | null;
    cantidadProduccion: number | null;
    notas: string | null;
    estado: ProyectoConMetricas["estado"];
    prioridad: ProyectoConMetricas["prioridad"];
    fechaInicio: Date | null;
    fechaEntrega: Date | null;
    bloqueado: boolean;
    createdAt: Date;
    updatedAt: Date;
    impresiones: { cantidad: number; tiempo: number }[];
    salidas: { cantidad: number }[];
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
    const totalSalidas = proyecto.salidas.length;
    const cantidadSalidas = proyecto.salidas.reduce(
      (acc, s) => acc + s.cantidad,
      0,
    );
    const unidadesRestantes =
      proyecto.cantidadProduccion == null
        ? null
        : Math.max(0, proyecto.cantidadProduccion - cantidadSalidas);

    return {
      id: proyecto.id,
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion,
      rutaImpresion: proyecto.rutaImpresion,
      cantidadProduccion: proyecto.cantidadProduccion,
      notas: proyecto.notas,
      estado: proyecto.estado,
      prioridad: proyecto.prioridad,
      fechaInicio: proyecto.fechaInicio,
      fechaEntrega: proyecto.fechaEntrega,
      bloqueado: proyecto.bloqueado,
      createdAt: proyecto.createdAt,
      updatedAt: proyecto.updatedAt,
      totalImpresiones,
      cantidadTotal,
      tiempoTotal,
      totalSalidas,
      cantidadSalidas,
      unidadesRestantes,
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
    const totalSalidas = proyecto.salidas.length;
    const cantidadSalidas = proyecto.salidas.reduce(
      (acc, s) => acc + s.cantidad,
      0,
    );
    const unidadesRestantes =
      proyecto.cantidadProduccion == null
        ? null
        : Math.max(0, proyecto.cantidadProduccion - cantidadSalidas);
    const { salidas, ...proyectoBase } = proyecto;
    void salidas;

    return {
      ...proyectoBase,
      totalImpresiones: proyecto.impresiones.length,
      cantidadTotal,
      tiempoTotal,
      totalSalidas,
      cantidadSalidas,
      unidadesRestantes,
    };
  },

  crear(data: ProyectoInput) {
    return proyectoRepository.crear({
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      rutaImpresion: data.rutaImpresion || null,
      cantidadProduccion: data.cantidadProduccion ?? null,
      estado: data.estado,
      prioridad: data.prioridad,
      fechaInicio: data.fechaInicio ?? null,
      fechaEntrega: data.fechaEntrega ?? null,
    });
  },

  actualizar(id: string, data: ProyectoInput) {
    return proyectoRepository.actualizar(id, {
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      rutaImpresion: data.rutaImpresion || null,
      cantidadProduccion: data.cantidadProduccion ?? null,
      estado: data.estado,
      prioridad: data.prioridad,
      fechaInicio: data.fechaInicio ?? null,
      fechaEntrega: data.fechaEntrega ?? null,
    });
  },

  /** Guarda las notas enriquecidas (HTML) del proyecto, ya sanitizadas. */
  guardarNotas(id: string, notas: string) {
    const limpio = sanitizarHtml(notas);
    return proyectoRepository.actualizar(id, { notas: limpio || null });
  },

  /** Bloquea o desbloquea un proyecto. */
  alternarBloqueo(id: string, bloqueado: boolean) {
    return proyectoRepository.actualizar(id, { bloqueado });
  },

  /** Indica si un proyecto está bloqueado (protegido contra cambios). */
  async estaBloqueado(id: string): Promise<boolean> {
    const proyecto = await proyectoRepository.obtener(id);
    return Boolean(proyecto?.bloqueado);
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

  listarPlanificados() {
    return prisma.proyecto.findMany({
      where: {
        OR: [{ fechaInicio: { not: null } }, { fechaEntrega: { not: null } }],
      },
      orderBy: [
        { fechaInicio: "asc" },
        { fechaEntrega: "asc" },
        { prioridad: "desc" },
      ],
    });
  },
};
