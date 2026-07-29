import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { impresionRepository } from "@/repositories/impresion.repository";
import { incidenciaRepository } from "@/repositories/incidencia.repository";
import { ESTADOS_INCIDENCIA } from "@/lib/constants";
import type {
  EstadisticasDashboard,
  PuntoActividad,
  DistribucionEstado,
} from "@/types";
import type { EstadoIncidencia } from "@prisma/client";

/**
 * Servicio del Dashboard. Calcula estadísticas globales y series para gráficos.
 */
export const dashboardService = {
  async obtenerEstadisticas(): Promise<EstadisticasDashboard> {
    const hoy = new Date();
    const inicioHoy = startOfDay(hoy);
    const finHoy = endOfDay(hoy);
    const hace30dias = subDays(inicioHoy, 30);

    const [
      totalProyectos,
      totalIncidencias,
      agregadosTotales,
      impresionesHoyAgg,
      proyectosActivos,
    ] = await Promise.all([
      prisma.proyecto.count(),
      prisma.incidencia.count(),
      impresionRepository.agregados(),
      impresionRepository.agregados({ fecha: { gte: inicioHoy, lte: finHoy } }),
      // Proyectos activos: con impresiones en los últimos 30 días.
      prisma.proyecto.count({
        where: { impresiones: { some: { fecha: { gte: hace30dias } } } },
      }),
    ]);

    return {
      totalProyectos,
      totalImpresiones: agregadosTotales._count._all,
      totalIncidencias,
      tiempoTotal: agregadosTotales._sum.tiempo ?? 0,
      impresionesHoy: impresionesHoyAgg._count._all,
      proyectosActivos,
    };
  },

  /** Serie de actividad de los últimos N días (impresiones y tiempo). */
  async obtenerActividad(dias = 14): Promise<PuntoActividad[]> {
    const inicio = startOfDay(subDays(new Date(), dias - 1));
    const impresiones = await impresionRepository.listarDesde(inicio);

    // Inicializa todos los días del rango a cero.
    const mapa = new Map<string, PuntoActividad>();
    for (let i = 0; i < dias; i++) {
      const fecha = subDays(startOfDay(new Date()), dias - 1 - i);
      const clave = format(fecha, "yyyy-MM-dd");
      mapa.set(clave, {
        fecha: clave,
        etiqueta: format(fecha, "d MMM", { locale: es }),
        impresiones: 0,
        tiempo: 0,
      });
    }

    for (const imp of impresiones) {
      const clave = format(imp.fecha, "yyyy-MM-dd");
      const punto = mapa.get(clave);
      if (punto) {
        punto.impresiones += imp.cantidad;
        punto.tiempo += imp.tiempo;
      }
    }

    return Array.from(mapa.values());
  },

  /** Distribución de incidencias por estado (para gráfico de tarta). */
  async obtenerDistribucionIncidencias(): Promise<DistribucionEstado[]> {
    const grupos = await incidenciaRepository.agruparPorEstado();
    const base: EstadoIncidencia[] = ["ABIERTA", "EN_PROCESO", "RESUELTA"];

    return base.map((estado) => {
      const grupo = grupos.find((g) => g.estado === estado);
      return {
        estado,
        label: ESTADOS_INCIDENCIA[estado].label,
        total: grupo?._count._all ?? 0,
      };
    });
  },
};
