"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
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
import { IncidenciaFormDialog } from "./incidencia-form-dialog";
import { IncidenciaViewDialog } from "./incidencia-view-dialog";
import { eliminarIncidencia } from "@/actions/incidencia.actions";
import type { Incidencia } from "@/types";

/** Menú de acciones para una incidencia. */
export function IncidenciaActions({ incidencia }: { incidencia: Incidencia }) {
  const router = useRouter();

  async function manejarEliminar() {
    const resultado = await eliminarIncidencia(incidencia.id);
    if (resultado.success) {
      toast.success(resultado.message ?? "Incidencia eliminada.");
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
        <IncidenciaViewDialog
          incidencia={incidencia}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Eye className="h-4 w-4" /> Ver
            </DropdownMenuItem>
          }
        />
        <IncidenciaFormDialog
          incidencia={incidencia}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="h-4 w-4" /> Editar
            </DropdownMenuItem>
          }
        />
        <DropdownMenuSeparator />
        <ConfirmDialog
          titulo="Eliminar incidencia"
          descripcion={`Se eliminará "${incidencia.titulo}". Esta acción no se puede deshacer.`}
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
