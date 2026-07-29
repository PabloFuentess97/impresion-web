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
import { RichTextEditor } from "./rich-text-editor";
import {
  incidenciaSchema,
  type IncidenciaInput,
} from "@/validators/incidencia.validator";
import {
  crearIncidencia,
  actualizarIncidencia,
} from "@/actions/incidencia.actions";
import { OPCIONES_ESTADO } from "@/lib/constants";
import type { Incidencia } from "@/types";

interface IncidenciaFormDialogProps {
  trigger: React.ReactNode;
  incidencia?: Pick<Incidencia, "id" | "titulo" | "descripcion" | "estado">;
}

/** Diálogo con formulario para crear o editar una incidencia. */
export function IncidenciaFormDialog({
  trigger,
  incidencia,
}: IncidenciaFormDialogProps) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const esEdicion = Boolean(incidencia);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<IncidenciaInput>({
    resolver: zodResolver(incidenciaSchema),
    defaultValues: {
      titulo: incidencia?.titulo ?? "",
      descripcion: incidencia?.descripcion ?? "",
      estado: incidencia?.estado ?? "ABIERTA",
    },
  });

  React.useEffect(() => {
    if (abierto) {
      reset({
        titulo: incidencia?.titulo ?? "",
        descripcion: incidencia?.descripcion ?? "",
        estado: incidencia?.estado ?? "ABIERTA",
      });
    }
  }, [abierto, incidencia, reset]);

  async function onSubmit(valores: IncidenciaInput) {
    const resultado = esEdicion
      ? await actualizarIncidencia(incidencia!.id, valores)
      : await crearIncidencia(valores);

    if (resultado.success) {
      toast.success(resultado.message ?? "Guardado correctamente.");
      setAbierto(false);
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof IncidenciaInput, { message: mensajes?.[0] });
        });
      }
      toast.error(resultado.message);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {esEdicion ? "Editar incidencia" : "Nueva incidencia"}
          </DialogTitle>
          <DialogDescription>
            Registra el problema con una descripción detallada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" {...register("titulo")} />
              {errors.titulo && (
                <p className="text-xs text-destructive">
                  {errors.titulo.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Controller
                control={control}
                name="estado"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="estado">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPCIONES_ESTADO.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Controller
              control={control}
              name="descripcion"
              render={({ field }) => (
                <RichTextEditor valor={field.value} onChange={field.onChange} />
              )}
            />
            {errors.descripcion && (
              <p className="text-xs text-destructive">
                {errors.descripcion.message}
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
              {esEdicion ? "Guardar cambios" : "Crear incidencia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
