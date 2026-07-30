"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  inventarioSchema,
  type InventarioInput,
} from "@/validators/inventario.validator";
import {
  crearInventario,
  actualizarInventario,
} from "@/actions/inventario.actions";
import type { Inventario } from "@/types";

interface InventarioFormDialogProps {
  trigger: React.ReactNode;
  articulo?: Pick<Inventario, "id" | "nombre" | "cantidad">;
}

/** Diálogo con formulario para crear o editar un artículo de inventario. */
export function InventarioFormDialog({
  trigger,
  articulo,
}: InventarioFormDialogProps) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const esEdicion = Boolean(articulo);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InventarioInput>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: {
      nombre: articulo?.nombre ?? "",
      cantidad: articulo?.cantidad ?? 0,
    },
  });

  React.useEffect(() => {
    if (abierto) {
      reset({
        nombre: articulo?.nombre ?? "",
        cantidad: articulo?.cantidad ?? 0,
      });
    }
  }, [abierto, articulo, reset]);

  async function onSubmit(valores: InventarioInput) {
    const resultado = esEdicion
      ? await actualizarInventario(articulo!.id, valores)
      : await crearInventario(valores);

    if (resultado.success) {
      toast.success(resultado.message ?? "Guardado correctamente.");
      setAbierto(false);
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof InventarioInput, { message: mensajes?.[0] });
        });
      }
      toast.error(resultado.message);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? "Editar artículo" : "Nuevo artículo"}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Modifica el nombre o la cantidad del artículo."
              : "Añade un artículo al inventario con su cantidad."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              min={0}
              {...register("cantidad")}
            />
            {errors.cantidad && (
              <p className="text-xs text-destructive">
                {errors.cantidad.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAbierto(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {esEdicion ? "Guardar cambios" : "Añadir artículo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
