"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Frontera de error para el panel. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en el panel:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Algo salió mal</h1>
      <p className="max-w-md text-muted-foreground">
        Se produjo un error al cargar esta sección. Puedes intentarlo de nuevo.
      </p>
      <Button onClick={reset} className="mt-2">
        <RotateCcw className="h-4 w-4" /> Reintentar
      </Button>
    </div>
  );
}
