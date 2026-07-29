import { auth } from "@/auth";

/**
 * Devuelve la sesión actual o lanza un error si no hay usuario autenticado.
 * Se usa en las Server Actions para asegurar que sólo el administrador opere.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado. Debes iniciar sesión.");
  }
  return session;
}

/** Devuelve la sesión actual (o null). */
export async function getSession() {
  return auth();
}
