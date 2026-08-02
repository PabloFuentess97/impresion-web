"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { QrCode, Copy, Printer, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { regenerarTokenRecogida } from "@/actions/recogida.actions";

interface RecogidaQrProps {
  url: string | null;
  dataUrl: string | null;
}

/** Tarjeta con el QR del formulario público: copiar, imprimir y regenerar. */
export function RecogidaQr({ url, dataUrl }: RecogidaQrProps) {
  const router = useRouter();
  const [generando, setGenerando] = React.useState(false);

  async function generar() {
    setGenerando(true);
    try {
      const r = await regenerarTokenRecogida();
      if (r.success) {
        toast.success(r.message ?? "QR generado.");
        router.refresh();
      } else {
        toast.error(r.message);
      }
    } finally {
      setGenerando(false);
    }
  }

  async function copiar() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado.");
    } catch {
      toast.error("No se pudo copiar el enlace.");
    }
  }

  function imprimir() {
    if (!dataUrl) return;
    const ventana = window.open("", "_blank", "width=480,height=640");
    if (!ventana) return;
    ventana.document.write(
      `<html><head><title>QR de recogidas</title></head>
       <body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
         <h2 style="margin-bottom:8px;">Registro de recogidas</h2>
         <p style="margin:0 0 16px;color:#555;">Escanea para registrar tu recogida</p>
         <img src="${dataUrl}" alt="QR" style="width:320px;height:320px;" />
       </body></html>`,
    );
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" /> Código QR para trabajadores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {url && dataUrl ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="rounded-xl border border-border bg-white p-3">
              {/* dataUrl es una imagen embebida (base64), no requiere dominio. */}
              <Image
                src={dataUrl}
                alt="Código QR del formulario de recogidas"
                width={192}
                height={192}
                unoptimized
                className="h-48 w-48"
              />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                Imprime este QR y colócalo en el taller. Los trabajadores lo
                escanean y registran sus recogidas (quedan pendientes de tu
                aprobación).
              </p>
              <div className="break-all rounded-lg border border-border bg-muted/40 p-2 font-mono text-xs text-muted-foreground">
                {url}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={copiar}>
                  <Copy className="h-4 w-4" /> Copiar enlace
                </Button>
                <Button variant="outline" size="sm" onClick={imprimir}>
                  <Printer className="h-4 w-4" /> Imprimir
                </Button>
                <ConfirmDialog
                  titulo="Regenerar QR"
                  descripcion="Se creará un enlace nuevo y el QR anterior dejará de funcionar. Tendrás que volver a imprimir y colocar el nuevo."
                  textoConfirmar="Regenerar"
                  onConfirm={generar}
                  trigger={
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4" /> Regenerar
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              Aún no has generado el QR. Genera uno para que los trabajadores
              puedan registrar recogidas.
            </p>
            <Button onClick={generar} disabled={generando}>
              {generando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4" />
              )}
              Generar QR
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
