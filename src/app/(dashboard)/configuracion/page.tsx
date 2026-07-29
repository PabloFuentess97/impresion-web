import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { GeneralForm } from "@/components/configuracion/general-form";
import { AdminForm } from "@/components/configuracion/admin-form";
import { getSession } from "@/lib/session";
import { configuracionService } from "@/services/configuracion.service";
import { usuarioRepository } from "@/repositories/usuario.repository";

export const metadata: Metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  const session = await getSession();
  const [config, usuario] = await Promise.all([
    configuracionService.obtener(),
    session?.user?.id ? usuarioRepository.obtener(session.user.id) : null,
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        titulo="Configuración"
        descripcion="Personaliza la aplicación y gestiona tu cuenta."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GeneralForm
          configuracion={{
            nombreEmpresa: config.nombreEmpresa,
            logoUrl: config.logoUrl,
            tema: config.tema,
          }}
        />
        {usuario && (
          <AdminForm
            admin={{ nombre: usuario.nombre, email: usuario.email }}
          />
        )}
      </div>
    </div>
  );
}
