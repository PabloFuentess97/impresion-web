import type { Metadata } from "next";
import {
  ESTADOS_PROYECTO,
  PRIORIDADES_PROYECTO,
  normalizarTamanoPagina,
} from "@/lib/constants";
import Link from "next/link";
import {
  Plus,
  FolderKanban,
  Layers,
  Clock,
  Lock,
  CalendarDays,
  FileBarChart,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ModuloDesactivado } from "@/components/shared/modulo-desactivado";
import { SearchBar } from "@/components/shared/search-bar";
import { SortSelect } from "@/components/shared/sort-select";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
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
import { ProyectoFormDialog } from "@/components/proyectos/proyecto-form-dialog";
import { ProyectoActions } from "@/components/proyectos/proyecto-actions";
import { proyectoService, type OrdenProyecto } from "@/services/proyecto.service";
import { getSession } from "@/lib/session";
import { obtenerEstadoModulo } from "@/lib/module-guard";
import { formatearFecha, formatearTiempo, formatearNumero } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Proyectos" };

const OPCIONES_ORDEN = [
  { value: "reciente", label: "Más recientes" },
  { value: "antiguo", label: "Más antiguos" },
  { value: "titulo", label: "Título (A-Z)" },
  { value: "impresiones", label: "Más impresiones" },
  { value: "tiempo", label: "Más tiempo" },
  { value: "prioridad", label: "Más prioridad" },
  { value: "entrega", label: "Entrega próxima" },
];

export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string; tamano?: string; orden?: string }>;
}) {
  const modulo = await obtenerEstadoModulo("proyectos");
  if (!modulo.activo) return <ModuloDesactivado nombre={modulo.nombre} />;

  const params = await searchParams;
  const busqueda = params.q ?? "";
  const pagina = Number(params.pagina) || 1;
  const tamano = normalizarTamanoPagina(params.tamano);
  const orden = (params.orden as OrdenProyecto) || "reciente";

  const [{ items, total, totalPaginas }, session] = await Promise.all([
    proyectoService.listar({ busqueda, pagina, orden, tamano }),
    getSession(),
  ]);
  const esLector = session?.user?.rol === "LECTOR";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Proyectos"
        descripcion="Gestiona tus proyectos de impresión."
        accion={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/proyectos/reporte">
                <FileBarChart className="h-4 w-4" /> Reporte
              </Link>
            </Button>
            {!esLector && (
              <ProyectoFormDialog
                trigger={
                  <Button>
                    <Plus className="h-4 w-4" /> Nuevo proyecto
                  </Button>
                }
              />
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Buscar proyectos..."
          className="w-full sm:max-w-xs"
        />
        <SortSelect opciones={OPCIONES_ORDEN} defecto="reciente" />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icono={<FolderKanban />}
          titulo={busqueda ? "Sin resultados" : "Aún no hay proyectos"}
          descripcion={
            busqueda
              ? "Prueba con otros términos de búsqueda."
              : "Crea tu primer proyecto para empezar a registrar impresiones."
          }
          accion={
            !busqueda &&
            !esLector && (
              <ProyectoFormDialog
                trigger={
                  <Button>
                    <Plus className="h-4 w-4" /> Nuevo proyecto
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
                <TableHead>Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="text-center">Impresiones</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-center">Salidas</TableHead>
                <TableHead className="text-center">Restantes</TableHead>
                <TableHead className="text-center">Tiempo</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow
                  key={p.id}
                  className={
                    p.bloqueado
                      ? "group border-l-2 border-l-amber-400 bg-amber-50/60 hover:bg-amber-50 dark:border-l-amber-500/70 dark:bg-amber-500/10 dark:hover:bg-amber-500/[0.15]"
                      : "group"
                  }
                >
                  <TableCell>
                    <Link
                      href={`/proyectos/${p.id}`}
                      className="block max-w-md"
                    >
                      <span className="flex items-center gap-1.5">
                        {p.bloqueado && (
                          <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        )}
                        <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                          {p.titulo}
                        </span>
                      </span>
                      {p.descripcion && (
                        <span className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                          {p.descripcion}
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "whitespace-nowrap",
                        ESTADOS_PROYECTO[p.estado].color,
                      )}
                    >
                      {ESTADOS_PROYECTO[p.estado].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "whitespace-nowrap",
                        PRIORIDADES_PROYECTO[p.prioridad].color,
                      )}
                    >
                      {PRIORIDADES_PROYECTO[p.prioridad].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1">
                      <Layers className="h-3 w-3" />
                      {p.totalImpresiones}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {formatearNumero(p.cantidadTotal)}
                    {p.cantidadProduccion != null && (
                      <span className="text-muted-foreground/70">
                        {" / "}
                        {formatearNumero(p.cantidadProduccion)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {formatearNumero(p.cantidadSalidas)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        p.unidadesRestantes === 0
                          ? "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "border border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400"
                      }
                    >
                      {formatearNumero(p.unidadesRestantes ?? 0)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatearTiempo(p.tiempoTotal)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.fechaEntrega ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatearFecha(p.fechaEntrega)}
                      </span>
                    ) : (
                      "Sin fecha"
                    )}
                  </TableCell>
                  <TableCell>
                    {!esLector && <ProyectoActions proyecto={p} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {items.length > 0 && (
        <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} tamano={tamano} />
      )}
    </div>
  );
}
