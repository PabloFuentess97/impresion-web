"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Boxes, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { actualizarModulo } from "@/actions/configuracion.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { ClaveModulo } from "@/lib/modules";

interface ModuloItem {
  id: string;
  clave: ClaveModulo;
  label: string;
  descripcion: string;
  activo: boolean;
}

interface ModulosFormProps {
  modulos: ModuloItem[];
}

/** Panel para activar o desactivar módulos funcionales desde base de datos. */
export function ModulosForm({ modulos }: ModulosFormProps) {
  const router = useRouter();
  const [pendiente, setPendiente] = React.useState<ClaveModulo | null>(null);
  const [estadoLocal, setEstadoLocal] = React.useState(() =>
    Object.fromEntries(modulos.map((modulo) => [modulo.clave, modulo.activo])) as Record<
      ClaveModulo,
      boolean
    >,
  );

  async function cambiarModulo(clave: ClaveModulo, activo: boolean) {
    const anterior = estadoLocal[clave];
    setEstadoLocal((prev) => ({ ...prev, [clave]: activo }));
    setPendiente(clave);

    const resultado = await actualizarModulo({ clave, activo });
    setPendiente(null);

    if (resultado.success) {
      toast.success(resultado.message ?? "Módulo actualizado.");
      router.refresh();
    } else {
      setEstadoLocal((prev) => ({ ...prev, [clave]: anterior }));
      toast.error(resultado.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Boxes className="h-5 w-5 text-primary" /> Módulos de la aplicación
        </CardTitle>
        <CardDescription>
          Activa o desactiva secciones completas del panel. Configuración y
          usuarios permanecen siempre disponibles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {modulos.map((modulo) => {
          const cargando = pendiente === modulo.clave;
          return (
            <div
              key={modulo.clave}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{modulo.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {modulo.descripcion}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {cargando && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <Switch
                  checked={estadoLocal[modulo.clave]}
                  disabled={cargando}
                  onCheckedChange={(activo) => void cambiarModulo(modulo.clave, activo)}
                  aria-label={`Cambiar estado de ${modulo.label}`}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
