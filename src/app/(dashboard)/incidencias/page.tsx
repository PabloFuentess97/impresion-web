import type { Metadata } from "next";
import { normalizarTamanoPagina } from "@/lib/constants";
import { Plus, AlertTriangle, CalendarDays } from "lucide-react";
import type { EstadoIncidencia } from "@prisma/client";

import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IncidenciaFormDialog } from "@/components/incidencias/incidencia-form-dialog";
import { IncidenciaActions } from "@/components/incidencias/incidencia-actions";
import { IncidenciaViewDialog } from "@/components/incidencias/incidencia-view-dialog";
import { EstadoBadge } from "@/components/incidencias/estado-badge";
import { EstadoFilter } from "@/components/incidencias/estado-filter";
import { incidenciaService } from "@/services/incidencia.service";
import { htmlATexto } from "@/lib/sanitize";
import { formatearFecha } from "@/lib/format";

export const metadata: Metadata = { title: "Incidencias" };

export default async function IncidenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string; tamano?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const busqueda = params.q ?? "";
  const pagina = Number(params.pagina) || 1;
  const tamano = normalizarTamanoPagina(params.tamano);
  const estado = (params.estado as EstadoIncidencia | "TODAS") || "TODAS";

  const { items, total, totalPaginas } = await incidenciaService.listar({
    busqueda,
    estado,
    pagina,
    tamano,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Incidencias"
        descripcion="Registra y da seguimiento a los problemas detectados."
        accion={
          <IncidenciaFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" /> Nueva incidencia
              </Button>
            }
          />
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <EstadoFilter />
        <SearchBar
          placeholder="Buscar incidencias..."
          className="w-full lg:max-w-xs"
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icono={<AlertTriangle />}
          titulo={
            busqueda || estado !== "TODAS"
              ? "Sin resultados"
              : "No hay incidencias"
          }
          descripcion={
            busqueda || estado !== "TODAS"
              ? "Prueba a cambiar los filtros de búsqueda."
              : "Crea la primera incidencia para empezar el seguimiento."
          }
          accion={
            !busqueda &&
            estado === "TODAS" && (
              <IncidenciaFormDialog
                trigger={
                  <Button>
                    <Plus className="h-4 w-4" /> Nueva incidencia
                  </Button>
                }
              />
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((inc) => (
            <Card
              key={inc.id}
              className="flex flex-col p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <EstadoBadge estado={inc.estado} />
                <IncidenciaActions incidencia={inc} />
              </div>
              <IncidenciaViewDialog
                incidencia={inc}
                trigger={
                  <button className="text-left">
                    <h3 className="line-clamp-2 font-semibold text-foreground transition-colors hover:text-primary">
                      {inc.titulo}
                    </h3>
                  </button>
                }
              />
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                {htmlATexto(inc.descripcion)}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatearFecha(inc.createdAt)}
              </div>
            </Card>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <Pagination pagina={pagina} totalPaginas={totalPaginas} total={total} tamano={tamano} />
      )}
    </div>
  );
}
