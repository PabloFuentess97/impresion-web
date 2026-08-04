import type { Metadata } from "next";
import {
  ESTADOS_PROYECTO,
  PRIORIDADES_PROYECTO,
  normalizarTamanoPagina,
} from "@/lib/constants";
import { notFound } from "next/navigation";
import {
  Plus,
  Layers,
  Package,
  Clock,
  Pencil,
  Printer,
  Truck,
  Lock,
  FolderInput,
  Target,
  StickyNote,
  CalendarDays,
  Flag,
} from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ModuloDesactivado } from "@/components/shared/modulo-desactivado";
import { Pagination } from "@/components/shared/pagination";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProyectoFormDialog } from "@/components/proyectos/proyecto-form-dialog";
import { ProyectoNotas } from "@/components/proyectos/proyecto-notas";
import { ImpresionFormDialog } from "@/components/proyectos/impresion-form-dialog";
import { ImpresionActions } from "@/components/proyectos/impresion-actions";
import { SalidaFormDialog } from "@/components/salidas/salida-form-dialog";
import { SalidaActions } from "@/components/salidas/salida-actions";
import { proyectoService } from "@/services/proyecto.service";
import { salidaService } from "@/services/salida.service";
import { getSession } from "@/lib/session";
import { obtenerEstadoModulo } from "@/lib/module-guard";
import {
  formatearFecha,
  formatearFechaLarga,
  formatearTiempo,
  formatearNumero,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const proyecto = await proyectoService.obtener(id);
  return { title: proyecto?.titulo ?? "Proyecto" };
}

export default async function ProyectoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    tab?: string;
    impresionesPagina?: string;
    impresionesTamano?: string;
    salidasPagina?: string;
    salidasTamano?: string;
  }>;
}) {
  const modulo = await obtenerEstadoModulo("proyectos");
  if (!modulo.activo) return <ModuloDesactivado nombre={modulo.nombre} />;

  const { id } = await params;
  const query = await searchParams;
  const [proyecto, salidas, session] = await Promise.all([
    proyectoService.obtenerDetalle(id),
    salidaService.listarPorProyecto(id),
    getSession(),
  ]);

  if (!proyecto) notFound();

  const proyectosSelect = [{ id: proyecto.id, titulo: proyecto.titulo }];
  const totalSalidas = salidas.reduce((a, s) => a + s.cantidad, 0);
  const tabInicial = query.tab === "salidas" || query.tab === "notas" ? query.tab : "impresiones";
  const impresionesPagina = Number(query.impresionesPagina) || 1;
  const impresionesTamano = normalizarTamanoPagina(query.impresionesTamano);
  const salidasPagina = Number(query.salidasPagina) || 1;
  const salidasTamano = normalizarTamanoPagina(query.salidasTamano);
  const totalPaginasImpresiones = Math.max(
    1,
    Math.ceil(proyecto.impresiones.length / impresionesTamano),
  );
  const totalPaginasSalidas = Math.max(1, Math.ceil(salidas.length / salidasTamano));
  const impresionesPaginadas = proyecto.impresiones.slice(
    (impresionesPagina - 1) * impresionesTamano,
    impresionesPagina * impresionesTamano,
  );
  const salidasPaginadas = salidas.slice(
    (salidasPagina - 1) * salidasTamano,
    salidasPagina * salidasTamano,
  );
  const bloqueado = proyecto.bloqueado;
  const esLector = session?.user?.rol === "LECTOR";
  // El lector no puede modificar nada; se oculta todo lo editable.
  const soloLectura = bloqueado || esLector;

  // Progreso de producción: cantidad producida frente al objetivo (si existe).
  const objetivo = proyecto.cantidadProduccion;
  const progreso =
    objetivo && objetivo > 0
      ? Math.min(100, Math.round((proyecto.cantidadTotal / objetivo) * 100))
      : null;
  const completado = objetivo != null && proyecto.cantidadTotal >= objetivo;

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs
        items={[
          { label: "Proyectos", href: "/proyectos" },
          { label: proyecto.titulo },
        ]}
      />

      <PageHeader
        titulo={proyecto.titulo}
        descripcion={`Creado el ${formatearFechaLarga(proyecto.createdAt)}`}
        accion={
          soloLectura ? undefined : (
            <ProyectoFormDialog
              proyecto={proyecto}
              trigger={
                <Button variant="outline">
                  <Pencil className="h-4 w-4" /> Editar proyecto
                </Button>
              }
            />
          )
        }
      />

      {bloqueado && (
        <Badge
          variant="secondary"
          className="gap-1.5 border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400"
        >
          <Lock className="h-3.5 w-3.5" /> Proyecto bloqueado · solo lectura
        </Badge>
      )}

      <Card className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Estado
          </p>
          <Badge
            variant="secondary"
            className={cn("w-fit", ESTADOS_PROYECTO[proyecto.estado].color)}
          >
            {ESTADOS_PROYECTO[proyecto.estado].label}
          </Badge>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Prioridad
          </p>
          <Badge
            variant="secondary"
            className={cn(
              "w-fit gap-1",
              PRIORIDADES_PROYECTO[proyecto.prioridad].color,
            )}
          >
            <Flag className="h-3 w-3" />
            {PRIORIDADES_PROYECTO[proyecto.prioridad].label}
          </Badge>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Inicio
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            {proyecto.fechaInicio
              ? formatearFecha(proyecto.fechaInicio)
              : "Sin fecha"}
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Entrega
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            {proyecto.fechaEntrega
              ? formatearFecha(proyecto.fechaEntrega)
              : "Sin fecha"}
          </p>
        </div>
      </Card>

      {proyecto.descripcion && (
        <Card className="p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {proyecto.descripcion}
          </p>
        </Card>
      )}

      {/* Ruta de impresión (texto plano) */}
      <Card className="flex items-start gap-3 p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderInput className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Ruta de impresión
          </p>
          {proyecto.rutaImpresion ? (
            <p className="mt-0.5 break-all font-mono text-sm text-muted-foreground">
              {proyecto.rutaImpresion}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Sin ruta configurada. Edita el proyecto para añadirla.
            </p>
          )}
        </div>
      </Card>

      {/* Producción objetivo (si está definida) */}
      {objetivo != null && (
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  Producción
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {formatearNumero(proyecto.cantidadTotal)}
                  </span>{" "}
                  de {formatearNumero(objetivo)} unidades
                  {progreso != null && (
                    <span className="ml-1 text-xs">({progreso}%)</span>
                  )}
                </p>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={
                    completado
                      ? "h-full rounded-full bg-success transition-all"
                      : "h-full rounded-full bg-primary transition-all"
                  }
                  style={{ width: `${progreso ?? 0}%` }}
                />
              </div>
              {completado && (
                <p className="mt-1.5 text-xs font-medium text-success">
                  Objetivo de producción alcanzado.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Métricas del proyecto */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          titulo="Total impresiones"
          valor={formatearNumero(proyecto.totalImpresiones)}
          icono={<Layers />}
        />
        <StatCard
          titulo="Cantidad total"
          valor={formatearNumero(proyecto.cantidadTotal)}
          icono={<Package />}
          acento="primary"
        />
        <StatCard
          titulo="Tiempo total"
          valor={formatearTiempo(proyecto.tiempoTotal)}
          icono={<Clock />}
          acento="success"
        />
        <StatCard
          titulo="Unidades enviadas"
          valor={formatearNumero(totalSalidas)}
          icono={<Truck />}
          acento="warning"
        />
      </div>

      {/* Pestañas: Impresiones / Salidas */}
      <Tabs defaultValue={tabInicial} className="w-full">
        <TabsList>
          <TabsTrigger value="impresiones">
            Impresiones ({proyecto.totalImpresiones})
          </TabsTrigger>
          <TabsTrigger value="salidas">Salidas ({salidas.length})</TabsTrigger>
          <TabsTrigger value="notas" className="gap-1.5">
            <StickyNote className="h-3.5 w-3.5" /> Notas
          </TabsTrigger>
        </TabsList>

        {/* --- Impresiones --- */}
        <TabsContent value="impresiones" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Listado de impresiones
            </h2>
            {!soloLectura && (
              <ImpresionFormDialog
                proyectoId={proyecto.id}
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4" /> Agregar impresión
                  </Button>
                }
              />
            )}
          </div>

          {proyecto.impresiones.length === 0 ? (
            <EmptyState
              icono={<Printer />}
              titulo="Sin impresiones"
              descripcion={
                bloqueado
                  ? "El proyecto está bloqueado. Desbloquéalo para añadir impresiones."
                  : "Añade la primera impresión de este proyecto."
              }
              accion={
                soloLectura ? undefined : (
                  <ImpresionFormDialog
                    proyectoId={proyecto.id}
                    trigger={
                      <Button size="sm">
                        <Plus className="h-4 w-4" /> Agregar impresión
                      </Button>
                    }
                  />
                )
              }
            />
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Impresión</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-center">Tiempo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {impresionesPaginadas.map((imp) => (
                    <TableRow key={imp.id}>
                      <TableCell className="font-medium">{imp.nombre}</TableCell>
                      <TableCell className="text-center">
                        {formatearNumero(imp.cantidad)}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {formatearTiempo(imp.tiempo)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatearFecha(imp.fecha)}
                      </TableCell>
                      <TableCell>
                        {!soloLectura && <ImpresionActions impresion={imp} />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {proyecto.impresiones.length > 0 && (
            <Pagination
              pagina={impresionesPagina}
              totalPaginas={totalPaginasImpresiones}
              total={proyecto.impresiones.length}
              tamano={impresionesTamano}
              pageParam="impresionesPagina"
              sizeParam="impresionesTamano"
              extraParams={{ tab: "impresiones" }}
            />
          )}
        </TabsContent>

        {/* --- Salidas --- */}
        <TabsContent value="salidas" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Salidas de este proyecto
            </h2>
            {!soloLectura && (
              <SalidaFormDialog
                proyectos={proyectosSelect}
                proyectoIdFijo={proyecto.id}
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4" /> Registrar salida
                  </Button>
                }
              />
            )}
          </div>

          {salidas.length === 0 ? (
            <EmptyState
              icono={<Truck />}
              titulo="Sin salidas"
              descripcion={
                bloqueado
                  ? "El proyecto está bloqueado. Desbloquéalo para registrar salidas."
                  : "Registra las unidades que salen de este proyecto."
              }
              accion={
                soloLectura ? undefined : (
                  <SalidaFormDialog
                    proyectos={proyectosSelect}
                    proyectoIdFijo={proyecto.id}
                    trigger={
                      <Button size="sm">
                        <Plus className="h-4 w-4" /> Registrar salida
                      </Button>
                    }
                  />
                )
              }
            />
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destino</TableHead>
                    <TableHead className="text-center">Unidades</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salidasPaginadas.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.destino}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {formatearNumero(s.cantidad)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <span className="line-clamp-1 text-sm text-muted-foreground">
                          {s.nota || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatearFecha(s.fecha)}
                      </TableCell>
                      <TableCell>
                        {!soloLectura && (
                          <SalidaActions
                            salida={{
                              id: s.id,
                              cantidad: s.cantidad,
                              destino: s.destino,
                              nota: s.nota,
                              proyectoId: proyecto.id,
                            }}
                            proyectos={proyectosSelect}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {salidas.length > 0 && (
            <Pagination
              pagina={salidasPagina}
              totalPaginas={totalPaginasSalidas}
              total={salidas.length}
              tamano={salidasTamano}
              pageParam="salidasPagina"
              sizeParam="salidasTamano"
              extraParams={{ tab: "salidas" }}
            />
          )}
        </TabsContent>

        {/* --- Notas (WYSIWYG) --- */}
        <TabsContent value="notas" className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Notas del proyecto
          </h2>
          <ProyectoNotas
            proyectoId={proyecto.id}
            notas={proyecto.notas}
            bloqueado={soloLectura}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
