"use server";

import { revalidatePath } from "next/cache";
import { salidaService } from "@/services/salida.service";
import { salidaSchema, salidaEditSchema } from "@/validators/salida.validator";
import { requireAuth } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Crea una nueva salida. */
export async function crearSalida(input: unknown): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = salidaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la salida.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await salidaService.crear(parsed.data);
    revalidatePath("/salidas");
    revalidatePath(`/proyectos/${parsed.data.proyectoId}`);
    revalidatePath("/dashboard");
    return { success: true, data: undefined, message: "Salida registrada." };
  } catch (error) {
    logger.error("Error al crear salida", error);
    return { success: false, message: "No se pudo registrar la salida." };
  }
}

/** Actualiza una salida existente. */
export async function actualizarSalida(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = salidaEditSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la salida.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existente = await salidaService.obtener(id);
    if (!existente) {
      return { success: false, message: "La salida no existe." };
    }

    await salidaService.actualizar(id, parsed.data);
    revalidatePath("/salidas");
    revalidatePath(`/proyectos/${existente.proyectoId}`);
    return { success: true, data: undefined, message: "Salida actualizada." };
  } catch (error) {
    logger.error("Error al actualizar salida", error);
    return { success: false, message: "No se pudo actualizar la salida." };
  }
}

/** Elimina una salida. */
export async function eliminarSalida(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const existente = await salidaService.obtener(id);
    if (!existente) {
      return { success: false, message: "La salida no existe." };
    }

    await salidaService.eliminar(id);
    revalidatePath("/salidas");
    revalidatePath(`/proyectos/${existente.proyectoId}`);
    revalidatePath("/dashboard");
    return { success: true, data: undefined, message: "Salida eliminada." };
  } catch (error) {
    logger.error("Error al eliminar salida", error);
    return { success: false, message: "No se pudo eliminar la salida." };
  }
}
