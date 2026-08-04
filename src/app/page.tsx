import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { configuracionService } from "@/services/configuracion.service";

/** Punto de entrada: redirige según el estado de autenticación. */
export default async function Home() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const destino = await configuracionService.obtenerRutaInicio(
    session.user.rol === "LECTOR",
  );
  redirect(destino);
}
