import { proyectoRepository } from "@/repositories/proyecto.repository";
import { impresionRepository } from "@/repositories/impresion.repository";
import { incidenciaRepository } from "@/repositories/incidencia.repository";
import { tintaService, type ConsumoTinta } from "@/services/tinta.service";
import { calcularRango } from "@/lib/dates";
import type { PeriodoReporte } from "@/lib/constants";
import type { EstadoIncidencia } from "@prisma/client";

export interface ReporteProyecto {
  id: string;
  titulo: string;
  totalImpresiones: number;
  cantidadTotal: number;
  tiempoTotal: number;
}

export interface ReporteImpresion {
  id: string;
  proyecto: string;
  impresion: string;
  cantidad: number;
  tiempo: number;
  fecha: Date;
}

export interface ReporteIncidencia {
  id: string;
  titulo: string;
  estado: EstadoIncidencia;
  fecha: Date;
  descripcion: string;
}

export interface ReporteCompleto {
  periodo: PeriodoReporte;
  desde: Date;
  hasta: Date;
  proyectos: ReporteProyecto[];
  impresiones: ReporteImpresion[];
  incidencias: ReporteIncidencia[];
  tintas: ConsumoTinta[];
  resumen: {
    totalProyectos: number;
    totalImpresiones: number;
    cantidadTotal: number;
    tiempoTotal: number;
    totalIncidencias: number;
    tintaGastadaTotal: number;
  };
}

/**
 * Servicio de Reportes. Genera el conjunto de datos para un período concreto.
 */
export const reporteService = {
  async generar(
    periodo: PeriodoReporte,
    desdeStr?: string,
    hastaStr?: string,
  ): Promise<ReporteCompleto> {
    const { desde, hasta } = calcularRango(periodo, desdeStr, hastaStr);

    const [proyectosRaw, impresionesRaw, incidenciasRaw, tintas] =
      await Promise.all([
        proyectoRepository.conActividadEnRango(desde, hasta),
        impresionRepository.listarEnRango(desde, hasta),
        incidenciaRepository.listarEnRango(desde, hasta),
        tintaService.consumoEnRango(desde, hasta),
      ]);

    const proyectos: ReporteProyecto[] = proyectosRaw.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      totalImpresiones: p.impresiones.length,
      cantidadTotal: p.impresiones.reduce((a, i) => a + i.cantidad, 0),
      tiempoTotal: p.impresiones.reduce((a, i) => a + i.tiempo, 0),
    }));

    const impresiones: ReporteImpresion[] = impresionesRaw.map((i) => ({
      id: i.id,
      proyecto: i.proyecto.titulo,
      impresion: i.nombre,
      cantidad: i.cantidad,
      tiempo: i.tiempo,
      fecha: i.fecha,
    }));

    const incidencias: ReporteIncidencia[] = incidenciasRaw.map((i) => ({
      id: i.id,
      titulo: i.titulo,
      estado: i.estado,
      fecha: i.createdAt,
      descripcion: i.descripcion,
    }));

    return {
      periodo,
      desde,
      hasta,
      proyectos,
      impresiones,
      incidencias,
      tintas,
      resumen: {
        totalProyectos: proyectos.length,
        totalImpresiones: impresiones.length,
        cantidadTotal: impresiones.reduce((a, i) => a + i.cantidad, 0),
        tiempoTotal: impresiones.reduce((a, i) => a + i.tiempo, 0),
        totalIncidencias: incidencias.length,
        tintaGastadaTotal:
          Math.round(tintas.reduce((a, t) => a + t.gastado, 0) * 10) / 10,
      },
    };
  },
};
