import { Pencil, Scroll } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PapelEditDialog } from "./papel-edit-dialog";
import { formatearNumero } from "@/lib/format";
import type { Papel } from "@prisma/client";

/** Tarjeta con el stock de rollos de un papel. */
export function PapelCard({ papel }: { papel: Papel }) {
  const bajo = papel.rollos <= 2;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Scroll className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">{papel.nombre}</p>
            <p className="text-xs text-muted-foreground">Rollos disponibles</p>
          </div>
        </div>
        <PapelEditDialog
          papel={papel}
          trigger={
            <Button variant="ghost" size="icon" aria-label="Editar papel">
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {formatearNumero(papel.rollos)}
        </span>
        <span className="mb-1 text-sm text-muted-foreground">
          {papel.rollos === 1 ? "rollo" : "rollos"}
        </span>
        {bajo && (
          <span className="mb-1 ml-auto text-xs font-medium text-destructive">
            Stock bajo
          </span>
        )}
      </div>
    </Card>
  );
}
