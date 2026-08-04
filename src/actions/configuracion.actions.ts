"use server";

import { revalidatePath } from "next/cache";
import { configuracionService } from "@/services/configuracion.service";
import {
  configuracionSchema,
  adminSchema,
  lectorSchema,
  moduloConfiguracionSchema,
} from "@/validators/configuracion.validator";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Actualiza la configuración general (empresa, logo, tema). */
export async function actualizarConfiguracion(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = configuracionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de configuración.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await configuracionService.actualizar(parsed.data);
    revalidatePath("/configuracion");
    revalidatePath("/", "layout");
    return {
      success: true,
      data: undefined,
      message: "Configuración guardada correctamente.",
    };
  } catch (error) {
    logger.error("Error al actualizar configuración", error);
    return { success: false, message: "No se pudo guardar la configuración." };
  }
}

/** Actualiza los datos del administrador (nombre, email, contraseña). */
export async function actualizarAdmin(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = adminSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos introducidos.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const resultado = await configuracionService.actualizarAdmin(
      session.user.id,
      parsed.data,
    );

    if (!resultado.ok) {
      return {
        success: false,
        message: resultado.error,
        fieldErrors: resultado.campo
          ? { [resultado.campo]: [resultado.error] }
          : undefined,
      };
    }

    revalidatePath("/configuracion");
    return {
      success: true,
      data: undefined,
      message: "Datos del administrador actualizados.",
    };
  } catch (error) {
    logger.error("Error al actualizar administrador", error);
    return { success: false, message: "No se pudieron guardar los cambios." };
  }
}

/** Actualiza el correo y/o la contraseña del usuario de solo lectura. */
export async function actualizarLector(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = lectorSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del usuario de solo lectura.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const resultado = await configuracionService.actualizarLector(parsed.data);
    if (!resultado.ok) {
      return {
        success: false,
        message: resultado.error,
        fieldErrors: resultado.campo
          ? { [resultado.campo]: [resultado.error] }
          : undefined,
      };
    }

    revalidatePath("/configuracion");
    return {
      success: true,
      data: undefined,
      message: "Usuario de solo lectura actualizado.",
    };
  } catch (error) {
    logger.error("Error al actualizar el usuario de solo lectura", error);
    return { success: false, message: "No se pudieron guardar los cambios." };
  }
}

/** Activa o desactiva un modulo configurable de la aplicacion. */
export async function actualizarModulo(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = moduloConfiguracionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa la configuración del módulo.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await configuracionService.actualizarModulo(parsed.data);
    revalidatePath("/configuracion");
    revalidatePath("/", "layout");
    revalidatePath(
      parsed.data.clave === "base-conocimiento"
        ? "/base-conocimiento"
        : `/${parsed.data.clave}`,
    );
    return {
      success: true,
      data: undefined,
      message: parsed.data.activo
        ? "Módulo activado correctamente."
        : "Módulo desactivado correctamente.",
    };
  } catch (error) {
    logger.error("Error al actualizar módulo", error);
    return { success: false, message: "No se pudo actualizar el módulo." };
  }
}
