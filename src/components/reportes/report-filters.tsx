"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/use-query-params";
import { PERIODOS_REPORTE } from "@/lib/constants";

/** Filtros de período del reporte (sincronizados con la URL). */
export function ReportFilters() {
  const { getParam, setParams } = useQueryParams();
  const periodo = getParam("periodo") || "hoy";

  const [desde, setDesde] = React.useState(getParam("desde"));
  const [hasta, setHasta] = React.useState(getParam("hasta"));

  function aplicarPersonalizado() {
    setParams({ periodo: "personalizado", desde: desde || null, hasta: hasta || null });
  }

  return (
    <div className="space-y-4 no-imprimir">
      <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1">
        {PERIODOS_REPORTE.map((p) => (
          <button
            key={p.value}
            onClick={() =>
              setParams({
                periodo: p.value,
                ...(p.value !== "personalizado" ? { desde: null, hasta: null } : {}),
              })
            }
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              periodo === p.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {periodo === "personalizado" && (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="desde" className="text-xs">
              Desde
            </Label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="desde"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hasta" className="text-xs">
              Hasta
            </Label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="hasta"
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Button onClick={aplicarPersonalizado}>Aplicar</Button>
        </div>
      )}
    </div>
  );
}
