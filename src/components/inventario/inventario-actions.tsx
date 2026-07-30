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
import { InventarioFormDialog } from "./inventario-form-dialog";
import { eliminarInventario } from "@/actions/inventario.actions";
import type { Inventario } from "@/types";

/** Menú de acciones para un artículo de inventario. */
export function InventarioActions({
  articulo,
}: {
  articulo: Pick<Inventario, "id" | "nombre" | "cantidad">;
}) {
  const router = useRouter();

  async function manejarEliminar() {
    const resultado = await eliminarInventario(articulo.id);
    if (resultado.success) {
      toast.success(resultado.message ?? "Artículo eliminado.");
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
        <InventarioFormDialog
          articulo={articulo}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="h-4 w-4" /> Editar
            </DropdownMenuItem>
          }
        />
        <DropdownMenuSeparator />
        <ConfirmDialog
          titulo="Eliminar artículo"
          descripcion={`Se eliminará "${articulo.nombre}" del inventario. Esta acción no se puede deshacer.`}
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
