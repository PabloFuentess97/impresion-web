import type { NextAuthConfig } from "next-auth";

/**
 * Configuración base de Auth.js compatible con el runtime Edge (middleware).
 * No incluye el proveedor de credenciales (que usa bcrypt/Prisma) para
 * mantener el middleware ligero y compatible con Edge.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 horas
  },
  trustHost: true,
  callbacks: {
    /**
     * Protección de rutas: sólo los usuarios autenticados pueden acceder
     * a las secciones privadas de la aplicación.
     */
    authorized({ auth, request: { nextUrl } }) {
      const estaAutenticado = !!auth?.user;
      const esRutaLogin = nextUrl.pathname.startsWith("/login");

      // Rutas privadas de la aplicación.
      const rutasPrivadas = [
        "/dashboard",
        "/proyectos",
        "/incidencias",
        "/reportes",
        "/configuracion",
      ];
      const esRutaPrivada = rutasPrivadas.some((ruta) =>
        nextUrl.pathname.startsWith(ruta),
      );

      if (esRutaPrivada) {
        return estaAutenticado; // Si no está autenticado, redirige a /login.
      }

      // Si ya está autenticado y visita /login, lo enviamos al dashboard.
      if (esRutaLogin && estaAutenticado) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    /** Incluye datos del usuario en el token JWT. */
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nombre = (user as { nombre?: string }).nombre ?? user.name ?? "";
      }
      return token;
    },
    /** Expone los datos del token en la sesión del cliente. */
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nombre = (token.nombre as string) ?? "";
      }
      return session;
    },
  },
  providers: [], // Se añaden en auth.ts
} satisfies NextAuthConfig;
