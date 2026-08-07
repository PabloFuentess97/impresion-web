import type {
  EstadoProyecto,
  PrioridadProyecto,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ReporteProyectoResumen {
  id: string;
  titulo: string;
  descripcion: string | null;
  rutaImpresion: string | null;
  estado: EstadoProyecto;
  prioridad: PrioridadProyecto;
  cantidadProduccion: number | null;
  fechaInicio: Date | null;
  fechaEntrega: Date | null;
  createdAt: Date;
  totalImpresiones: number;
  cantidadImpresa: number;
  tiempoTotal: number;
  totalSalidas: number;
  cantidadSalidas: number;
  unidadesRestantes: number | null;
}

export interface ReporteProyectoImpresion {
  id: string;
  proyectoId: string;
  proyecto: string;
  nombre: string;
  cantidad: number;
  tiempo: number;
  fecha: Date;
}

export interface ReporteProyectoSalida {
  id: string;
  proyectoId: string;
  proyecto: string;
  destino: string;
  cantidad: number;
  nota: string | null;
  fecha: Date;
}

export interface ReporteProyectosCompleto {
  generadoEl: Date;
  resumen: {
    totalProyectos: number;
    totalImpresiones: number;
    cantidadImpresaTotal: number;
    tiempoTotal: number;
    totalSalidas: number;
    cantidadSalidasTotal: number;
    unidadesRestantesTotal: number;
  };
  proyectos: ReporteProyectoResumen[];
  impresiones: ReporteProyectoImpresion[];
  salidas: ReporteProyectoSalida[];
}

/**
 * Genera un reporte global de proyectos sin filtros de periodo.
 * Incluye métricas por proyecto, todas sus impresiones y todas sus salidas.
 */
export const proyectoReporteService = {
  async generar(): Promise<ReporteProyectosCompleto> {
    const proyectos = await prisma.proyecto.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        impresiones: { orderBy: { fecha: "desc" } },
        salidas: { orderBy: { fecha: "desc" } },
      },
    });

    const resumenes: ReporteProyectoResumen[] = [];
    const impresiones: ReporteProyectoImpresion[] = [];
    const salidas: ReporteProyectoSalida[] = [];

    for (const proyecto of proyectos) {
      const cantidadImpresa = proyecto.impresiones.reduce(
        (acc, impresion) => acc + impresion.cantidad,
        0,
      );
      const tiempoTotal = proyecto.impresiones.reduce(
        (acc, impresion) => acc + impresion.tiempo,
        0,
      );
      const cantidadSalidas = proyecto.salidas.reduce(
        (acc, salida) => acc + salida.cantidad,
        0,
      );
      const cantidadBase = proyecto.cantidadProduccion ?? cantidadImpresa;
      const unidadesRestantes = Math.max(0, cantidadBase - cantidadSalidas);

      resumenes.push({
        id: proyecto.id,
        titulo: proyecto.titulo,
        descripcion: proyecto.descripcion,
        rutaImpresion: proyecto.rutaImpresion,
        estado: proyecto.estado,
        prioridad: proyecto.prioridad,
        cantidadProduccion: proyecto.cantidadProduccion,
        fechaInicio: proyecto.fechaInicio,
        fechaEntrega: proyecto.fechaEntrega,
        createdAt: proyecto.createdAt,
        totalImpresiones: proyecto.impresiones.length,
        cantidadImpresa,
        tiempoTotal,
        totalSalidas: proyecto.salidas.length,
        cantidadSalidas,
        unidadesRestantes,
      });

      impresiones.push(
        ...proyecto.impresiones.map((impresion) => ({
          id: impresion.id,
          proyectoId: proyecto.id,
          proyecto: proyecto.titulo,
          nombre: impresion.nombre,
          cantidad: impresion.cantidad,
          tiempo: impresion.tiempo,
          fecha: impresion.fecha,
        })),
      );

      salidas.push(
        ...proyecto.salidas.map((salida) => ({
          id: salida.id,
          proyectoId: proyecto.id,
          proyecto: proyecto.titulo,
          destino: salida.destino,
          cantidad: salida.cantidad,
          nota: salida.nota,
          fecha: salida.fecha,
        })),
      );
    }

    return {
      generadoEl: new Date(),
      resumen: {
        totalProyectos: resumenes.length,
        totalImpresiones: resumenes.reduce(
          (acc, proyecto) => acc + proyecto.totalImpresiones,
          0,
        ),
        cantidadImpresaTotal: resumenes.reduce(
          (acc, proyecto) => acc + proyecto.cantidadImpresa,
          0,
        ),
        tiempoTotal: resumenes.reduce(
          (acc, proyecto) => acc + proyecto.tiempoTotal,
          0,
        ),
        totalSalidas: resumenes.reduce(
          (acc, proyecto) => acc + proyecto.totalSalidas,
          0,
        ),
        cantidadSalidasTotal: resumenes.reduce(
          (acc, proyecto) => acc + proyecto.cantidadSalidas,
          0,
        ),
        unidadesRestantesTotal: resumenes.reduce(
          (acc, proyecto) => acc + (proyecto.unidadesRestantes ?? 0),
          0,
        ),
      },
      proyectos: resumenes,
      impresiones,
      salidas,
    };
  },
};
