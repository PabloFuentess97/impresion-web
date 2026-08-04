"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, StickyNote } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { RichTextEditor } from "@/components/incidencias/rich-text-editor";
import { guardarNotasProyecto } from "@/actions/proyecto.actions";
import { sanitizarHtml } from "@/lib/sanitize";

interface ProyectoNotasProps {
  proyectoId: string;
  notas: string | null;
  /** Si el proyecto está bloqueado, las notas son de solo lectura. */
  bloqueado: boolean;
}

/**
 * Editor de notas enriquecidas (WYSIWYG) de un proyecto.
 *
 * Reutiliza el editor Tiptap de las incidencias. Cuando el proyecto está
 * bloqueado, muestra el contenido en modo solo lectura.
 */
export function ProyectoNotas({
  proyectoId,
  notas,
  bloqueado,
}: ProyectoNotasProps) {
  const router = useRouter();
  const inicial = notas ?? "";
  const [valor, setValor] = React.useState(inicial);
  const [guardando, setGuardando] = React.useState(false);

  const hayCambios = valor !== inicial;

  async function guardar() {
    setGuardando(true);
    const resultado = await guardarNotasProyecto(proyectoId, { notas: valor });
    setGuardando(false);

    if (resultado.success) {
      toast.success(resultado.message ?? "Notas guardadas.");
      router.refresh();
    } else {
      toast.error(resultado.message);
    }
  }

  // Modo solo lectura (proyecto bloqueado).
  if (bloqueado) {
    if (!inicial || inicial === "<p></p>") {
      return (
        <EmptyState
          icono={<StickyNote />}
          titulo="Sin notas"
          descripcion="Este proyecto está bloqueado y no tiene notas registradas."
        />
      );
    }
    return (
      <Card className="p-6">
        <div
          className="prosa max-w-none text-sm text-foreground"
          dangerouslySetInnerHTML={{ __html: sanitizarHtml(inicial) }}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Anota lo que necesites sobre este proyecto: instrucciones, materiales,
        acabados… El texto admite formato enriquecido.
      </p>

      <RichTextEditor
        valor={valor}
        onChange={setValor}
        placeholder="Escribe las notas del proyecto…"
      />

      <div className="flex items-center justify-end gap-2">
        {hayCambios && (
          <span className="text-xs text-muted-foreground">Cambios sin guardar</span>
        )}
        <Button onClick={guardar} disabled={guardando || !hayCambios} size="sm">
          {guardando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar notas
        </Button>
      </div>
    </div>
  );
}
