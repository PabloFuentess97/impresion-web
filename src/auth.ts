import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validators/auth.validator";
import { logger } from "@/lib/logger";

/**
 * Instancia principal de Auth.js.
 * Añade el proveedor de credenciales que valida contra la base de datos
 * usando bcrypt. Se ejecuta en el runtime de Node (no Edge).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // Validación de forma con Zod.
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const usuario = await prisma.usuario.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!usuario || !usuario.activo) {
          logger.warn("Intento de acceso con usuario inexistente o inactivo", {
            email,
          });
          return null;
        }

        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
          logger.warn("Intento de acceso con contraseña incorrecta", { email });
          return null;
        }

        logger.info("Inicio de sesión correcto", { email });

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          nombre: usuario.nombre,
        };
      },
    }),
  ],
});
