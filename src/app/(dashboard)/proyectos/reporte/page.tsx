import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  Clock,
  FileBarChart,
  Layers,
  Package,
  Truck,
} from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ModuloDesactivado } from "@/components/shared/modulo-desactivado";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProyectosReportExportButtons } from "@/components/proyectos/proyectos-report-export-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ESTADOS_PROYECTO, PRIORIDADES_PROYECTO } from "@/lib/constants";
import { obtenerEstadoModulo } from "@/lib/module-guard";
import { cn } from "@/lib/utils";
import {
  formatearFecha,
  formatearNumero,
  formatearTiempo,
} from "@/lib/format";
import { configuracionService } from "@/services/configuracion.service";
import { proyectoReporteService } from "@/services/proyecto-reporte.service";

export const metadata: Metadata = { title: "Reporte de proyectos" };

export default async function ReporteProyectosPage() {
  const modulo = await obtenerEstadoModulo("proyectos");
  if (!modulo.activo) return <ModuloDesactivado nombre={modulo.nombre} />;

  const [reporte, configuracion] = await Promise.all([
    proyectoReporteService.generar(),
    configuracionService.obtener(),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs
        items={[
          { label: "Proyectos", href: "/proyectos" },
          { label: "Reporte" },
        ]}
      />

      <PageHeader
        titulo="Reporte de proyectos"
        descripcion="Resumen completo de proyectos, impresiones, estadísticas, salidas y unidades restantes."
        accion={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/proyectos">
                <ArrowLeft className="h-4 w-4" /> Volver
              </Link>
            </Button>
            <ProyectosReportExportButtons
              reporte={reporte}
              nombreEmpresa={configuracion.nombreEmpresa}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          titulo="Proyectos"
          valor={formatearNumero(reporte.resumen.totalProyectos)}
          icono={<FileBarChart />}
        />
        <StatCard
          titulo="Impresiones"
          valor={formatearNumero(reporte.resumen.totalImpresiones)}
          icono={<Layers />}
          acento="success"
        />
        <StatCard
          titulo="Unidades impresas"
          valor={formatearNumero(reporte.resumen.cantidadImpresaTotal)}
          icono={<Package />}
        />
        <StatCard
          titulo="Tiempo total"
          valor={formatearTiempo(reporte.resumen.tiempoTotal)}
          icono={<Clock />}
          acento="success"
        />
        <StatCard
          titulo="Unidades salidas"
          valor={formatearNumero(reporte.resumen.cantidadSalidasTotal)}
          icono={<Truck />}
          acento="warning"
        />
        <StatCard
          titulo="Unidades restantes"
          valor={formatearNumero(reporte.resumen.unidadesRestantesTotal)}
          icono={<Boxes />}
          acento="primary"
        />
      </div>

      {reporte.proyectos.length === 0 ? (
        <EmptyState
          icono={<FileBarChart />}
          titulo="Sin proyectos"
          descripcion="Crea proyectos para poder generar estadísticas y reportes."
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="text-center">Objetivo</TableHead>
                  <TableHead className="text-center">Impreso</TableHead>
                  <TableHead className="text-center">Salidas</TableHead>
                  <TableHead className="text-center">Restantes</TableHead>
                  <TableHead className="text-center">Tiempo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reporte.proyectos.map((proyecto) => (
                  <TableRow key={proyecto.id}>
                    <TableCell>
                      <Link
                        href={`/proyectos/${proyecto.id}`}
                        className="font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {proyecto.titulo}
                      </Link>
                      {proyecto.descripcion && (
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                          {proyecto.descripcion}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "whitespace-nowrap",
                          ESTADOS_PROYECTO[proyecto.estado].color,
                        )}
                      >
                        {ESTADOS_PROYECTO[proyecto.estado].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "whitespace-nowrap",
                          PRIORIDADES_PROYECTO[proyecto.prioridad].color,
                        )}
                      >
                        {PRIORIDADES_PROYECTO[proyecto.prioridad].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {proyecto.cantidadProduccion == null
                        ? "Sin objetivo"
                        : formatearNumero(proyecto.cantidadProduccion)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatearNumero(proyecto.cantidadImpresa)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatearNumero(proyecto.cantidadSalidas)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={
                          proyecto.unidadesRestantes === 0
                            ? "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "border border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400"
                        }
                      >
                        {formatearNumero(proyecto.unidadesRestantes ?? 0)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {formatearTiempo(proyecto.tiempoTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Detalle por proyecto
              </h2>
            </div>

            {reporte.proyectos.map((proyecto) => {
              const impresiones = reporte.impresiones.filter(
                (impresion) => impresion.proyectoId === proyecto.id,
              );
              const salidas = reporte.salidas.filter(
                (salida) => salida.proyectoId === proyecto.id,
              );

              return (
                <Card key={proyecto.id} className="overflow-hidden">
                  <div className="border-b p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <Link
                          href={`/proyectos/${proyecto.id}`}
                          className="text-base font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {proyecto.titulo}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Creado el {formatearFecha(proyecto.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className={cn(ESTADOS_PROYECTO[proyecto.estado].color)}
                        >
                          {ESTADOS_PROYECTO[proyecto.estado].label}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={cn(
                            PRIORIDADES_PROYECTO[proyecto.prioridad].color,
                          )}
                        >
                          {PRIORIDADES_PROYECTO[proyecto.prioridad].label}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <DatoReporte
                        label="Objetivo"
                        valor={
                          proyecto.cantidadProduccion == null
                            ? "Sin objetivo"
                            : formatearNumero(proyecto.cantidadProduccion)
                        }
                      />
                      <DatoReporte
                        label="Impreso"
                        valor={formatearNumero(proyecto.cantidadImpresa)}
                      />
                      <DatoReporte
                        label="Salidas"
                        valor={formatearNumero(proyecto.cantidadSalidas)}
                      />
                      <DatoReporte
                        label="Restantes"
                        valor={formatearNumero(proyecto.unidadesRestantes ?? 0)}
                      />
                      <DatoReporte
                        label="Tiempo"
                        valor={formatearTiempo(proyecto.tiempoTotal)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-0 lg:grid-cols-2">
                    <div className="border-b p-5 lg:border-b-0 lg:border-r">
                      <h3 className="mb-3 text-sm font-semibold text-foreground">
                        Impresiones
                      </h3>
                      {impresiones.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Sin impresiones registradas.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Impresión</TableHead>
                              <TableHead className="text-center">Cantidad</TableHead>
                              <TableHead className="text-center">Tiempo</TableHead>
                              <TableHead>Fecha</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {impresiones.map((impresion) => (
                              <TableRow key={impresion.id}>
                                <TableCell className="font-medium">
                                  {impresion.nombre}
                                </TableCell>
                                <TableCell className="text-center">
                                  {formatearNumero(impresion.cantidad)}
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                  {formatearTiempo(impresion.tiempo)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatearFecha(impresion.fecha)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="mb-3 text-sm font-semibold text-foreground">
                        Salidas
                      </h3>
                      {salidas.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Sin salidas registradas.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Destino</TableHead>
                              <TableHead className="text-center">Unidades</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Nota</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {salidas.map((salida) => (
                              <TableRow key={salida.id}>
                                <TableCell className="font-medium">
                                  {salida.destino}
                                </TableCell>
                                <TableCell className="text-center">
                                  {formatearNumero(salida.cantidad)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatearFecha(salida.fecha)}
                                </TableCell>
                                <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                                  <span className="line-clamp-1">
                                    {salida.nota || "-"}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}

function DatoReporte({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{valor}</p>
    </div>
  );
}
