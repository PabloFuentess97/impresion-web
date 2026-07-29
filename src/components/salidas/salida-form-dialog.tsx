"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { salidaSchema, type SalidaInput } from "@/validators/salida.validator";
import { crearSalida, actualizarSalida } from "@/actions/salida.actions";

interface OpcionProyecto {
  id: string;
  titulo: string;
}

interface SalidaFormDialogProps {
  trigger: React.ReactNode;
  proyectos: OpcionProyecto[];
  /** Si se indica, el proyecto queda fijado (desde el detalle de proyecto). */
  proyectoIdFijo?: string;
  salida?: {
    id: string;
    cantidad: number;
    destino: string;
    nota: string | null;
    proyectoId: string;
  };
}

/** Diálogo con formulario para crear o editar una salida. */
export function SalidaFormDialog({
  trigger,
  proyectos,
  proyectoIdFijo,
  salida,
}: SalidaFormDialogProps) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const esEdicion = Boolean(salida);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SalidaInput>({
    resolver: zodResolver(salidaSchema),
    defaultValues: {
      proyectoId: salida?.proyectoId ?? proyectoIdFijo ?? "",
      cantidad: salida?.cantidad ?? 1,
      destino: salida?.destino ?? "",
      nota: salida?.nota ?? "",
    },
  });

  React.useEffect(() => {
    if (abierto) {
      reset({
        proyectoId: salida?.proyectoId ?? proyectoIdFijo ?? "",
        cantidad: salida?.cantidad ?? 1,
        destino: salida?.destino ?? "",
        nota: salida?.nota ?? "",
      });
    }
  }, [abierto, salida, proyectoIdFijo, reset]);

  async function onSubmit(valores: SalidaInput) {
    const resultado = esEdicion
      ? await actualizarSalida(salida!.id, valores)
      : await crearSalida(valores);

    if (resultado.success) {
      toast.success(resultado.message ?? "Guardado correctamente.");
      setAbierto(false);
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof SalidaInput, { message: mensajes?.[0] });
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
            {esEdicion ? "Editar salida" : "Nueva salida"}
          </DialogTitle>
          <DialogDescription>
            Indica cuántas unidades de un proyecto se envían y a qué destino.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!proyectoIdFijo && (
            <div className="space-y-2">
              <Label htmlFor="proyectoId">Proyecto</Label>
              <Controller
                control={control}
                name="proyectoId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={esEdicion}
                  >
                    <SelectTrigger id="proyectoId">
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.proyectoId && (
                <p className="text-xs text-destructive">
                  {errors.proyectoId.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Unidades / etiquetas</Label>
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
              <Label htmlFor="destino">Destino</Label>
              <Input
                id="destino"
                placeholder="Ej. Almacén central"
                {...register("destino")}
              />
              {errors.destino && (
                <p className="text-xs text-destructive">
                  {errors.destino.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nota">Nota (opcional)</Label>
            <Textarea
              id="nota"
              rows={2}
              placeholder="Información adicional sobre la salida."
              {...register("nota")}
            />
            {errors.nota && (
              <p className="text-xs text-destructive">{errors.nota.message}</p>
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
              {esEdicion ? "Guardar cambios" : "Registrar salida"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
