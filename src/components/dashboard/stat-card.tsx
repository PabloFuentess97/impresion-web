import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  titulo: string;
  valor: string | number;
  icono: React.ReactNode;
  descripcion?: string;
  acento?: "primary" | "success" | "warning" | "destructive";
}

const acentos = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

/** Tarjeta estadística del dashboard. */
export function StatCard({
  titulo,
  valor,
  icono,
  descripcion,
  acento = "primary",
}: StatCardProps) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {valor}
          </p>
          {descripcion && (
            <p className="text-xs text-muted-foreground">{descripcion}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl [&_svg]:h-5 [&_svg]:w-5",
            acentos[acento],
          )}
        >
          {icono}
        </div>
      </div>
    </Card>
  );
}
