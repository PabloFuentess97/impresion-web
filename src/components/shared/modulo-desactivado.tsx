import { PowerOff } from "lucide-react";

import { Card } from "@/components/ui/card";

interface ModuloDesactivadoProps {
  nombre: string;
}

/** Pantalla mostrada cuando un módulo está desactivado desde Configuración. */
export function ModuloDesactivado({ nombre }: ModuloDesactivadoProps) {
  return (
    <Card className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <PowerOff className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-foreground">
        Módulo desactivado
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {nombre} está desactivado desde Configuración. Puedes volver a activarlo
        cuando lo necesites.
      </p>
    </Card>
  );
}
