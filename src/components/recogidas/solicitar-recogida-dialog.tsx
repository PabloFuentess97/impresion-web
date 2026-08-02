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
  solicitarRecogidaSchema,
  type SolicitarRecogidaInput,
} from "@/validators/recogida.validator";
import { solicitarRecogida } from "@/actions/recogida.actions";

const SELECT_CLASS =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

interface SolicitarRecogidaDialogProps {
  trigger: React.ReactNode;
  proyectos: { id: string; titulo: string }[];
}

/** Diálogo para que un usuario autenticado solicite una recogida. */
export function SolicitarRecogidaDialog({
  trigger,
  proyectos,
}: SolicitarRecogidaDialogProps) {
  const router = useRouter();
  const [abierto, setAbierto] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SolicitarRecogidaInput>({
    resolver: zodResolver(solicitarRecogidaSchema),
    defaultValues: { proyectoId: "", nbi: "", nombre: "", unidades: 1 },
  });

  React.useEffect(() => {
    if (abierto) reset({ proyectoId: "", nbi: "", nombre: "", unidades: 1 });
  }, [abierto, reset]);

  async function onSubmit(valores: SolicitarRecogidaInput) {
    const resultado = await solicitarRecogida(valores);
    if (resultado.success) {
      toast.success(resultado.message ?? "Solicitud enviada.");
      setAbierto(false);
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof SolicitarRecogidaInput, {
            message: mensajes?.[0],
          });
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
          <DialogTitle>Solicitar recogida</DialogTitle>
          <DialogDescription>
            Indica el proyecto y las unidades que coges. Tu solicitud quedará
            pendiente de aprobación por el administrador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proyectoId">Proyecto</Label>
            <select
              id="proyectoId"
              className={SELECT_CLASS}
              {...register("proyectoId")}
            >
              <option value="">Selecciona un proyecto…</option>
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.titulo}
                </option>
              ))}
            </select>
            {errors.proyectoId && (
              <p className="text-xs text-destructive">
                {errors.proyectoId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nbi">NBI (identificador)</Label>
              <Input id="nbi" {...register("nbi")} />
              {errors.nbi && (
                <p className="text-xs text-destructive">{errors.nbi.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} />
              {errors.nombre && (
                <p className="text-xs text-destructive">
                  {errors.nombre.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidades">Unidades que coges</Label>
            <Input
              id="unidades"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              {...register("unidades")}
            />
            {errors.unidades && (
              <p className="text-xs text-destructive">
                {errors.unidades.message}
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
              Enviar solicitud
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
