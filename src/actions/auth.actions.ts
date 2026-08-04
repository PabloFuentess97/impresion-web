"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { configuracionService } from "@/services/configuracion.service";
import { usuarioRepository } from "@/repositories/usuario.repository";
import { loginSchema } from "@/validators/auth.validator";
import type { ActionResult } from "@/types";
import { logger } from "@/lib/logger";

/**
 * Server Action de inicio de sesión.
 * Valida las credenciales y delega en Auth.js. No revela si el fallo es por
 * usuario o contraseña (buena práctica de seguridad).
 */
export async function iniciarSesion(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<{ redirectTo: string }>> {
  const datos = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(datos);
  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los datos introducidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    const usuario = await usuarioRepository.obtenerPorEmail(
      parsed.data.email.toLowerCase(),
    );
    const redirectTo = await configuracionService.obtenerRutaInicio(
      usuario?.rol === "LECTOR",
    );

    return { success: true, data: { redirectTo } };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Credenciales incorrectas. Inténtalo de nuevo.",
      };
    }
    logger.error("Error inesperado en inicio de sesión", error);
    return {
      success: false,
      message: "Ha ocurrido un error. Inténtalo más tarde.",
    };
  }
}

/** Cierra la sesión del usuario y redirige al login. */
export async function cerrarSesion() {
  await signOut({ redirectTo: "/login" });
}
