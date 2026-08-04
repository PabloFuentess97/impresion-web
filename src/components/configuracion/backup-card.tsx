"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  DatabaseBackup,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { restaurarBackup } from "@/actions/backup.actions";

const PALABRA_CONFIRMACION = "RESTAURAR";

interface BackupParseado {
  nombreArchivo: string;
  exportadoEl?: string;
  payload: unknown;
}

/** Tarjeta de copias de seguridad: descargar y restaurar. */
export function BackupCard() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [seleccion, setSeleccion] = React.useState<BackupParseado | null>(null);
  const [dialogo, setDialogo] = React.useState(false);
  const [texto, setTexto] = React.useState("");
  const [passwordActual, setPasswordActual] = React.useState("");
  const [restaurando, setRestaurando] = React.useState(false);

  function abrirSelector() {
    inputRef.current?.click();
  }

  async function alElegirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    // Permite volver a elegir el mismo archivo más tarde.
    e.target.value = "";
    if (!archivo) return;

    try {
      const contenido = await archivo.text();
      const payload = JSON.parse(contenido);
      if (!payload?.datos || typeof payload.datos !== "object") {
        toast.error("El archivo no parece una copia de seguridad válida.");
        return;
      }
      setSeleccion({
        nombreArchivo: archivo.name,
        exportadoEl: payload.exportadoEl,
        payload,
      });
      setTexto("");
      setPasswordActual("");
      setDialogo(true);
    } catch {
      toast.error("No se pudo leer el archivo (JSON no válido).");
    }
  }

  async function confirmarRestauracion() {
    if (!seleccion) return;
    setRestaurando(true);
    try {
      const resultado = await restaurarBackup({
        backup: seleccion.payload,
        confirmacion: texto.trim().toUpperCase(),
        passwordActual,
      });
      if (resultado.success) {
        toast.success(resultado.message ?? "Copia restaurada.");
        setDialogo(false);
        setSeleccion(null);
        setPasswordActual("");
        router.refresh();
      } else {
        toast.error(resultado.message);
      }
    } finally {
      setRestaurando(false);
    }
  }

  const puedeConfirmar =
    texto.trim().toUpperCase() === PALABRA_CONFIRMACION &&
    passwordActual.length > 0 &&
    !restaurando;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DatabaseBackup className="h-5 w-5 text-primary" /> Copias de seguridad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Descargar */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Descargar copia
          </p>
          <p className="text-sm text-muted-foreground">
            Genera un archivo con todos los datos (proyectos, impresiones,
            salidas, inventario, tintas, papel, incidencias…). Guárdalo en un
            lugar seguro.
          </p>
          <Button asChild variant="outline">
            <a href="/api/backup" download>
              <Download className="h-4 w-4" /> Descargar copia de seguridad
            </a>
          </Button>
        </div>

        <div className="border-t border-border" />

        {/* Restaurar */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Restaurar copia</p>
          <p className="text-sm text-muted-foreground">
            Sustituye <strong>todos</strong> los datos actuales por los del
            archivo. Úsalo con cuidado.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={alElegirArchivo}
          />
          <Button variant="outline" onClick={abrirSelector}>
            <Upload className="h-4 w-4" /> Seleccionar archivo…
          </Button>
        </div>
      </CardContent>

      {/* Diálogo de confirmación fuerte */}
      <Dialog open={dialogo} onOpenChange={setDialogo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Restaurar copia de seguridad</DialogTitle>
            <DialogDescription>
              Esta acción <strong>borrará todos los datos actuales</strong> y los
              reemplazará por los del archivo. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="truncate font-medium text-foreground">
                {seleccion?.nombreArchivo}
              </p>
              {seleccion?.exportadoEl && (
                <p className="text-xs text-muted-foreground">
                  Exportado el{" "}
                  {new Date(seleccion.exportadoEl).toLocaleString("es-ES")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmar-restaurar">
                Escribe <span className="font-mono">{PALABRA_CONFIRMACION}</span>{" "}
                para confirmar
              </Label>
              <Input
                id="confirmar-restaurar"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-restaurar">
                Contraseña actual del administrador
              </Label>
              <Input
                id="password-restaurar"
                type="password"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogo(false)}
              disabled={restaurando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarRestauracion}
              disabled={!puedeConfirmar}
            >
              {restaurando && <Loader2 className="h-4 w-4 animate-spin" />}
              Restaurar ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
