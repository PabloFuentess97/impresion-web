"use server";

import { revalidatePath } from "next/cache";
import { tintaService } from "@/services/tinta.service";
import {
  configurarTintasSchema,
  actualizarTintaSchema,
  editarTintaSchema,
} from "@/validators/tinta.validator";
import { requireAuth } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Configura el número de tintas activas (4, 6 o 9). */
export async function configurarTintas(input: unknown): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = configurarTintasSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Número de tintas no válido.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await tintaService.configurar(parsed.data.numero);
    revalidatePath("/tintas");
    return {
      success: true,
      data: undefined,
      message: `Configuradas ${parsed.data.numero} tintas.`,
    };
  } catch (error) {
    logger.error("Error al configurar tintas", error);
    return { success: false, message: "No se pudieron configurar las tintas." };
  }
}

/** Actualiza el porcentaje de una tinta (registra lectura histórica). */
export async function actualizarPorcentajeTinta(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = actualizarTintaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Datos no válidos.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await tintaService.actualizarPorcentaje(parsed.data.id, parsed.data.porcentaje);
    revalidatePath("/tintas");
    return {
      success: true,
      data: undefined,
      message: "Nivel de tinta actualizado.",
    };
  } catch (error) {
    logger.error("Error al actualizar tinta", error);
    return { success: false, message: "No se pudo actualizar la tinta." };
  }
}

/** Edita el nombre y color de una tinta. */
export async function editarTinta(input: unknown): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = editarTintaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Datos no válidos.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await tintaService.editar(
      parsed.data.id,
      parsed.data.nombre,
      parsed.data.color || undefined,
    );
    revalidatePath("/tintas");
    return { success: true, data: undefined, message: "Tinta actualizada." };
  } catch (error) {
    logger.error("Error al editar tinta", error);
    return { success: false, message: "No se pudo editar la tinta." };
  }
}
