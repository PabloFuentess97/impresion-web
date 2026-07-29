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
import { crearPapelSchema, type CrearPapelInput } from "@/validators/papel.validator";
import { crearPapel } from "@/actions/papel.actions";

/** Diálogo para añadir un nuevo tipo de papel. */
export function PapelAddDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CrearPapelInput>({
    resolver: zodResolver(crearPapelSchema),
    defaultValues: { nombre: "Papel", rollos: 0 },
  });

  React.useEffect(() => {
    if (abierto) reset({ nombre: "Papel", rollos: 0 });
  }, [abierto, reset]);

  async function onSubmit(valores: CrearPapelInput) {
    const resultado = await crearPapel(valores);
    if (resultado.success) {
      toast.success(resultado.message ?? "Papel añadido.");
      setAbierto(false);
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof CrearPapelInput, { message: mensajes?.[0] });
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
          <DialogTitle>Nuevo papel</DialogTitle>
          <DialogDescription>
            Registra un tipo de papel y sus rollos disponibles.
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
            <Label htmlFor="rollos">Rollos</Label>
            <Input id="rollos" type="number" min={0} {...register("rollos")} />
            {errors.rollos && (
              <p className="text-xs text-destructive">{errors.rollos.message}</p>
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
              Añadir papel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
