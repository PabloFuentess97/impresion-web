import type { Metadata } from "next";
import { Droplets, Plus, Scroll } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TintaCard } from "@/components/tintas/tinta-card";
import { ConfigurarTintas } from "@/components/tintas/configurar-tintas";
import { ConfigurarTintasInicial } from "@/components/tintas/configurar-tintas-inicial";
import { PapelCard } from "@/components/tintas/papel-card";
import { PapelAddDialog } from "@/components/tintas/papel-add-dialog";
import { tintaService } from "@/services/tinta.service";
import { papelService } from "@/services/papel.service";

export const metadata: Metadata = { title: "Tintas y papel" };

export default async function TintasPage() {
  const [tintas, papeles] = await Promise.all([
    tintaService.listar(),
    papelService.listar(),
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        titulo="Tintas y papel"
        descripcion="Controla el nivel de las tintas y el stock de rollos de papel."
      />

      {/* ---------------- TINTAS ---------------- */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Droplets className="h-5 w-5 text-primary" /> Tintas
          </h2>
          {tintas.length > 0 && <ConfigurarTintas actual={tintas.length} />}
        </div>

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
      </section>

      <Separator />

      {/* ---------------- PAPEL ---------------- */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Scroll className="h-5 w-5 text-primary" /> Papel
          </h2>
          {papeles.length > 0 && (
            <PapelAddDialog
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Añadir papel
                </Button>
              }
            />
          )}
        </div>

        {papeles.length === 0 ? (
          <EmptyState
            icono={<Scroll />}
            titulo="Aún no hay papel registrado"
            descripcion="Registra los rollos de papel disponibles para controlar su consumo."
            accion={
              <PapelAddDialog
                trigger={
                  <Button>
                    <Plus className="h-4 w-4" /> Añadir papel
                  </Button>
                }
              />
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papeles.map((p) => (
              <PapelCard key={p.id} papel={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
