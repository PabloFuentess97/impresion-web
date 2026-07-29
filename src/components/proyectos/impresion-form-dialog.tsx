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
  impresionEditSchema,
  type ImpresionEditInput,
} from "@/validators/impresion.validator";
import { crearImpresion, actualizarImpresion } from "@/actions/impresion.actions";
import type { Impresion } from "@/types";

interface ImpresionFormDialogProps {
  trigger: React.ReactNode;
  proyectoId: string;
  impresion?: Pick<Impresion, "id" | "nombre" | "cantidad" | "tiempo">;
}

/** Diálogo con formulario para crear o editar una impresión. */
export function ImpresionFormDialog({
  trigger,
  proyectoId,
  impresion,
}: ImpresionFormDialogProps) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const esEdicion = Boolean(impresion);

  // Tiempo desglosado en horas y minutos para mejor UX.
  const [horas, setHoras] = React.useState(
    impresion ? Math.floor(impresion.tiempo / 60) : 0,
  );
  const [minutos, setMinutos] = React.useState(
    impresion ? impresion.tiempo % 60 : 0,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ImpresionEditInput>({
    resolver: zodResolver(impresionEditSchema),
    defaultValues: {
      nombre: impresion?.nombre ?? "",
      cantidad: impresion?.cantidad ?? 1,
      tiempo: impresion?.tiempo ?? 0,
    },
  });

  React.useEffect(() => {
    if (abierto) {
      reset({
        nombre: impresion?.nombre ?? "",
        cantidad: impresion?.cantidad ?? 1,
        tiempo: impresion?.tiempo ?? 0,
      });
      setHoras(impresion ? Math.floor(impresion.tiempo / 60) : 0);
      setMinutos(impresion ? impresion.tiempo % 60 : 0);
    }
  }, [abierto, impresion, reset]);

  // Sincroniza horas + minutos con el campo "tiempo" (en minutos).
  React.useEffect(() => {
    setValue("tiempo", Number(horas) * 60 + Number(minutos));
  }, [horas, minutos, setValue]);

  async function onSubmit(valores: ImpresionEditInput) {
    const resultado = esEdicion
      ? await actualizarImpresion(impresion!.id, valores)
      : await crearImpresion({ ...valores, proyectoId });

    if (resultado.success) {
      toast.success(resultado.message ?? "Guardado correctamente.");
      setAbierto(false);
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          if (campo in valores) {
            setError(campo as keyof ImpresionEditInput, {
              message: mensajes?.[0],
            });
          }
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
            {esEdicion ? "Editar impresión" : "Nueva impresión"}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Modifica los datos de la impresión."
              : "Añade una impresión a este proyecto. La fecha se registra automáticamente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la impresión</Label>
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
              min={1}
              {...register("cantidad")}
            />
            {errors.cantidad && (
              <p className="text-xs text-destructive">
                {errors.cantidad.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tiempo empleado</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  value={horas}
                  onChange={(e) => setHoras(Number(e.target.value) || 0)}
                  className="pr-12"
                  aria-label="Horas"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  horas
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={minutos}
                  onChange={(e) => setMinutos(Number(e.target.value) || 0)}
                  className="pr-12"
                  aria-label="Minutos"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  min
                </span>
              </div>
            </div>
            {errors.tiempo && (
              <p className="text-xs text-destructive">{errors.tiempo.message}</p>
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
              {esEdicion ? "Guardar cambios" : "Añadir impresión"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
