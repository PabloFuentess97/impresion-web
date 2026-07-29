"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  actualizarRollosPapel,
  editarPapel,
  eliminarPapel,
} from "@/actions/papel.actions";
import type { Papel } from "@prisma/client";

/** Diálogo para editar un papel: nombre y número de rollos. */
export function PapelEditDialog({
  papel,
  trigger,
}: {
  papel: Papel;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);

  const [nombre, setNombre] = React.useState(papel.nombre);
  const [rollos, setRollos] = React.useState(papel.rollos);

  React.useEffect(() => {
    if (abierto) {
      setNombre(papel.nombre);
      setRollos(papel.rollos);
    }
  }, [abierto, papel]);

  async function guardar() {
    setGuardando(true);
    try {
      if (nombre !== papel.nombre) {
        const r1 = await editarPapel({ id: papel.id, nombre });
        if (!r1.success) {
          toast.error(r1.message);
          return;
        }
      }
      if (rollos !== papel.rollos) {
        const r2 = await actualizarRollosPapel({ id: papel.id, rollos });
        if (!r2.success) {
          toast.error(r2.message);
          return;
        }
      }
      toast.success("Papel actualizado.");
      setAbierto(false);
      router.refresh();
    } finally {
      setGuardando(false);
    }
  }

  async function borrar() {
    const r = await eliminarPapel(papel.id);
    if (r.success) {
      toast.success(r.message ?? "Papel eliminado.");
      setAbierto(false);
      router.refresh();
    } else {
      toast.error(r.message);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar papel</DialogTitle>
          <DialogDescription>
            Ajusta el nombre o el número de rollos disponibles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre-papel">Nombre</Label>
            <Input
              id="nombre-papel"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rollos-papel">Rollos</Label>
            <Input
              id="rollos-papel"
              type="number"
              min={0}
              value={rollos}
              onChange={(e) =>
                setRollos(Math.max(0, Number(e.target.value) || 0))
              }
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <ConfirmDialog
            titulo="Eliminar papel"
            descripcion={`Se eliminará "${papel.nombre}" y su historial de rollos.`}
            textoConfirmar="Eliminar"
            onConfirm={borrar}
            trigger={
              <Button variant="ghost" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" /> Eliminar
              </Button>
            }
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAbierto(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={guardando}>
              {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
