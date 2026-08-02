import type { Metadata } from "next";
import { PackageCheck, Ban } from "lucide-react";

import { RecogerForm } from "@/components/recogidas/recoger-form";
import { configuracionService } from "@/services/configuracion.service";
import { proyectoService } from "@/services/proyecto.service";

export const metadata: Metadata = {
  title: "Registrar recogida",
  robots: { index: false, follow: false },
};

// Depende del token de la URL; nunca se cachea de forma estática.
export const dynamic = "force-dynamic";

export default async function RecogerPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;

  let nombreEmpresa = "ImpresiónWeb";
  let tokenValido = false;
  try {
    const config = await configuracionService.obtener();
    nombreEmpresa = config.nombreEmpresa;
    tokenValido = Boolean(config.recogidaToken) && t === config.recogidaToken;
  } catch {
    // Si la BD no está disponible, se trata como enlace no válido.
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <PackageCheck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {nombreEmpresa}
          </h1>
          <p className="text-sm text-muted-foreground">Registro de recogidas</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {tokenValido ? (
            <RecogerForm token={t!} proyectos={await proyectoService.listarSimple()} />
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Ban className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-foreground">
                Enlace no válido
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Este enlace no es correcto o ha caducado. Escanea un código QR
                actualizado facilitado por el administrador.
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Solo para uso interno. No compartas este enlace.
        </p>
      </div>
    </main>
  );
}
