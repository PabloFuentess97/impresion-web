import type { Metadata } from "next";
import { normalizarTamanoPagina } from "@/lib/constants";
import { Plus, Package } from "lucide-react";

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
import { InventarioFormDialog } from "@/components/inventario/inventario-form-dialog";
import { InventarioActions } from "@/components/inventario/inventario-actions";
import {
  inventarioService,
  type OrdenInventario,
} from "@/services/inventario.service";
import { formatearFecha, formatearNumero } from "@/lib/format";

export const metadata: Metadata = { title: "Inventario" };

const OPCIONES_ORDEN = [
  { value: "reciente", label: "Más recientes" },
  { value: "antiguo", label: "Más antiguos" },
  { value: "nombre", label: "Nombre (A-Z)" },
  { value: "cantidad", label: "Mayor cantidad" },
];

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string; tamano?: string; orden?: string }>;
}) {
  const params = await searchParams;
  const busqueda = params.q ?? "";
  const pagina = Number(params.pagina) || 1;
  const tamano = normalizarTamanoPagina(params.tamano);
  const orden = (params.orden as OrdenInventario) || "reciente";

  const { items, total, totalPaginas } = await inventarioService.listar({
    busqueda,
    pagina,
    orden,
    tamano,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Inventario"
        descripcion="Controla los artículos disponibles y su cantidad."
        accion={
          <InventarioFormDialog
            trigger={
              <Button>
                <Plus className="h-4 w-4" /> Nuevo artículo
              </Button>
            }
          />
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Buscar artículos..."
          className="w-full sm:max-w-xs"
        />
        <SortSelect opciones={OPCIONES_ORDEN} defecto="reciente" />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icono={<Package />}
          titulo={busqueda ? "Sin resultados" : "Aún no hay artículos"}
          descripcion={
            busqueda
              ? "Prueba con otros términos de búsqueda."
              : "Añade tu primer artículo para empezar a controlar el inventario."
          }
          accion={
            !busqueda && (
              <InventarioFormDialog
                trigger={
                  <Button>
                    <Plus className="h-4 w-4" /> Nuevo artículo
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
                <TableHead>Artículo</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((articulo) => (
                <TableRow key={articulo.id}>
                  <TableCell className="font-medium text-foreground">
                    {articulo.nombre}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={articulo.cantidad === 0 ? "destructive" : "secondary"}
                    >
                      {formatearNumero(articulo.cantidad)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatearFecha(articulo.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <InventarioActions articulo={articulo} />
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
