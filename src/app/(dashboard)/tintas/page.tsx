import type { Metadata } from "next";
import { Droplets } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { TintaCard } from "@/components/tintas/tinta-card";
import { ConfigurarTintas } from "@/components/tintas/configurar-tintas";
import { ConfigurarTintasInicial } from "@/components/tintas/configurar-tintas-inicial";
import { tintaService } from "@/services/tinta.service";

export const metadata: Metadata = { title: "Tintas" };

export default async function TintasPage() {
  const tintas = await tintaService.listar();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Tintas"
        descripcion="Configura las tintas del sistema y controla su nivel."
        accion={tintas.length > 0 ? <ConfigurarTintas actual={tintas.length} /> : undefined}
      />

      {tintas.length === 0 ? (
        <EmptyState
          icono={<Droplets />}
          titulo="Aún no hay tintas configuradas"
          descripcion="Elige cuántas tintas usa tu equipo (4, 6 o 9) para empezar a controlar sus niveles."
          accion={<ConfigurarTintasInicial />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tintas.map((t) => (
            <TintaCard key={t.id} tinta={t} />
          ))}
        </div>
      )}
    </div>
  );
}
