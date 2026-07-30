"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
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
import { ProyectoFormDialog } from "./proyecto-form-dialog";
import {
  eliminarProyecto,
  alternarBloqueoProyecto,
} from "@/actions/proyecto.actions";
import type { Proyecto } from "@/types";

/** Menú de acciones para un proyecto en el listado. */
export function ProyectoActions({
  proyecto,
}: {
  proyecto: Pick<
    Proyecto,
    "id" | "titulo" | "descripcion" | "rutaImpresion" | "bloqueado"
  >;
}) {
  const router = useRouter();

  async function manejarEliminar() {
    const resultado = await eliminarProyecto(proyecto.id);
    if (resultado.success) {
      toast.success(resultado.message ?? "Proyecto eliminado.");
      router.refresh();
    } else {
      toast.error(resultado.message);
    }
  }

  async function manejarBloqueo(bloqueado: boolean) {
    const resultado = await alternarBloqueoProyecto(proyecto.id, bloqueado);
    if (resultado.success) {
      toast.success(resultado.message);
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
        <DropdownMenuItem asChild>
          <Link href={`/proyectos/${proyecto.id}`}>
            <Eye className="h-4 w-4" /> Ver detalle
          </Link>
        </DropdownMenuItem>
        <ProyectoFormDialog
          proyecto={proyecto}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="h-4 w-4" /> Editar
            </DropdownMenuItem>
          }
        />

        {proyecto.bloqueado ? (
          <ConfirmDialog
            titulo="Desbloquear proyecto"
            descripcion={`Vas a desbloquear "${proyecto.titulo}". Volverá a su estado normal en el listado.`}
            textoConfirmar="Desbloquear"
            variante="default"
            onConfirm={() => manejarBloqueo(false)}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Unlock className="h-4 w-4" /> Desbloquear
              </DropdownMenuItem>
            }
          />
        ) : (
          <DropdownMenuItem onSelect={() => manejarBloqueo(true)}>
            <Lock className="h-4 w-4" /> Bloquear
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <ConfirmDialog
          titulo="Eliminar proyecto"
          descripcion={`Se eliminará "${proyecto.titulo}" y todas sus impresiones. Esta acción no se puede deshacer.`}
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
