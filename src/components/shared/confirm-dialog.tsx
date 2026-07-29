"use client";

import * as React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  titulo?: string;
  descripcion?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: "default" | "destructive";
  /** Callback ejecutado al confirmar. Puede ser asíncrono. */
  onConfirm: () => void | Promise<void>;
}

/**
 * Diálogo de confirmación reutilizable.
 * Se usa antes de acciones destructivas (eliminar) para evitar errores.
 */
export function ConfirmDialog({
  trigger,
  titulo = "¿Estás seguro?",
  descripcion = "Esta acción no se puede deshacer.",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  variante = "destructive",
  onConfirm,
}: ConfirmDialogProps) {
  const [abierto, setAbierto] = React.useState(false);
  const [cargando, setCargando] = React.useState(false);

  async function manejarConfirmar() {
    try {
      setCargando(true);
      await onConfirm();
      setAbierto(false);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setAbierto(false)}
            disabled={cargando}
          >
            {textoCancelar}
          </Button>
          <Button
            variant={variante}
            onClick={manejarConfirmar}
            disabled={cargando}
          >
            {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
            {textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
