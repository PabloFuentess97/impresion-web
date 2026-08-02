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

/**
 * Igual que requireAuth pero además exige rol ADMIN. Se usa en todas las
 * acciones que modifican datos, para que el usuario de solo lectura (LECTOR)
 * no pueda ejecutarlas ni siquiera saltándose la interfaz.
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.rol !== "ADMIN") {
    throw new Error("No autorizado. Se requieren permisos de administrador.");
  }
  return session;
}

/** Devuelve la sesión actual (o null). */
export async function getSession() {
  return auth();
}
