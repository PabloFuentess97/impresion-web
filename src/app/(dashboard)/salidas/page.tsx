import type { Metadata } from "next";
import { normalizarTamanoPagina } from "@/lib/constants";
import Link from "next/link";
import { Plus, Truck, Package } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ModuloDesactivado } from "@/components/shared/modulo-desactivado";
import { SearchBar } from "@/components/shared/search-bar";
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
import { SalidaFormDialog } from "@/components/salidas/salida-form-dialog";
import { SalidaActions } from "@/components/salidas/salida-actions";
import { SolicitarRecogidaDialog } from "@/components/recogidas/solicitar-recogida-dialog";
import { salidaService } from "@/services/salida.service";
import { proyectoService } from "@/services/proyecto.service";
import { getSession } from "@/lib/session";
import { obtenerEstadoModulo } from "@/lib/module-guard";
import { formatearFecha, formatearNumero } from "@/lib/format";

export const metadata: Metadata = { title: "Salidas" };

export default async function SalidasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string; tamano?: string }>;
}) {
  const modulo = await obtenerEstadoModulo("salidas");
  if (!modulo.activo) return <ModuloDesactivado nombre={modulo.nombre} />;

  const params = await searchParams;
  const busqueda = params.q ?? "";
  const pagina = Number(params.pagina) || 1;
  const tamano = normalizarTamanoPagina(params.tamano);

  const [{ items, total, totalPaginas }, proyectos, session] = await Promise.all([
    salidaService.listar({ busqueda, pagina, tamano }),
    proyectoService.listarSimple(),
    getSession(),
  ]);

  const hayProyectos = proyectos.length > 0;
  const esLector = session?.user?.rol === "LECTOR";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Salidas"
        descripcion={
          esLector
            ? "Consulta las salidas y solicita recogidas (las aprueba el administrador)."
            : "Registra las unidades que salen de cada proyecto hacia un destino."
        }
        accion={
          !hayProyectos ? undefined : esLector ? (
            <SolicitarRecogidaDialog
              proyectos={proyectos}
              trigger={
                <Button>
                  <Plus className="h-4 w-4" /> Solicitar recogida
                </Button>
              }
            />
          ) : (
            <SalidaFormDialog
              proyectos={proyectos}
              trigger={
                <Button>
                  <Plus className="h-4 w-4" /> Nueva salida
                </Button>
              }
            />
          )
        }
      />

      <SearchBar
        placeholder="Buscar por destino o proyecto..."
        className="w-full sm:max-w-sm"
      />

      {!hayProyectos ? (
        <EmptyState
          icono={<Package />}
          titulo="No hay proyectos"
          descripcion="Primero crea un proyecto para poder registrar salidas."
          accion={
            <Button asChild>
              <Link href="/proyectos">Ir a proyectos</Link>
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icono={<Truck />}
          titulo={busqueda ? "Sin resultados" : "Aún no hay salidas"}
          descripcion={
            busqueda
              ? "Prueba con otros términos de búsqueda."
              : "Registra la primera salida de material."
          }
          accion={
            !busqueda &&
            !esLector && (
              <SalidaFormDialog
                proyectos={proyectos}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4" /> Nueva salida
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
                <TableHead>Destino</TableHead>
                <TableHead className="text-center">Unidades</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/proyectos/${s.proyecto.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {s.proyecto.titulo}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{s.destino}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1">
                      <Package className="h-3 w-3" />
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
                    {!esLector && (
                      <SalidaActions
                        salida={{
                          id: s.id,
                          cantidad: s.cantidad,
                          destino: s.destino,
                          nota: s.nota,
                          proyectoId: s.proyectoId,
                        }}
                        proyectos={proyectos}
                      />
                    )}
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
