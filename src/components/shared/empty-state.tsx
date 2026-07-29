import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icono: React.ReactNode;
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
  className?: string;
}

/** Estado vacío reutilizable para listados sin resultados. */
export function EmptyState({
  icono,
  titulo,
  descripcion,
  accion,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:h-7 [&_svg]:w-7">
        {icono}
      </div>
      <h3 className="text-base font-semibold text-foreground">{titulo}</h3>
      {descripcion && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {descripcion}
        </p>
      )}
      {accion && <div className="mt-6">{accion}</div>}
    </div>
  );
}
