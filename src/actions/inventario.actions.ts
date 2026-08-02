"use server";

import { revalidatePath } from "next/cache";
import { inventarioService } from "@/services/inventario.service";
import { inventarioSchema } from "@/validators/inventario.validator";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Crea un nuevo artículo de inventario. */
export async function crearInventario(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = inventarioSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del artículo.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await inventarioService.crear(parsed.data);
    revalidatePath("/inventario");
    return { success: true, data: undefined, message: "Artículo añadido." };
  } catch (error) {
    logger.error("Error al crear inventario", error);
    return { success: false, message: "No se pudo añadir el artículo." };
  }
}

/** Actualiza un artículo de inventario existente. */
export async function actualizarInventario(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = inventarioSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del artículo.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existente = await inventarioService.obtener(id);
    if (!existente) {
      return { success: false, message: "El artículo no existe." };
    }

    await inventarioService.actualizar(id, parsed.data);
    revalidatePath("/inventario");
    return { success: true, data: undefined, message: "Artículo actualizado." };
  } catch (error) {
    logger.error("Error al actualizar inventario", error);
    return { success: false, message: "No se pudo actualizar el artículo." };
  }
}

/** Elimina un artículo de inventario. */
export async function eliminarInventario(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existente = await inventarioService.obtener(id);
    if (!existente) {
      return { success: false, message: "El artículo no existe." };
    }

    await inventarioService.eliminar(id);
    revalidatePath("/inventario");
    return { success: true, data: undefined, message: "Artículo eliminado." };
  } catch (error) {
    logger.error("Error al eliminar inventario", error);
    return { success: false, message: "No se pudo eliminar el artículo." };
  }
}
