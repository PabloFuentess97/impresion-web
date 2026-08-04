import type {
  EstadoIncidencia,
  EstadoProyecto,
  PrioridadProyecto,
} from "@prisma/client";

/** Nombre de la aplicación por defecto. */
export const APP_NOMBRE = "ImpresiónWeb";

/** Tamaño de página por defecto para los listados paginados. */
export const PAGINA_TAMANO = 10;

/** Opciones permitidas para configurar cuántos resultados se muestran. */
export const OPCIONES_TAMANO_PAGINA = [10, 25, 50, 100] as const;

export type TamanoPagina = (typeof OPCIONES_TAMANO_PAGINA)[number];

/** Normaliza el tamaño de página recibido por URL o servicio. */
export function normalizarTamanoPagina(valor?: number | string | null): TamanoPagina {
  const numero = Number(valor);
  return OPCIONES_TAMANO_PAGINA.includes(numero as TamanoPagina)
    ? (numero as TamanoPagina)
    : PAGINA_TAMANO;
}

/** Etiquetas legibles para los estados de incidencia. */
export const ESTADOS_INCIDENCIA: Record<
  EstadoIncidencia,
  { label: string; color: string }
> = {
  ABIERTA: {
    label: "Abierta",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  },
  EN_PROCESO: {
    label: "En proceso",
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
  },
  RESUELTA: {
    label: "Resuelta",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
  },
};

/** Opciones de estado para selects y filtros. */
export const OPCIONES_ESTADO = [
  { value: "ABIERTA", label: "Abierta" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "RESUELTA", label: "Resuelta" },
] as const;

export const ESTADOS_PROYECTO: Record<
  EstadoProyecto,
  { label: string; color: string }
> = {
  PENDIENTE: {
    label: "Pendiente",
    color:
      "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 border border-slate-200 dark:border-slate-500/20",
  },
  EN_PRODUCCION: {
    label: "En producción",
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
  },
  PAUSADO: {
    label: "Pausado",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  },
  TERMINADO: {
    label: "Terminado",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
  },
  CANCELADO: {
    label: "Cancelado",
    color:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20",
  },
};

export const PRIORIDADES_PROYECTO: Record<
  PrioridadProyecto,
  { label: string; color: string }
> = {
  BAJA: {
    label: "Baja",
    color:
      "bg-muted text-muted-foreground border border-border",
  },
  MEDIA: {
    label: "Media",
    color:
      "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20",
  },
  ALTA: {
    label: "Alta",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20",
  },
  URGENTE: {
    label: "Urgente",
    color:
      "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-200 dark:border-red-500/20",
  },
};

export const OPCIONES_ESTADO_PROYECTO = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PRODUCCION", label: "En producción" },
  { value: "PAUSADO", label: "Pausado" },
  { value: "TERMINADO", label: "Terminado" },
  { value: "CANCELADO", label: "Cancelado" },
] as const;

export const OPCIONES_PRIORIDAD_PROYECTO = [
  { value: "BAJA", label: "Baja" },
  { value: "MEDIA", label: "Media" },
  { value: "ALTA", label: "Alta" },
  { value: "URGENTE", label: "Urgente" },
] as const;

/** Tipos de período para los reportes. */
export const PERIODOS_REPORTE = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
  { value: "personalizado", label: "Rango personalizado" },
] as const;

export type PeriodoReporte = (typeof PERIODOS_REPORTE)[number]["value"];
