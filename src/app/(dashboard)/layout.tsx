import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { configuracionService } from "@/services/configuracion.service";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

/** Layout privado del panel de administración. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [config, modulos] = await Promise.all([
    configuracionService.obtener(),
    configuracionService.obtenerModulos(),
  ]);
  const esLector = session.user.rol === "LECTOR";
  const modulosActivos = modulos
    .filter((modulo) => modulo.activo)
    .map((modulo) => modulo.clave);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        nombreEmpresa={config.nombreEmpresa}
        esLector={esLector}
        modulosActivos={modulosActivos}
      />
      <div className="lg:pl-64">
        <Header
          nombreEmpresa={config.nombreEmpresa}
          nombreUsuario={session.user.nombre || session.user.name || "Administrador"}
          emailUsuario={session.user.email || ""}
          esLector={esLector}
          modulosActivos={modulosActivos}
        />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
