"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import {
  actualizarPorcentajeTinta,
  editarTinta,
} from "@/actions/tinta.actions";
import type { Tinta } from "@prisma/client";

/** Diálogo para editar una tinta: nombre, color y nivel (%). */
export function TintaEditDialog({
  tinta,
  trigger,
}: {
  tinta: Tinta;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);

  const [nombre, setNombre] = React.useState(tinta.nombre);
  const [color, setColor] = React.useState(tinta.color);
  const [porcentaje, setPorcentaje] = React.useState(tinta.porcentaje);

  React.useEffect(() => {
    if (abierto) {
      setNombre(tinta.nombre);
      setColor(tinta.color);
      setPorcentaje(tinta.porcentaje);
    }
  }, [abierto, tinta]);

  async function guardar() {
    setGuardando(true);
    try {
      // Nombre / color
      if (nombre !== tinta.nombre || color !== tinta.color) {
        const r1 = await editarTinta({ id: tinta.id, nombre, color });
        if (!r1.success) {
          toast.error(r1.message);
          return;
        }
      }
      // Nivel (%): solo si cambia, para no crear lecturas duplicadas.
      if (porcentaje !== tinta.porcentaje) {
        const r2 = await actualizarPorcentajeTinta({ id: tinta.id, porcentaje });
        if (!r2.success) {
          toast.error(r2.message);
          return;
        }
      }
      toast.success("Tinta actualizada.");
      setAbierto(false);
      router.refresh();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tinta</DialogTitle>
          <DialogDescription>
            Ajusta el nivel actual, el nombre o el color de la tinta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre-tinta">Nombre</Label>
            <Input
              id="nombre-tinta"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-tinta">Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="color-tinta"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-14 cursor-pointer rounded-md border border-input bg-background"
              />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="porcentaje-tinta">Nivel actual</Label>
              <span className="text-sm font-semibold text-foreground">
                {porcentaje}%
              </span>
            </div>
            <input
              id="porcentaje-tinta"
              type="range"
              min={0}
              max={100}
              step={1}
              value={porcentaje}
              onChange={(e) => setPorcentaje(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={porcentaje}
              onChange={(e) =>
                setPorcentaje(
                  Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                )
              }
            />
          </div>
        </div>

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
