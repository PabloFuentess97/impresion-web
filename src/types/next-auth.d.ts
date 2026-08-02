import type { DefaultSession } from "next-auth";
import type { RolUsuario } from "@prisma/client";

/** Extensión de los tipos de Auth.js para incluir campos personalizados. */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nombre: string;
      rol: RolUsuario;
    } & DefaultSession["user"];
  }

  interface User {
    nombre?: string;
    rol?: RolUsuario;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nombre: string;
    rol: RolUsuario;
  }
}
