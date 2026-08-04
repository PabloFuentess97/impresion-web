import type { Metadata } from "next";
import { normalizarTamanoPagina } from "@/lib/constants";
import Link from "next/link";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { PackageCheck, Inbox } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ModuloDesactivado } from "@/components/shared/modulo-desactivado";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecogidaQr } from "@/components/recogidas/recogida-qr";
import { RecogidaActions } from "@/components/recogidas/recogida-actions";
import { recogidaService, type FiltroEstadoRecogida } from "@/services/recogida.service";
import { configuracionService } from "@/services/configuracion.service";
import { obtenerEstadoModulo } from "@/lib/module-guard";
import { formatearFecha, formatearNumero } from "@/lib/format";
import type { EstadoRecogida } from "@/types";

export const metadata: Metadata = { title: "Recogidas" };

const FILTROS: { value: FiltroEstadoRecogida; label: string }[] = [
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "APROBADA", label: "Aprobadas" },
  { value: "DENEGADA", label: "Denegadas" },
  { value: "todas", label: "Todas" },
];

const ESTADO_ESTILO: Record<EstadoRecogida, string> = {
  PENDIENTE:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  APROBADA:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
  DENEGADA:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20",
};

const ESTADO_LABEL: Record<EstadoRecogida, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  DENEGADA: "Denegada",
};

export default async function RecogidasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; pagina?: string; tamano?: string }>;
}) {
  const modulo = await obtenerEstadoModulo("recogidas");
  if (!modulo.activo) return <ModuloDesactivado nombre={modulo.nombre} />;

  const params = await searchParams;
  const estado = (
    ["PENDIENTE", "APROBADA", "DENEGADA", "todas"].includes(params.estado ?? "")
      ? params.estado
      : "PENDIENTE"
  ) as FiltroEstadoRecogida;
  const pagina = Number(params.pagina) || 1;
  const tamano = normalizarTamanoPagina(params.tamano);

  const [{ items, total, totalPaginas }, config, pendientes] = await Promise.all([
    recogidaService.listar({ estado, pagina, tamano }),
    configuracionService.obtener(),
    recogidaService.contarPendientes(),
  ]);

  // Construir la URL del formulario y el QR (imagen embebida) si hay token.
  let url: string | null = null;
  let dataUrl: string | null = null;
  if (config.recogidaToken) {
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    url = `${proto}://${host}/recoger?t=${config.recogidaToken}`;
    dataUrl = await QRCode.toDataURL(url, { width: 384, margin: 1 });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Recogidas"
        descripcion="Solicitudes de los trabajadores (vía QR). Apruébalas para descontarlas del proyecto."
      />

      <RecogidaQr url={url} dataUrl={dataUrl} />

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const activo = estado === f.value;
          const etiqueta =
            f.value === "PENDIENTE" && pendientes > 0
              ? `${f.label} (${pendientes})`
              : f.label;
          return (
            <Button
              key={f.value}
              asChild
              variant={activo ? "default" : "outline"}
              size="sm"
            >
              <Link href={`/recogidas?estado=${f.value}`}>{etiqueta}</Link>
            </Button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icono={<Inbox />}
          titulo="Sin recogidas"
          descripcion={
            estado === "PENDIENTE"
              ? "No hay recogidas pendientes de aprobar."
              : "No hay recogidas con este estado."
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Trabajador</TableHead>
                <TableHead className="text-center">Unidades</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatearFecha(r.fecha)}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {r.proyecto.titulo}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">
                      {r.nombre}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      NBI {r.nbi}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {formatearNumero(r.unidades)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_ESTILO[r.estado]}`}
                    >
                      {ESTADO_LABEL[r.estado]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {r.estado === "PENDIENTE" ? (
                      <RecogidaActions
                        recogida={{
                          id: r.id,
                          nombre: r.nombre,
                          unidades: r.unidades,
                          proyectoTitulo: r.proyecto.titulo,
                        }}
                      />
                    ) : (
                      <div className="text-right text-xs text-muted-foreground">
                        {r.resueltoEn ? formatearFecha(r.resueltoEn) : "—"}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {items.length > 0 && (
        <div className="flex justify-center">
          <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} tamano={tamano} />
        </div>
      )}
    </div>
  );
}
