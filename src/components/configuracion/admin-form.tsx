"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminSchema, type AdminInput } from "@/validators/configuracion.validator";
import { actualizarAdmin } from "@/actions/configuracion.actions";

interface AdminFormProps {
  admin: { nombre: string; email: string };
}

/** Formulario de datos del administrador (nombre, email, contraseña). */
export function AdminForm({ admin }: AdminFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminInput>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      nombre: admin.nombre,
      email: admin.email,
      passwordActual: "",
      passwordNueva: "",
    },
  });

  async function onSubmit(valores: AdminInput) {
    const resultado = await actualizarAdmin(valores);
    if (resultado.success) {
      toast.success(resultado.message ?? "Datos actualizados.");
      reset({ ...valores, passwordActual: "", passwordNueva: "" });
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof AdminInput, { message: mensajes?.[0] });
        });
      }
      toast.error(resultado.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" /> Datos del administrador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <Separator className="my-2" />

          <div>
            <p className="text-sm font-medium text-foreground">
              Cambiar contraseña
            </p>
            <p className="text-xs text-muted-foreground">
              Déjalo en blanco si no quieres cambiarla.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="passwordActual">Contraseña actual</Label>
              <Input
                id="passwordActual"
                type="password"
                autoComplete="current-password"
                {...register("passwordActual")}
              />
              {errors.passwordActual && (
                <p className="text-xs text-destructive">
                  {errors.passwordActual.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordNueva">Nueva contraseña</Label>
              <Input
                id="passwordNueva"
                type="password"
                autoComplete="new-password"
                {...register("passwordNueva")}
              />
              {errors.passwordNueva && (
                <p className="text-xs text-destructive">
                  {errors.passwordNueva.message}
                </p>
              )}
            </div>
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
