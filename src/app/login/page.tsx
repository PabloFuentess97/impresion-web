import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Printer } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";
import { configuracionService } from "@/services/configuracion.service";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    const destino = await configuracionService.obtenerRutaInicio(
      session.user.rol === "LECTOR",
    );
    redirect(destino);
  }

  let nombreEmpresa = "ImpresiónWeb";
  try {
    const config = await configuracionService.obtener();
    nombreEmpresa = config.nombreEmpresa;
  } catch {
    // valores por defecto
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Printer className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {nombreEmpresa}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Panel de administración
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm text-muted-foreground">
              Introduce tus credenciales para acceder.
            </p>
          </div>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Acceso exclusivo para administradores.
        </p>
      </div>
    </main>
  );
}
