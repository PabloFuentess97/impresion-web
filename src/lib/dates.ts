import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import type { PeriodoReporte } from "./constants";

export interface RangoFechas {
  desde: Date;
  hasta: Date;
}

/**
 * Calcula el rango de fechas [desde, hasta] correspondiente a un período.
 * Para "personalizado" se usan las fechas proporcionadas.
 */
export function calcularRango(
  periodo: PeriodoReporte,
  desdeStr?: string,
  hastaStr?: string,
): RangoFechas {
  const ahora = new Date();

  switch (periodo) {
    case "hoy":
      return { desde: startOfDay(ahora), hasta: endOfDay(ahora) };
    case "semana":
      return {
        desde: startOfWeek(ahora, { weekStartsOn: 1 }),
        hasta: endOfWeek(ahora, { weekStartsOn: 1 }),
      };
    case "mes":
      return { desde: startOfMonth(ahora), hasta: endOfMonth(ahora) };
    case "personalizado": {
      const desde = desdeStr ? startOfDay(new Date(desdeStr)) : startOfDay(ahora);
      const hasta = hastaStr ? endOfDay(new Date(hastaStr)) : endOfDay(ahora);
      return { desde, hasta };
    }
    default:
      return { desde: startOfDay(ahora), hasta: endOfDay(ahora) };
  }
}
