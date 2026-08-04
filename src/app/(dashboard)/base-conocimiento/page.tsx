import type { Metadata } from "next";

import { BaseConocimiento } from "@/components/base-conocimiento/base-conocimiento";
import { ModuloDesactivado } from "@/components/shared/modulo-desactivado";
import { configuracionService } from "@/services/configuracion.service";
import { obtenerEstadoModulo } from "@/lib/module-guard";

export const metadata: Metadata = {
  title: "Base de conocimiento",
  description:
    "Guías y buenas prácticas para usar ImpresiónWeb. Contenido privado para usuarios autenticados.",
};

/**
 * Base de conocimiento privada del panel.
 *
 * La ruta vive dentro del grupo `(dashboard)`, cuyo layout exige sesión
 * iniciada; por tanto solo es accesible para usuarios autenticados.
 */
export default async function BaseConocimientoPage() {
  const modulo = await obtenerEstadoModulo("base-conocimiento");
  if (!modulo.activo) return <ModuloDesactivado nombre={modulo.nombre} />;

  const config = await configuracionService.obtener();

  return (
    <div className="animate-fade-in">
      <BaseConocimiento nombreApp={config.nombreEmpresa} />
    </div>
  );
}
