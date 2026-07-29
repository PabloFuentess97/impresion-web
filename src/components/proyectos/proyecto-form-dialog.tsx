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
import { Textarea } from "@/components/ui/textarea";
import {
  proyectoSchema,
  type ProyectoInput,
} from "@/validators/proyecto.validator";
import { crearProyecto, actualizarProyecto } from "@/actions/proyecto.actions";
import type { Proyecto } from "@/types";

interface ProyectoFormDialogProps {
  trigger: React.ReactNode;
  proyecto?: Pick<Proyecto, "id" | "titulo" | "descripcion">;
}

/** Diálogo con formulario para crear o editar un proyecto. */
export function ProyectoFormDialog({
  trigger,
  proyecto,
}: ProyectoFormDialogProps) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);
  const esEdicion = Boolean(proyecto);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProyectoInput>({
    resolver: zodResolver(proyectoSchema),
    defaultValues: {
      titulo: proyecto?.titulo ?? "",
      descripcion: proyecto?.descripcion ?? "",
    },
  });

  React.useEffect(() => {
    if (abierto) {
      reset({
        titulo: proyecto?.titulo ?? "",
        descripcion: proyecto?.descripcion ?? "",
      });
    }
  }, [abierto, proyecto, reset]);

  async function onSubmit(valores: ProyectoInput) {
    const resultado = esEdicion
      ? await actualizarProyecto(proyecto!.id, valores)
      : await crearProyecto(valores);

    if (resultado.success) {
      toast.success(resultado.message ?? "Guardado correctamente.");
      setAbierto(false);
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof ProyectoInput, { message: mensajes?.[0] });
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
            {esEdicion ? "Editar proyecto" : "Nuevo proyecto"}
          </DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Modifica los datos del proyecto."
              : "Crea un nuevo proyecto para agrupar impresiones."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              placeholder="Ej. Prototipo carcasa dron"
              {...register("titulo")}
            />
            {errors.titulo && (
              <p className="text-xs text-destructive">{errors.titulo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              rows={4}
              placeholder="Describe brevemente el proyecto (opcional)."
              {...register("descripcion")}
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
              {esEdicion ? "Guardar cambios" : "Crear proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
