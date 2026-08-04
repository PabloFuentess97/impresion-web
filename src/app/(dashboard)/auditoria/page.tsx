import type { Metadata } from "next";
import { History, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ModuloDesactivado } from "@/components/shared/modulo-desactivado";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchBar } from "@/components/shared/search-bar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { normalizarTamanoPagina } from "@/lib/constants";
import { formatearFecha } from "@/lib/format";
import { obtenerEstadoModulo } from "@/lib/module-guard";
import { auditoriaService } from "@/services/auditoria.service";

export const metadata: Metadata = { title: "Auditoría" };

const ACCIONES: Record<string, string> = {
  crear: "Crear",
  actualizar: "Actualizar",
  actualizar_notas: "Notas",
  eliminar: "Eliminar",
  bloquear: "Bloquear",
  desbloquear: "Desbloquear",
  restaurar_backup: "Restaurar copia",
  configurar: "Configurar",
  aprobar: "Aprobar",
  denegar: "Denegar",
};

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string; tamano?: string }>;
}) {
  const modulo = await obtenerEstadoModulo("auditoria");
  if (!modulo.activo) return <ModuloDesactivado nombre={modulo.nombre} />;

  const params = await searchParams;
  const busqueda = params.q ?? "";
  const pagina = Number(params.pagina) || 1;
  const tamano = normalizarTamanoPagina(params.tamano);
  const { items, total, totalPaginas } = await auditoriaService.listar({
    busqueda,
    pagina,
    tamano,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Historial de auditoría"
        descripcion="Consulta acciones críticas realizadas por los usuarios."
      />

      <SearchBar
        placeholder="Buscar en auditoría..."
        className="w-full sm:max-w-sm"
      />

      {items.length === 0 ? (
        <EmptyState
          icono={busqueda ? <Search /> : <History />}
          titulo={busqueda ? "Sin resultados" : "Sin actividad registrada"}
          descripcion={
            busqueda
              ? "Prueba con otra acción, entidad, descripción o usuario."
              : "Las acciones administrativas empezarán a aparecer aquí."
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatearFecha(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {ACCIONES[item.accion] ?? item.accion}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">
                    {item.entidad}
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="block font-medium text-foreground">
                      {item.usuarioNombre || "Sistema"}
                    </span>
                    {item.usuarioEmail && (
                      <span className="text-xs text-muted-foreground">
                        {item.usuarioEmail}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[440px]">
                    <span className="line-clamp-2 text-sm text-foreground/90">
                      {item.descripcion}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {items.length > 0 && (
        <Pagination
          pagina={pagina}
          totalPaginas={totalPaginas}
          total={total}
          tamano={tamano}
        />
      )}
    </div>
  );
}
