/**
 * Sanitización de HTML enriquecido (proveniente del editor Tiptap).
 *
 * Aunque el contenido lo genera el administrador (usuario de confianza),
 * aplicamos defensa en profundidad para evitar XSS almacenado:
 *  - Elimina etiquetas peligrosas y su contenido (script, style, iframe...).
 *  - Elimina atributos de eventos (onclick, onerror, ...).
 *  - Neutraliza URLs con esquemas peligrosos (javascript:, data: en href).
 */
const ETIQUETAS_PROHIBIDAS =
  /<\s*(script|style|iframe|object|embed|form|input|button|link|meta|base)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;

const ETIQUETAS_AUTOCERRADAS_PROHIBIDAS =
  /<\s*(script|style|iframe|object|embed|form|input|button|link|meta|base)\b[^>]*\/?>/gi;

/** Atributos de manejadores de eventos: onclick, onmouseover, etc. */
const ATRIBUTOS_EVENTO = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;

/** Esquemas peligrosos dentro de href/src. */
const ESQUEMAS_PELIGROSOS =
  /\s(href|src)\s*=\s*("|')?\s*(javascript|vbscript|data)\s*:[^"'>\s]*("|')?/gi;

export function sanitizarHtml(html: string): string {
  if (!html) return "";

  let limpio = html;

  // Elimina etiquetas peligrosas con contenido.
  limpio = limpio.replace(ETIQUETAS_PROHIBIDAS, "");
  // Elimina etiquetas peligrosas autocerradas / sin cierre.
  limpio = limpio.replace(ETIQUETAS_AUTOCERRADAS_PROHIBIDAS, "");
  // Elimina atributos de evento.
  limpio = limpio.replace(ATRIBUTOS_EVENTO, "");
  // Neutraliza esquemas peligrosos en enlaces e imágenes.
  limpio = limpio.replace(ESQUEMAS_PELIGROSOS, ' $1="#"');

  return limpio.trim();
}

/** Convierte HTML a texto plano (para búsquedas y exportaciones). */
export function htmlATexto(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
