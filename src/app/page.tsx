import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

/** Punto de entrada: redirige según el estado de autenticación. */
export default async function Home() {
  const session = await getSession();
  redirect(session?.user ? "/dashboard" : "/login");
}
