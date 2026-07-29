import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FolderKanban, Layers, Clock } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
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
import { formatearFecha, formatearTiempo, formatearNumero } from "@/lib/format";

export const metadata: Metadata = { title: "Proyectos" };

const OPCIONES_ORDEN = [
  { value: "reciente", label: "Más recientes" },
  { value: "antiguo", label: "Más antiguos" },
  { value: "titulo", label: "Título (A-Z)" },
  { value: "impresiones", label: "Más impresiones" },
  { value: "tiempo", label: "Más tiempo" },
];

export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string; orden?: string }>;
}) {
  const params = await searchParams;
  const busqueda = params.q ?? "";
  const pagina = Number(params.pagina) || 1;
  const orden = (params.orden as OrdenProyecto) || "reciente";

  const { items, total, totalPaginas } = await proyectoService.listar({
    busqueda,
    pagina,
    orden,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Proyectos"
        descripcion="Gestiona tus proyectos de impresión."
        accion={
          <ProyectoFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" /> Nuevo proyecto
              </Button>
            }
          />
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
            !busqueda && (
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
                <TableHead className="text-center">Impresiones</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-center">Tiempo</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id} className="group">
                  <TableCell>
                    <Link
                      href={`/proyectos/${p.id}`}
                      className="block max-w-md"
                    >
                      <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                        {p.titulo}
                      </span>
                      {p.descripcion && (
                        <span className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                          {p.descripcion}
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1">
                      <Layers className="h-3 w-3" />
                      {p.totalImpresiones}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {formatearNumero(p.cantidadTotal)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatearTiempo(p.tiempoTotal)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatearFecha(p.createdAt)}
                  </TableCell>
                  <TableCell>
                    <ProyectoActions proyecto={p} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {items.length > 0 && (
        <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} />
      )}
    </div>
  );
}
