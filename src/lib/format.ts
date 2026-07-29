import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha en formato dd/MM/yyyy (sin hora).
 * Ejemplo: 29/07/2026
 */
export function formatearFecha(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return format(d, "dd/MM/yyyy", { locale: es });
}

/** Formatea una fecha larga: "29 de julio de 2026". */
export function formatearFechaLarga(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Convierte una cantidad de minutos en un texto legible.
 * Ejemplos: 90 -> "1 h 30 min", 45 -> "45 min", 120 -> "2 h".
 */
export function formatearTiempo(minutos: number): string {
  if (!minutos || minutos <= 0) return "0 min";
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} h`;
  return `${horas} h ${mins} min`;
}

/** Devuelve el tiempo en horas con un decimal (para gráficos). */
export function minutosAHoras(minutos: number): number {
  return Math.round((minutos / 60) * 10) / 10;
}

/** Formatea un número con separadores de miles en español. */
export function formatearNumero(valor: number): string {
  return new Intl.NumberFormat("es-ES").format(valor);
}
