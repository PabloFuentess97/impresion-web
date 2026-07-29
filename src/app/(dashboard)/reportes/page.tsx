import type { Metadata } from "next";
import {
  FolderKanban,
  Layers,
  Package,
  Clock,
  AlertTriangle,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportFilters } from "@/components/reportes/report-filters";
import { ExportButtons } from "@/components/reportes/export-buttons";
import { EstadoBadge } from "@/components/incidencias/estado-badge";
import { reporteService } from "@/services/reporte.service";
import { configuracionService } from "@/services/configuracion.service";
import type { PeriodoReporte } from "@/lib/constants";
import {
  formatearFecha,
  formatearFechaLarga,
  formatearTiempo,
  formatearNumero,
} from "@/lib/format";
import { htmlATexto } from "@/lib/sanitize";

export const metadata: Metadata = { title: "Reportes" };

const ETIQUETA_PERIODO: Record<string, string> = {
  hoy: "Hoy",
  semana: "Esta semana",
  mes: "Este mes",
  personalizado: "Rango personalizado",
};

function ResumenItem({
  icono,
  label,
  valor,
}: {
  icono: React.ReactNode;
  label: string;
  valor: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:h-5 [&_svg]:w-5">
        {icono}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{valor}</p>
      </div>
    </div>
  );
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{
    periodo?: string;
    desde?: string;
    hasta?: string;
  }>;
}) {
  const params = await searchParams;
  const periodo = (params.periodo as PeriodoReporte) || "hoy";

  const [reporte, config] = await Promise.all([
    reporteService.generar(periodo, params.desde, params.hasta),
    configuracionService.obtener(),
  ]);

  const sinDatos =
    reporte.proyectos.length === 0 &&
    reporte.impresiones.length === 0 &&
    reporte.incidencias.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Reportes"
        descripcion="Genera reportes de actividad por período y expórtalos."
        accion={
          <ExportButtons reporte={reporte} nombreEmpresa={config.nombreEmpresa} />
        }
      />

      <ReportFilters />

      {/* Cabecera del reporte (visible también al imprimir) */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {config.nombreEmpresa}
            </h2>
            <p className="text-sm text-muted-foreground">
              Reporte · {ETIQUETA_PERIODO[periodo] ?? periodo}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatearFechaLarga(reporte.desde)} — {formatearFechaLarga(reporte.hasta)}
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <ResumenItem
          icono={<FolderKanban />}
          label="Proyectos"
          valor={reporte.resumen.totalProyectos}
        />
        <ResumenItem
          icono={<Layers />}
          label="Impresiones"
          valor={reporte.resumen.totalImpresiones}
        />
        <ResumenItem
          icono={<Package />}
          label="Unidades"
          valor={formatearNumero(reporte.resumen.cantidadTotal)}
        />
        <ResumenItem
          icono={<Clock />}
          label="Tiempo"
          valor={formatearTiempo(reporte.resumen.tiempoTotal)}
        />
        <ResumenItem
          icono={<AlertTriangle />}
          label="Incidencias"
          valor={reporte.resumen.totalIncidencias}
        />
      </div>

      {sinDatos ? (
        <EmptyState
          icono={<FolderKanban />}
          titulo="Sin actividad en este período"
          descripcion="No se registró actividad en el rango seleccionado. Prueba con otro período."
        />
      ) : (
        <div className="space-y-8">
          {/* Proyectos modificados */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Proyectos modificados
            </h3>
            {reporte.proyectos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ningún proyecto tuvo actividad.
              </p>
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proyecto</TableHead>
                      <TableHead className="text-center">Impresiones</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-center">Tiempo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporte.proyectos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.titulo}</TableCell>
                        <TableCell className="text-center">
                          {p.totalImpresiones}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatearNumero(p.cantidadTotal)}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {formatearTiempo(p.tiempoTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </section>

          {/* Impresiones realizadas */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Impresiones realizadas
            </h3>
            {reporte.impresiones.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se realizaron impresiones.
              </p>
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Impresión</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-center">Tiempo</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporte.impresiones.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="text-muted-foreground">
                          {i.proyecto}
                        </TableCell>
                        <TableCell className="font-medium">{i.impresion}</TableCell>
                        <TableCell className="text-center">
                          {formatearNumero(i.cantidad)}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {formatearTiempo(i.tiempo)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatearFecha(i.fecha)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </section>

          {/* Incidencias */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Incidencias</h3>
            {reporte.incidencias.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No se registraron incidencias.
              </p>
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reporte.incidencias.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.titulo}</TableCell>
                        <TableCell>
                          <EstadoBadge estado={i.estado} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatearFecha(i.fecha)}
                        </TableCell>
                        <TableCell className="max-w-[280px]">
                          <span className="line-clamp-2 text-sm text-muted-foreground">
                            {htmlATexto(i.descripcion)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
