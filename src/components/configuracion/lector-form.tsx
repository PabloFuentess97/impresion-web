"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  lectorSchema,
  type LectorInput,
} from "@/validators/configuracion.validator";
import { actualizarLector } from "@/actions/configuracion.actions";

interface LectorFormProps {
  /** Correo actual del usuario de solo lectura (vacío si no existe). */
  email: string;
}

/** Formulario para que el administrador gestione el usuario de solo lectura. */
export function LectorForm({ email }: LectorFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LectorInput>({
    resolver: zodResolver(lectorSchema),
    defaultValues: { email, password: "" },
  });

  async function onSubmit(valores: LectorInput) {
    const resultado = await actualizarLector(valores);
    if (resultado.success) {
      toast.success(resultado.message ?? "Usuario de solo lectura actualizado.");
      reset({ email: valores.email, password: "" });
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof LectorInput, { message: mensajes?.[0] });
        });
      }
      toast.error(resultado.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" /> Usuario de solo lectura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Cuenta que solo puede <strong>ver</strong> Proyectos y Salidas (y
          solicitar recogidas). Aquí puedes cambiar su correo y su contraseña.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lector-email">Correo electrónico</Label>
            <Input
              id="lector-email"
              type="email"
              autoComplete="off"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lector-password">Nueva contraseña</Label>
            <Input
              id="lector-password"
              type="password"
              autoComplete="new-password"
              placeholder="Déjalo en blanco para no cambiarla"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
