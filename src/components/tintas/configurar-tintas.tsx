"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { configurarTintas } from "@/actions/tinta.actions";
import { NUMEROS_TINTAS } from "@/validators/tinta.validator";

/** Selector del número de tintas del sistema (4, 6 o 9). */
export function ConfigurarTintas({ actual }: { actual: number }) {
  const router = useRouter();
  const [pendiente, setPendiente] = React.useState<number | null>(null);
  const [aplicando, setAplicando] = React.useState(false);

  async function aplicar(numero: number) {
    setAplicando(true);
    const resultado = await configurarTintas({ numero });
    setAplicando(false);
    setPendiente(null);
    if (resultado.success) {
      toast.success(resultado.message ?? "Tintas configuradas.");
      router.refresh();
    } else {
      toast.error(resultado.message);
    }
  }

  function seleccionar(numero: number) {
    if (numero === actual) return;
    if (numero < actual) {
      // Reducir elimina tintas: pedir confirmación.
      setPendiente(numero);
    } else {
      aplicar(numero);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Nº de tintas:</span>
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {NUMEROS_TINTAS.map((n) => (
            <button
              key={n}
              onClick={() => seleccionar(n)}
              disabled={aplicando}
              className={cn(
                "h-8 w-10 rounded-md text-sm font-medium transition-colors",
                actual === n
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Dialog
        open={pendiente !== null}
        onOpenChange={(o) => !o && setPendiente(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reducir número de tintas</DialogTitle>
            <DialogDescription>
              Vas a pasar de {actual} a {pendiente} tintas. Se eliminarán las
              tintas sobrantes y su historial de niveles. Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendiente(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => pendiente !== null && aplicar(pendiente)}
              disabled={aplicando}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
