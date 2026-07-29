"use server";

import { revalidatePath } from "next/cache";
import { papelService } from "@/services/papel.service";
import {
  crearPapelSchema,
  actualizarPapelSchema,
  editarPapelSchema,
} from "@/validators/papel.validator";
import { requireAuth } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Crea un tipo de papel con su número de rollos inicial. */
export async function crearPapel(input: unknown): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = crearPapelSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del papel.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await papelService.crear(parsed.data.nombre, parsed.data.rollos);
    revalidatePath("/tintas");
    return { success: true, data: undefined, message: "Papel añadido." };
  } catch (error) {
    logger.error("Error al crear papel", error);
    return { success: false, message: "No se pudo añadir el papel." };
  }
}

/** Actualiza el número de rollos (registra lectura histórica). */
export async function actualizarRollosPapel(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = actualizarPapelSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Datos no válidos.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await papelService.actualizarRollos(parsed.data.id, parsed.data.rollos);
    revalidatePath("/tintas");
    return {
      success: true,
      data: undefined,
      message: "Rollos de papel actualizados.",
    };
  } catch (error) {
    logger.error("Error al actualizar papel", error);
    return { success: false, message: "No se pudo actualizar el papel." };
  }
}

/** Edita el nombre de un papel. */
export async function editarPapel(input: unknown): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = editarPapelSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Datos no válidos.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await papelService.editar(parsed.data.id, parsed.data.nombre);
    revalidatePath("/tintas");
    return { success: true, data: undefined, message: "Papel actualizado." };
  } catch (error) {
    logger.error("Error al editar papel", error);
    return { success: false, message: "No se pudo editar el papel." };
  }
}

/** Elimina un tipo de papel. */
export async function eliminarPapel(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    await papelService.eliminar(id);
    revalidatePath("/tintas");
    return { success: true, data: undefined, message: "Papel eliminado." };
  } catch (error) {
    logger.error("Error al eliminar papel", error);
    return { success: false, message: "No se pudo eliminar el papel." };
  }
}
