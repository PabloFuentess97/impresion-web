"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { aprobarRecogida, denegarRecogida } from "@/actions/recogida.actions";

interface RecogidaActionsProps {
  recogida: {
    id: string;
    nombre: string;
    unidades: number;
    proyectoTitulo: string;
  };
}

/** Botones de aprobar/denegar para una recogida pendiente. */
export function RecogidaActions({ recogida }: RecogidaActionsProps) {
  const router = useRouter();

  async function aprobar() {
    const r = await aprobarRecogida(recogida.id);
    if (r.success) {
      toast.success(r.message ?? "Recogida aprobada.");
      router.refresh();
    } else {
      toast.error(r.message);
    }
  }

  async function denegar() {
    const r = await denegarRecogida(recogida.id);
    if (r.success) {
      toast.success(r.message ?? "Recogida denegada.");
      router.refresh();
    } else {
      toast.error(r.message);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <ConfirmDialog
        titulo="Aprobar recogida"
        descripcion={`Se aprobará que ${recogida.nombre} coge ${recogida.unidades} unidades de "${recogida.proyectoTitulo}". Se descontarán del proyecto (se registrará como salida).`}
        textoConfirmar="Aprobar"
        variante="default"
        onConfirm={aprobar}
        trigger={
          <Button size="sm" className="h-8">
            <Check className="h-4 w-4" /> Aprobar
          </Button>
        }
      />
      <ConfirmDialog
        titulo="Denegar recogida"
        descripcion={`Se denegará la recogida de ${recogida.nombre}. No se descontará nada.`}
        textoConfirmar="Denegar"
        onConfirm={denegar}
        trigger={
          <Button variant="outline" size="sm" className="h-8">
            <X className="h-4 w-4" /> Denegar
          </Button>
        }
      />
    </div>
  );
}
