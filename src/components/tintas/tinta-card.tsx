import { Pencil, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TintaEditDialog } from "./tinta-edit-dialog";
import type { Tinta } from "@prisma/client";

/** Tarjeta con el nivel visual de una tinta. */
export function TintaCard({ tinta }: { tinta: Tinta }) {
  const nivel = Math.round(tinta.porcentaje);
  const bajo = nivel <= 20;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="h-6 w-6 rounded-md border border-border shadow-sm"
            style={{ backgroundColor: tinta.color }}
          />
          <div>
            <p className="font-semibold text-foreground">{tinta.nombre}</p>
            <p className="text-xs text-muted-foreground">Nivel de tinta</p>
          </div>
        </div>
        <TintaEditDialog
          tinta={tinta}
          trigger={
            <Button variant="ghost" size="icon" aria-label="Editar tinta">
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {nivel}
          <span className="text-lg text-muted-foreground">%</span>
        </span>
        {bajo && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" /> Nivel bajo
          </span>
        )}
      </div>

      {/* Barra de nivel */}
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${nivel}%`,
            backgroundColor: bajo ? "hsl(var(--destructive))" : tinta.color,
          }}
        />
      </div>
    </Card>
  );
}
