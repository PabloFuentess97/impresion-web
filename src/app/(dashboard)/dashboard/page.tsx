import type { Metadata } from "next";
import {
  FolderKanban,
  Layers,
  AlertTriangle,
  Clock,
  CalendarCheck,
  Activity,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { IncidenciasChart } from "@/components/dashboard/incidencias-chart";
import { dashboardService } from "@/services/dashboard.service";
import { formatearNumero, formatearTiempo } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [stats, actividad, distribucion] = await Promise.all([
    dashboardService.obtenerEstadisticas(),
    dashboardService.obtenerActividad(14),
    dashboardService.obtenerDistribucionIncidencias(),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        titulo="Dashboard"
        descripcion="Resumen general de la actividad de impresión."
      />

      {/* Tarjetas estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          titulo="Total de proyectos"
          valor={formatearNumero(stats.totalProyectos)}
          icono={<FolderKanban />}
          acento="primary"
        />
        <StatCard
          titulo="Total de impresiones"
          valor={formatearNumero(stats.totalImpresiones)}
          icono={<Layers />}
          acento="primary"
        />
        <StatCard
          titulo="Total de incidencias"
          valor={formatearNumero(stats.totalIncidencias)}
          icono={<AlertTriangle />}
          acento="warning"
        />
        <StatCard
          titulo="Tiempo total invertido"
          valor={formatearTiempo(stats.tiempoTotal)}
          icono={<Clock />}
          acento="success"
        />
        <StatCard
          titulo="Impresiones hoy"
          valor={formatearNumero(stats.impresionesHoy)}
          icono={<CalendarCheck />}
          descripcion="Registradas en el día de hoy"
          acento="primary"
        />
        <StatCard
          titulo="Proyectos activos"
          valor={formatearNumero(stats.proyectosActivos)}
          icono={<Activity />}
          descripcion="Con actividad en 30 días"
          acento="success"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ActivityChart datos={actividad} />
        <IncidenciasChart datos={distribucion} />
      </div>
    </div>
  );
}
