/**
 * Logger sencillo y centralizado.
 * En producción se puede sustituir por un servicio externo (Datadog, Sentry, etc.)
 * sin tocar el resto de la aplicación.
 */
type Nivel = "info" | "warn" | "error";

function escribir(nivel: Nivel, mensaje: string, meta?: unknown) {
  const timestamp = new Date().toISOString();
  const prefijo = `[${timestamp}] [${nivel.toUpperCase()}]`;
  const linea = meta !== undefined ? `${prefijo} ${mensaje}` : `${prefijo} ${mensaje}`;

  switch (nivel) {
    case "error":
      console.error(linea, meta ?? "");
      break;
    case "warn":
      console.warn(linea, meta ?? "");
      break;
    default:
      console.log(linea, meta ?? "");
  }
}

export const logger = {
  info: (mensaje: string, meta?: unknown) => escribir("info", mensaje, meta),
  warn: (mensaje: string, meta?: unknown) => escribir("warn", mensaje, meta),
  error: (mensaje: string, meta?: unknown) => escribir("error", mensaje, meta),
};
