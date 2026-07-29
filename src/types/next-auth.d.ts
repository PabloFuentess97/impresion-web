import type { DefaultSession } from "next-auth";

/** Extensión de los tipos de Auth.js para incluir campos personalizados. */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nombre: string;
    } & DefaultSession["user"];
  }

  interface User {
    nombre?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nombre: string;
  }
}
