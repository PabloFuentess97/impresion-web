"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Grip,
  Layers,
  Map,
  Package,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  actualizarEstancia,
  actualizarZona,
  actualizarZonaPosicion,
  crearEstancia,
  crearZona,
  eliminarEstancia,
  eliminarUbicacion,
  eliminarZona,
  guardarUbicacion,
} from "@/actions/mapa.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

type Ubicacion = {
  id: string;
  cantidad: number | null;
  nota: string | null;
  impresion: {
    id: string;
    nombre: string;
    cantidad: number;
    proyecto: { id: string; titulo: string };
  };
};

type Zona = {
  id: string;
  nombre: string;
  descripcion: string | null;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  color: string;
  ubicaciones: Ubicacion[];
};

type Estancia = {
  id: string;
  nombre: string;
  descripcion: string | null;
  ancho: number;
  alto: number;
  zonas: Zona[];
};

type ImpresionMapa = {
  id: string;
  nombre: string;
  cantidad: number;
  proyecto: { id: string; titulo: string };
  ubicaciones: { id: string }[];
};

interface MapaVisualProps {
  estancias: Estancia[];
  impresiones: ImpresionMapa[];
  impresionesSinUbicar: ImpresionMapa[];
}

const COLORES = [
  "#6366F1",
  "#0EA5E9",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#64748B",
  "#14B8A6",
];

function toPct(valor: number, max: number) {
  return Math.max(0, Math.min(100, (valor / max) * 100));
}

function clampRect(rect: Pick<Zona, "x" | "y" | "ancho" | "alto">) {
  const ancho = Math.max(1, Math.min(100, rect.ancho));
  const alto = Math.max(1, Math.min(100, rect.alto));
  return {
    x: Math.max(0, Math.min(100 - ancho, rect.x)),
    y: Math.max(0, Math.min(100 - alto, rect.y)),
    ancho,
    alto,
  };
}

function cx(color: string, alpha: string) {
  return `${color}${alpha}`;
}

export function MapaVisual({
  estancias,
  impresiones,
  impresionesSinUbicar,
}: MapaVisualProps) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();
  const [estanciaActivaId, setEstanciaActivaId] = React.useState(
    estancias[0]?.id ?? "",
  );
  const [dibujando, setDibujando] = React.useState(false);
  const [rectNuevo, setRectNuevo] = React.useState<{
    x: number;
    y: number;
    ancho: number;
    alto: number;
  } | null>(null);
  const [drag, setDrag] = React.useState<{
    tipo: "mover" | "resize";
    zonaId: string;
    startX: number;
    startY: number;
    original: Pick<Zona, "x" | "y" | "ancho" | "alto">;
  } | null>(null);
  const [zonaLocal, setZonaLocal] = React.useState<Record<string, Pick<Zona, "x" | "y" | "ancho" | "alto">>>({});
  const [modalEstancia, setModalEstancia] = React.useState<Estancia | "nueva" | null>(null);
  const [modalZona, setModalZona] = React.useState<Zona | "nueva" | null>(null);
  const [modalAsignar, setModalAsignar] = React.useState<Zona | null>(null);

  const estanciaActiva =
    estancias.find((estancia) => estancia.id === estanciaActivaId) ??
    estancias[0] ??
    null;

  React.useEffect(() => {
    if (!estanciaActivaId && estancias[0]) setEstanciaActivaId(estancias[0].id);
  }, [estanciaActivaId, estancias]);

  function puntoDesdeEvento(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: toPct(event.clientX - rect.left, rect.width),
      y: toPct(event.clientY - rect.top, rect.height),
    };
  }

  async function ejecutar(
    accion: () => Promise<{ success: boolean; message?: string }>,
    ok = "Guardado.",
  ) {
    startTransition(async () => {
      const resultado = await accion();
      if (resultado.success) {
        toast.success(resultado.message ?? ok);
        router.refresh();
      } else {
        toast.error(resultado.message);
      }
    });
  }

  function guardarPosicionZona(zonaId: string, rect: Pick<Zona, "x" | "y" | "ancho" | "alto">) {
    const ajustado = clampRect(rect);
    setZonaLocal((prev) => ({ ...prev, [zonaId]: ajustado }));
    void ejecutar(() => actualizarZonaPosicion(zonaId, ajustado), "Ubicación guardada.");
  }

  function onCanvasPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (!dibujando || !estanciaActiva) return;
    const punto = puntoDesdeEvento(event);
    setRectNuevo({ x: punto.x, y: punto.y, ancho: 0.1, alto: 0.1 });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onCanvasPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (rectNuevo) {
      const punto = puntoDesdeEvento(event);
      setRectNuevo(
        clampRect({
          x: Math.min(rectNuevo.x, punto.x),
          y: Math.min(rectNuevo.y, punto.y),
          ancho: Math.abs(punto.x - rectNuevo.x),
          alto: Math.abs(punto.y - rectNuevo.y),
        }),
      );
      return;
    }

    if (!drag) return;
    const punto = puntoDesdeEvento(event);
    const dx = punto.x - drag.startX;
    const dy = punto.y - drag.startY;
    const siguiente =
      drag.tipo === "mover"
        ? clampRect({
            ...drag.original,
            x: drag.original.x + dx,
            y: drag.original.y + dy,
          })
        : clampRect({
            ...drag.original,
            ancho: drag.original.ancho + dx,
            alto: drag.original.alto + dy,
          });
    setZonaLocal((prev) => ({ ...prev, [drag.zonaId]: siguiente }));
  }

  function onCanvasPointerUp() {
    if (rectNuevo) {
      if (rectNuevo.ancho >= 3 && rectNuevo.alto >= 3) {
        setModalZona("nueva");
      } else {
        toast.info("Dibuja una zona un poco más grande.");
      }
      setDibujando(false);
      return;
    }

    if (drag) {
      const rect = zonaLocal[drag.zonaId] ?? drag.original;
      guardarPosicionZona(drag.zonaId, rect);
      setDrag(null);
    }
  }

  if (estancias.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Map className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Crea la primera estancia</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Empieza creando una sala o almacén. Después podrás dibujar zonas y ubicar
          impresiones de tus proyectos.
        </p>
        <Button className="mt-5" onClick={() => setModalEstancia("nueva")}>
          <Plus className="h-4 w-4" /> Nueva estancia
        </Button>
        <EstanciaDialog estancia={modalEstancia} onOpenChange={setModalEstancia} />
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <Card className="p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Estancias</p>
            <Button size="icon" variant="outline" onClick={() => setModalEstancia("nueva")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {estancias.map((estancia) => (
              <button
                key={estancia.id}
                onClick={() => setEstanciaActivaId(estancia.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  estancia.id === estanciaActivaId
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <span className="truncate">{estancia.nombre}</span>
                <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs">
                  {estancia.zonas.length}
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Sin ubicación</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            No es obligatorio ubicar impresiones, pero se recomienda para saber
            dónde está cada lote.
          </p>
          <div className="mt-3 rounded-lg border border-dashed border-border p-3">
            <p className="text-2xl font-semibold">
              {impresionesSinUbicar.length}
            </p>
            <p className="text-xs text-muted-foreground">
              impresiones pendientes de ubicar
            </p>
          </div>
        </Card>
      </aside>

      <section className="space-y-4">
        {estanciaActiva && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{estanciaActiva.nombre}</h2>
                <p className="text-sm text-muted-foreground">
                  {estanciaActiva.descripcion ||
                    "Dibuja zonas y asigna impresiones a cada ubicación."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={dibujando ? "default" : "outline"}
                  onClick={() => {
                    setDibujando((v) => !v);
                    setRectNuevo(null);
                  }}
                >
                  <Layers className="h-4 w-4" />
                  {dibujando ? "Dibuja sobre el mapa" : "Dibujar zona"}
                </Button>
                <Button variant="outline" onClick={() => setModalEstancia(estanciaActiva)}>
                  <Edit3 className="h-4 w-4" /> Editar estancia
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                {dibujando
                  ? "Arrastra en una zona vacía para crear un área de almacenaje."
                  : "Arrastra una zona para moverla. Usa la esquina inferior derecha para redimensionar."}
              </div>
              <div
                className="relative bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px]"
                style={{ aspectRatio: `${estanciaActiva.ancho} / ${estanciaActiva.alto}` }}
              >
                <svg
                  className="h-full w-full touch-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  onPointerDown={onCanvasPointerDown}
                  onPointerMove={onCanvasPointerMove}
                  onPointerUp={onCanvasPointerUp}
                  onPointerCancel={() => {
                    setDrag(null);
                    setRectNuevo(null);
                  }}
                >
                  {estanciaActiva.zonas.map((zona) => {
                    const rect = zonaLocal[zona.id] ?? zona;
                    return (
                      <g key={zona.id}>
                        <rect
                          x={rect.x}
                          y={rect.y}
                          width={rect.ancho}
                          height={rect.alto}
                          rx="1.2"
                          fill={cx(zona.color, "24")}
                          stroke={zona.color}
                          strokeWidth="0.45"
                          className="cursor-move transition-opacity hover:opacity-90"
                          onPointerDown={(event) => {
                            if (dibujando) return;
                            event.stopPropagation();
                            const svg = event.currentTarget.ownerSVGElement;
                            if (!svg) return;
                            const bounds = svg.getBoundingClientRect();
                            setDrag({
                              tipo: "mover",
                              zonaId: zona.id,
                              startX: toPct(event.clientX - bounds.left, bounds.width),
                              startY: toPct(event.clientY - bounds.top, bounds.height),
                              original: rect,
                            });
                          }}
                        />
                        <rect
                          x={rect.x + rect.ancho - 2.2}
                          y={rect.y + rect.alto - 2.2}
                          width="2.2"
                          height="2.2"
                          rx="0.5"
                          fill={zona.color}
                          className="cursor-nwse-resize"
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            const svg = event.currentTarget.ownerSVGElement;
                            if (!svg) return;
                            const bounds = svg.getBoundingClientRect();
                            setDrag({
                              tipo: "resize",
                              zonaId: zona.id,
                              startX: toPct(event.clientX - bounds.left, bounds.width),
                              startY: toPct(event.clientY - bounds.top, bounds.height),
                              original: rect,
                            });
                          }}
                        />
                        <foreignObject
                          x={rect.x + 1}
                          y={rect.y + 1}
                          width={Math.max(1, rect.ancho - 2)}
                          height={Math.max(1, rect.alto - 2)}
                          className="pointer-events-none"
                        >
                          <div className="flex h-full flex-col overflow-hidden rounded-md p-2">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {zona.nombre}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {zona.ubicaciones.length} ubicación
                              {zona.ubicaciones.length === 1 ? "" : "es"}
                            </p>
                          </div>
                        </foreignObject>
                        <foreignObject
                          x={rect.x + rect.ancho - 12}
                          y={rect.y + 1}
                          width="11"
                          height="5"
                        >
                          <button
                            className="pointer-events-auto flex h-full w-full items-center justify-center rounded bg-background/90 text-xs shadow-sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              setModalZona(zona);
                            }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </foreignObject>
                      </g>
                    );
                  })}

                  {rectNuevo && (
                    <rect
                      x={rectNuevo.x}
                      y={rectNuevo.y}
                      width={rectNuevo.ancho}
                      height={rectNuevo.alto}
                      rx="1.2"
                      fill="hsl(var(--primary) / 0.16)"
                      stroke="hsl(var(--primary))"
                      strokeDasharray="1.5 1.5"
                      strokeWidth="0.45"
                    />
                  )}
                </svg>
              </div>
            </Card>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {estanciaActiva.zonas.map((zona) => (
                <Card key={zona.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: zona.color }}
                        />
                        <h3 className="truncate font-semibold">{zona.nombre}</h3>
                      </div>
                      {zona.descripcion && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {zona.descripcion}
                        </p>
                      )}
                    </div>
                    <Button size="icon" variant="outline" onClick={() => setModalZona(zona)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {zona.ubicaciones.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                        Sin impresiones asignadas.
                      </p>
                    ) : (
                      zona.ubicaciones.map((ubicacion) => (
                        <div
                          key={ubicacion.id}
                          className="flex items-start justify-between gap-2 rounded-lg bg-muted/60 p-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {ubicacion.impresion.nombre}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {ubicacion.impresion.proyecto.titulo}
                              {ubicacion.cantidad ? ` · ${ubicacion.cantidad} uds.` : ""}
                            </p>
                          </div>
                          <button
                            className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-destructive"
                            onClick={() => void ejecutar(() => eliminarUbicacion(ubicacion.id))}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <Button
                    className="mt-4 w-full"
                    variant="outline"
                    onClick={() => setModalAsignar(zona)}
                  >
                    <Plus className="h-4 w-4" /> Asignar impresión
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      <EstanciaDialog estancia={modalEstancia} onOpenChange={setModalEstancia} />
      <ZonaDialog
        zona={modalZona}
        estanciaId={estanciaActiva?.id ?? ""}
        rectNuevo={rectNuevo}
        onOpenChange={(value) => {
          setModalZona(value);
          if (!value) setRectNuevo(null);
        }}
      />
      <AsignarDialog
        zona={modalAsignar}
        impresiones={impresiones}
        onOpenChange={setModalAsignar}
      />
    </div>
  );
}

function EstanciaDialog({
  estancia,
  onOpenChange,
}: {
  estancia: Estancia | "nueva" | null;
  onOpenChange: (value: Estancia | "nueva" | null) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const abierta = Boolean(estancia);
  const actual = estancia && estancia !== "nueva" ? estancia : null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = {
      nombre: String(form.get("nombre") ?? ""),
      descripcion: String(form.get("descripcion") ?? ""),
      ancho: Number(form.get("ancho") ?? 1200),
      alto: Number(form.get("alto") ?? 800),
    };

    startTransition(async () => {
      const resultado = actual
        ? await actualizarEstancia(actual.id, input)
        : await crearEstancia(input);
      if (resultado.success) {
        toast.success(resultado.message);
        onOpenChange(null);
        router.refresh();
      } else {
        toast.error(resultado.message);
      }
    });
  }

  return (
    <Dialog open={abierta} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actual ? "Editar estancia" : "Nueva estancia"}</DialogTitle>
          <DialogDescription>
            Crea una sala o almacén donde dibujarás zonas de almacenaje.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre-estancia">Nombre</Label>
            <Input id="nombre-estancia" name="nombre" defaultValue={actual?.nombre ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion-estancia">Descripción</Label>
            <Textarea
              id="descripcion-estancia"
              name="descripcion"
              defaultValue={actual?.descripcion ?? ""}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ancho-estancia">Ancho</Label>
              <Input id="ancho-estancia" name="ancho" type="number" defaultValue={actual?.ancho ?? 1200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alto-estancia">Alto</Label>
              <Input id="alto-estancia" name="alto" type="number" defaultValue={actual?.alto ?? 800} />
            </div>
          </div>
          <DialogFooter>
            {actual && (
              <ConfirmDialog
                titulo="Eliminar estancia"
                descripcion="Se eliminarán también sus zonas y ubicaciones. Esta acción no se puede deshacer."
                trigger={
                  <Button type="button" variant="destructive">
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </Button>
                }
                onConfirm={async () => {
                  const resultado = await eliminarEstancia(actual.id);
                  if (resultado.success) {
                    toast.success(resultado.message);
                    onOpenChange(null);
                    router.refresh();
                  } else {
                    toast.error(resultado.message);
                  }
                }}
              />
            )}
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" /> Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ZonaDialog({
  zona,
  estanciaId,
  rectNuevo,
  onOpenChange,
}: {
  zona: Zona | "nueva" | null;
  estanciaId: string;
  rectNuevo: Pick<Zona, "x" | "y" | "ancho" | "alto"> | null;
  onOpenChange: (value: Zona | "nueva" | null) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const abierta = Boolean(zona);
  const actual = zona && zona !== "nueva" ? zona : null;
  const rect = actual ?? rectNuevo ?? { x: 8, y: 8, ancho: 22, alto: 16 };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = {
      estanciaId,
      nombre: String(form.get("nombre") ?? ""),
      descripcion: String(form.get("descripcion") ?? ""),
      color: String(form.get("color") ?? "#6366F1"),
      x: Number(form.get("x") ?? rect.x),
      y: Number(form.get("y") ?? rect.y),
      ancho: Number(form.get("ancho") ?? rect.ancho),
      alto: Number(form.get("alto") ?? rect.alto),
    };

    startTransition(async () => {
      const resultado = actual
        ? await actualizarZona(actual.id, input)
        : await crearZona(input);
      if (resultado.success) {
        toast.success(resultado.message);
        onOpenChange(null);
        router.refresh();
      } else {
        toast.error(resultado.message);
      }
    });
  }

  return (
    <Dialog open={abierta} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actual ? "Editar zona" : "Nueva zona"}</DialogTitle>
          <DialogDescription>
            Ajusta el nombre, color y tamaño de la zona del mapa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre-zona">Nombre</Label>
            <Input id="nombre-zona" name="nombre" defaultValue={actual?.nombre ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion-zona">Descripción</Label>
            <Textarea
              id="descripcion-zona"
              name="descripcion"
              defaultValue={actual?.descripcion ?? ""}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORES.map((color) => (
                <label key={color} className="cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    defaultChecked={(actual?.color ?? "#6366F1") === color}
                    className="peer sr-only"
                  />
                  <span
                    className="block h-8 w-8 rounded-lg border border-border ring-offset-background peer-checked:ring-2 peer-checked:ring-ring peer-checked:ring-offset-2"
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["x", "y", "ancho", "alto"] as const).map((campo) => (
              <div key={campo} className="space-y-2">
                <Label htmlFor={`zona-${campo}`}>{campo.toUpperCase()} %</Label>
                <Input
                  id={`zona-${campo}`}
                  name={campo}
                  type="number"
                  step="0.1"
                  defaultValue={Number(rect[campo]).toFixed(1)}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            {actual && (
              <ConfirmDialog
                titulo="Eliminar zona"
                descripcion="Se retirarán las ubicaciones asociadas a esta zona."
                trigger={
                  <Button type="button" variant="destructive">
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </Button>
                }
                onConfirm={async () => {
                  const resultado = await eliminarZona(actual.id);
                  if (resultado.success) {
                    toast.success(resultado.message);
                    onOpenChange(null);
                    router.refresh();
                  } else {
                    toast.error(resultado.message);
                  }
                }}
              />
            )}
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" /> Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AsignarDialog({
  zona,
  impresiones,
  onOpenChange,
}: {
  zona: Zona | null;
  impresiones: ImpresionMapa[];
  onOpenChange: (value: Zona | null) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!zona) return;
    const form = new FormData(event.currentTarget);
    const input = {
      zonaId: zona.id,
      impresionId: String(form.get("impresionId") ?? ""),
      cantidad: form.get("cantidad") ? Number(form.get("cantidad")) : null,
      nota: String(form.get("nota") ?? ""),
    };

    startTransition(async () => {
      const resultado = await guardarUbicacion(input);
      if (resultado.success) {
        toast.success(resultado.message);
        onOpenChange(null);
        router.refresh();
      } else {
        toast.error(resultado.message);
      }
    });
  }

  return (
    <Dialog open={Boolean(zona)} onOpenChange={(open) => !open && onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar impresión</DialogTitle>
          <DialogDescription>
            Ubica una impresión en {zona?.nombre}. La cantidad es opcional por si
            solo quieres marcar la localización.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Impresión</Label>
            <Select name="impresionId" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una impresión" />
              </SelectTrigger>
              <SelectContent>
                {impresiones.map((impresion) => (
                  <SelectItem key={impresion.id} value={impresion.id}>
                    {impresion.proyecto.titulo} · {impresion.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cantidad-ubicacion">Cantidad opcional</Label>
            <Input id="cantidad-ubicacion" name="cantidad" type="number" min={1} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nota-ubicacion">Nota</Label>
            <Textarea id="nota-ubicacion" name="nota" rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || impresiones.length === 0}>
              <Grip className="h-4 w-4" /> Asignar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
