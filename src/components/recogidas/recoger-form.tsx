"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, PackageCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  crearRecogidaSchema,
  type CrearRecogidaInput,
} from "@/validators/recogida.validator";
import { crearRecogidaPublica } from "@/actions/recogida.actions";

interface RecogerFormProps {
  token: string;
  proyectos: { id: string; titulo: string }[];
}

const SELECT_CLASS =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

/** Formulario público de recogida (se abre al escanear el QR). */
export function RecogerForm({ token, proyectos }: RecogerFormProps) {
  const [enviado, setEnviado] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CrearRecogidaInput>({
    resolver: zodResolver(crearRecogidaSchema),
    defaultValues: {
      token,
      proyectoId: "",
      nbi: "",
      nombre: "",
      unidades: 1,
    },
  });

  async function onSubmit(valores: CrearRecogidaInput) {
    const resultado = await crearRecogidaPublica(valores);
    if (resultado.success) {
      setEnviado(true);
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof CrearRecogidaInput, {
            message: mensajes?.[0],
          });
        });
      }
      toast.error(resultado.message);
    }
  }

  function registrarOtra() {
    reset({ token, proyectoId: "", nbi: "", nombre: "", unidades: 1 });
    setEnviado(false);
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">
            ¡Registrado correctamente!
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Queda <strong>pendiente de aprobación</strong> por el
            administrador.
          </p>
        </div>
        <Button onClick={registrarOtra} className="w-full">
          Registrar otra recogida
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("token")} />

      <div className="space-y-2">
        <Label htmlFor="proyectoId">Proyecto</Label>
        <select id="proyectoId" className={SELECT_CLASS} {...register("proyectoId")}>
          <option value="">Selecciona un proyecto…</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
            </option>
          ))}
        </select>
        {errors.proyectoId && (
          <p className="text-xs text-destructive">{errors.proyectoId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nbi">NBI (identificador)</Label>
          <Input id="nbi" inputMode="text" {...register("nbi")} />
          {errors.nbi && (
            <p className="text-xs text-destructive">{errors.nbi.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" {...register("nombre")} />
          {errors.nombre && (
            <p className="text-xs text-destructive">{errors.nombre.message}</p>
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
          <p className="text-xs text-destructive">{errors.unidades.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PackageCheck className="h-4 w-4" />
        )}
        Registrar recogida
      </Button>
    </form>
  );
}
