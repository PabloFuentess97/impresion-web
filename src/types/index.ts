import type {
  Proyecto,
  Impresion,
  Incidencia,
  EstanciaMapa,
  Inventario,
  ModuloConfiguracion,
  Recogida,
  UbicacionImpresion,
  ZonaMapa,
  EstadoIncidencia,
  EstadoRecogida,
} from "@prisma/client";

/**
 * Resultado estándar de una Server Action.
 * Permite manejar de forma uniforme éxitos y errores (incluyendo
 * errores de validación por campo).
 */
export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

/** Proyecto con métricas agregadas para los listados. */
export interface ProyectoConMetricas extends Proyecto {
  totalImpresiones: number;
  cantidadTotal: number;
  tiempoTotal: number;
}

/** Proyecto con sus impresiones y métricas (vista de detalle). */
export interface ProyectoDetalle extends Proyecto {
  impresiones: Impresion[];
  totalImpresiones: number;
  cantidadTotal: number;
  tiempoTotal: number;
}

/** Estadísticas del dashboard. */
export interface EstadisticasDashboard {
  totalProyectos: number;
  totalImpresiones: number;
  totalIncidencias: number;
  tiempoTotal: number;
  impresionesHoy: number;
  proyectosActivos: number;
}

/** Punto de datos para los gráficos de actividad. */
export interface PuntoActividad {
  fecha: string;
  etiqueta: string;
  impresiones: number;
  tiempo: number;
}

/** Distribución de incidencias por estado. */
export interface DistribucionEstado {
  estado: EstadoIncidencia;
  label: string;
  total: number;
}

/** Resultado paginado genérico. */
export interface Paginado<T> {
  items: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
  tamano: number;
}

/** Recogida con el proyecto asociado (id y título) para los listados. */
export interface RecogidaConProyecto extends Recogida {
  proyecto: { id: string; titulo: string };
}

export type {
  Proyecto,
  Impresion,
  Incidencia,
  EstanciaMapa,
  Inventario,
  ModuloConfiguracion,
  Recogida,
  UbicacionImpresion,
  ZonaMapa,
  EstadoIncidencia,
  EstadoRecogida,
};
