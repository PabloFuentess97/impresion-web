"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { configurarTintas } from "@/actions/tinta.actions";
import { NUMEROS_TINTAS } from "@/validators/tinta.validator";

/** Botones para la configuración inicial de tintas (estado vacío). */
export function ConfigurarTintasInicial() {
  const router = useRouter();
  const [cargando, setCargando] = React.useState<number | null>(null);

  async function configurar(numero: number) {
    setCargando(numero);
    const resultado = await configurarTintas({ numero });
    setCargando(null);
    if (resultado.success) {
      toast.success(resultado.message ?? "Tintas configuradas.");
      router.refresh();
    } else {
      toast.error(resultado.message);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {NUMEROS_TINTAS.map((n) => (
        <Button
          key={n}
          variant="outline"
          onClick={() => configurar(n)}
          disabled={cargando !== null}
        >
          {cargando === n && <Loader2 className="h-4 w-4 animate-spin" />}
          {n} tintas
        </Button>
      ))}
    </div>
  );
}
