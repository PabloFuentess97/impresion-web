import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Middleware de autenticación.
 * Usa la configuración Edge-safe (sin bcrypt/Prisma) para proteger las rutas
 * privadas mediante el callback `authorized`.
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Se ejecuta en todas las rutas excepto assets estáticos y API de auth.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
