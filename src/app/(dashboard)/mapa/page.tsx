import type { Metadata } from "next";
import { Map, Package, Pin } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { MapaVisual } from "@/components/mapa/mapa-visual";
import { mapaService } from "@/services/mapa.service";
import { formatearNumero } from "@/lib/format";

export const metadata: Metadata = { title: "Mapa visual" };

export default async function MapaPage() {
  const datos = await mapaService.obtenerMapa();

  const totalZonas = datos.estancias.reduce(
    (acc, estancia) => acc + estancia.zonas.length,
    0,
  );
  const totalUbicaciones = datos.estancias.reduce(
    (acc, estancia) =>
      acc +
      estancia.zonas.reduce((zonaAcc, zona) => zonaAcc + zona.ubicaciones.length, 0),
    0,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Mapa visual"
        descripcion="Diseña estancias, dibuja zonas de almacenaje y ubica las impresiones de tus proyectos."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Estancias"
          valor={formatearNumero(datos.estancias.length)}
          icono={<Map />}
        />
        <StatCard
          titulo="Zonas"
          valor={formatearNumero(totalZonas)}
          icono={<Package />}
          acento="primary"
        />
        <StatCard
          titulo="Ubicaciones"
          valor={formatearNumero(totalUbicaciones)}
          icono={<Pin />}
          acento="success"
        />
        <StatCard
          titulo="Sin ubicación"
          valor={formatearNumero(datos.impresionesSinUbicar.length)}
          icono={<Package />}
          acento={datos.impresionesSinUbicar.length > 0 ? "warning" : "success"}
        />
      </div>

      <MapaVisual
        estancias={JSON.parse(JSON.stringify(datos.estancias))}
        impresiones={JSON.parse(JSON.stringify(datos.impresiones))}
        impresionesSinUbicar={JSON.parse(JSON.stringify(datos.impresionesSinUbicar))}
      />
    </div>
  );
}
