import type { EstadoIncidencia } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ESTADOS_INCIDENCIA } from "@/lib/constants";

/** Etiqueta de estado de incidencia con color. */
export function EstadoBadge({ estado }: { estado: EstadoIncidencia }) {
  const info = ESTADOS_INCIDENCIA[estado];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        info.color,
      )}
    >
      {info.label}
    </span>
  );
}
