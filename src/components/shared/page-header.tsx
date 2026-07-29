import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
  className?: string;
}

/** Cabecera de página con título, descripción y acción opcional. */
export function PageHeader({
  titulo,
  descripcion,
  accion,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {titulo}
        </h1>
        {descripcion && (
          <p className="text-sm text-muted-foreground">{descripcion}</p>
        )}
      </div>
      {accion && <div className="flex shrink-0 items-center gap-2">{accion}</div>}
    </div>
  );
}
