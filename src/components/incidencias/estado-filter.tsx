"use client";

import { cn } from "@/lib/utils";
import { useQueryParams } from "@/hooks/use-query-params";

const OPCIONES = [
  { value: "TODAS", label: "Todas" },
  { value: "ABIERTA", label: "Abiertas" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "RESUELTA", label: "Resueltas" },
];

/** Filtro de incidencias por estado (sincronizado con la URL). */
export function EstadoFilter() {
  const { getParam, setParams } = useQueryParams();
  const activo = getParam("estado") || "TODAS";

  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1">
      {OPCIONES.map((o) => (
        <button
          key={o.value}
          onClick={() =>
            setParams({
              estado: o.value === "TODAS" ? null : o.value,
              pagina: null,
            })
          }
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activo === o.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
