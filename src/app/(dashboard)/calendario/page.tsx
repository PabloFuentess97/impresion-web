import type { Metadata } from "next";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, FolderKanban } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ModuloDesactivado } from "@/components/shared/modulo-desactivado";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ESTADOS_PROYECTO,
  PRIORIDADES_PROYECTO,
} from "@/lib/constants";
import { formatearFecha } from "@/lib/format";
import { obtenerEstadoModulo } from "@/lib/module-guard";
import { cn } from "@/lib/utils";
import { proyectoService } from "@/services/proyecto.service";

export const metadata: Metadata = { title: "Calendario" };

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function mesDesdeParametro(valor?: string) {
  if (!valor || !/^\d{4}-\d{2}$/.test(valor)) return startOfMonth(new Date());
  const fecha = new Date(`${valor}-01T00:00:00`);
  return Number.isNaN(fecha.getTime()) ? startOfMonth(new Date()) : fecha;
}

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const modulo = await obtenerEstadoModulo("calendario");
  if (!modulo.activo) return <ModuloDesactivado nombre={modulo.nombre} />;

  const params = await searchParams;
  const mes = mesDesdeParametro(params.mes);
  const inicioMes = startOfMonth(mes);
  const finMes = endOfMonth(mes);
  const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 1 });
  const finCalendario = endOfWeek(finMes, { weekStartsOn: 1 });
  const dias = eachDayOfInterval({ start: inicioCalendario, end: finCalendario });
  const proyectos = await proyectoService.listarPlanificados();
  const mesAnterior = format(addMonths(mes, -1), "yyyy-MM");
  const mesSiguiente = format(addMonths(mes, 1), "yyyy-MM");

  const eventos = proyectos.flatMap((proyecto) => {
    const items = [];
    if (proyecto.fechaInicio) {
      items.push({ tipo: "Inicio", fecha: proyecto.fechaInicio, proyecto });
    }
    if (proyecto.fechaEntrega) {
      items.push({ tipo: "Entrega", fecha: proyecto.fechaEntrega, proyecto });
    }
    return items;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Calendario de producción"
        descripcion="Planifica proyectos por fecha de inicio y entrega."
        accion={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/calendario?mes=${mesAnterior}`}>
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/calendario?mes=${mesSiguiente}`}>
                Siguiente <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Vista mensual</p>
            <h2 className="text-xl font-semibold capitalize tracking-tight">
              {format(mes, "MMMM yyyy", { locale: es })}
            </h2>
          </div>
          <Badge variant="secondary" className="w-fit gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {eventos.length} {eventos.length === 1 ? "evento" : "eventos"}
          </Badge>
        </div>

        {eventos.length === 0 ? (
          <EmptyState
            icono={<FolderKanban />}
            titulo="Sin proyectos planificados"
            descripcion="Añade fecha de inicio o entrega en un proyecto para verlo en el calendario."
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="grid min-w-[920px] grid-cols-7 border-b border-border bg-muted/40">
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className="border-r border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground last:border-r-0"
                >
                  {dia}
                </div>
              ))}
            </div>
            <div className="grid min-w-[920px] grid-cols-7">
              {dias.map((dia) => {
                const eventosDia = eventos.filter((evento) =>
                  isSameDay(evento.fecha, dia),
                );
                return (
                  <div
                    key={dia.toISOString()}
                    className={cn(
                      "min-h-[150px] border-r border-b border-border p-3 last:border-r-0",
                      !isSameMonth(dia, mes) && "bg-muted/25 text-muted-foreground",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {format(dia, "d")}
                      </span>
                      {isSameDay(dia, new Date()) && (
                        <Badge variant="secondary" className="text-[10px]">
                          Hoy
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {eventosDia.map((evento) => (
                        <Link
                          key={`${evento.proyecto.id}-${evento.tipo}-${evento.fecha.toISOString()}`}
                          href={`/proyectos/${evento.proyecto.id}`}
                          className="block rounded-lg border border-border bg-card p-2 text-xs shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="font-semibold text-foreground">
                              {evento.tipo}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "px-1.5 py-0 text-[10px]",
                                PRIORIDADES_PROYECTO[evento.proyecto.prioridad].color,
                              )}
                            >
                              {PRIORIDADES_PROYECTO[evento.proyecto.prioridad].label}
                            </Badge>
                          </div>
                          <p className="line-clamp-2 font-medium text-foreground">
                            {evento.proyecto.titulo}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "px-1.5 py-0 text-[10px]",
                                ESTADOS_PROYECTO[evento.proyecto.estado].color,
                              )}
                            >
                              {ESTADOS_PROYECTO[evento.proyecto.estado].label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatearFecha(evento.fecha)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
