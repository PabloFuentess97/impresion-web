import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Proxy de autenticacion.
 * Usa la configuracion Edge-safe (sin bcrypt/Prisma) para proteger las rutas
 * privadas mediante el callback `authorized`.
 */
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  // Se ejecuta en todas las rutas excepto assets estaticos y API de auth.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
