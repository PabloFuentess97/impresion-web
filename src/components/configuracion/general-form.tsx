"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { Loader2, Building2, Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  configuracionSchema,
  type ConfiguracionInput,
} from "@/validators/configuracion.validator";
import { actualizarConfiguracion } from "@/actions/configuracion.actions";

interface GeneralFormProps {
  configuracion: {
    nombreEmpresa: string;
    logoUrl: string | null;
    tema: string;
  };
}

/** Formulario de configuración general (empresa, logo, tema). */
export function GeneralForm({ configuracion }: GeneralFormProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ConfiguracionInput>({
    resolver: zodResolver(configuracionSchema),
    defaultValues: {
      nombreEmpresa: configuracion.nombreEmpresa,
      logoUrl: configuracion.logoUrl ?? "",
      tema: (configuracion.tema as ConfiguracionInput["tema"]) ?? "system",
    },
  });

  async function onSubmit(valores: ConfiguracionInput) {
    const resultado = await actualizarConfiguracion(valores);
    if (resultado.success) {
      toast.success(resultado.message ?? "Configuración guardada.");
      setTheme(valores.tema);
      router.refresh();
    } else {
      if (resultado.fieldErrors) {
        Object.entries(resultado.fieldErrors).forEach(([campo, mensajes]) => {
          setError(campo as keyof ConfiguracionInput, { message: mensajes?.[0] });
        });
      }
      toast.error(resultado.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" /> Datos de la empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreEmpresa">Nombre de la empresa</Label>
            <Input id="nombreEmpresa" {...register("nombreEmpresa")} />
            {errors.nombreEmpresa && (
              <p className="text-xs text-destructive">
                {errors.nombreEmpresa.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL del logo (opcional)</Label>
            <Input
              id="logoUrl"
              placeholder="https://..."
              {...register("logoUrl")}
            />
            {errors.logoUrl && (
              <p className="text-xs text-destructive">{errors.logoUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema">Tema por defecto</Label>
            <Controller
              control={control}
              name="tema"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="tema" className="sm:w-[240px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <span className="flex items-center gap-2">
                        <Sun className="h-4 w-4" /> Claro
                      </span>
                    </SelectItem>
                    <SelectItem value="dark">
                      <span className="flex items-center gap-2">
                        <Moon className="h-4 w-4" /> Oscuro
                      </span>
                    </SelectItem>
                    <SelectItem value="system">
                      <span className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" /> Sistema
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
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
