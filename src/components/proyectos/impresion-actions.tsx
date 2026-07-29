"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ImpresionFormDialog } from "./impresion-form-dialog";
import { eliminarImpresion } from "@/actions/impresion.actions";
import type { Impresion } from "@/types";

/** Menú de acciones para una impresión. */
export function ImpresionActions({
  impresion,
}: {
  impresion: Pick<Impresion, "id" | "nombre" | "cantidad" | "tiempo" | "proyectoId">;
}) {
  const router = useRouter();

  async function manejarEliminar() {
    const resultado = await eliminarImpresion(impresion.id);
    if (resultado.success) {
      toast.success(resultado.message ?? "Impresión eliminada.");
      router.refresh();
    } else {
      toast.error(resultado.message);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Acciones">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ImpresionFormDialog
          proyectoId={impresion.proyectoId}
          impresion={impresion}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="h-4 w-4" /> Editar
            </DropdownMenuItem>
          }
        />
        <DropdownMenuSeparator />
        <ConfirmDialog
          titulo="Eliminar impresión"
          descripcion={`Se eliminará "${impresion.nombre}". Esta acción no se puede deshacer.`}
          textoConfirmar="Eliminar"
          onConfirm={manejarEliminar}
          trigger={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
