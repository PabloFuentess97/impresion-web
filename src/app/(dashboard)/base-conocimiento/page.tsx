import type { Metadata } from "next";

import { BaseConocimiento } from "@/components/base-conocimiento/base-conocimiento";

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
export default function BaseConocimientoPage() {
  return (
    <div className="animate-fade-in">
      <BaseConocimiento />
    </div>
  );
}
