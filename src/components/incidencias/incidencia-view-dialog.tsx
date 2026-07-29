"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EstadoBadge } from "./estado-badge";
import { formatearFechaLarga } from "@/lib/format";
import type { Incidencia } from "@/types";

/** Diálogo de solo lectura para ver la incidencia completa. */
export function IncidenciaViewDialog({
  incidencia,
  trigger,
}: {
  incidencia: Incidencia;
  trigger: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <EstadoBadge estado={incidencia.estado} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatearFechaLarga(incidencia.createdAt)}
            </span>
          </div>
          <DialogTitle className="text-xl">{incidencia.titulo}</DialogTitle>
        </DialogHeader>
        <div
          className="prosa mt-2 text-sm text-foreground"
          dangerouslySetInnerHTML={{ __html: incidencia.descripcion }}
        />
      </DialogContent>
    </Dialog>
  );
}
