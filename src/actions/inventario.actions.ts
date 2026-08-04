"use server";

import { revalidatePath } from "next/cache";
import { inventarioService } from "@/services/inventario.service";
import { auditoriaService } from "@/services/auditoria.service";
import { inventarioSchema } from "@/validators/inventario.validator";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Crea un nuevo artículo de inventario. */
export async function crearInventario(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = inventarioSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del artículo.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const item = await inventarioService.crear(parsed.data);
    await auditoriaService.registrar(session, {
      accion: "crear",
      entidad: "inventario",
      entidadId: item.id,
      descripcion: `Artículo añadido: ${item.nombre}`,
      detalle: parsed.data,
    });
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
    const session = await requireAdmin();
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
    await auditoriaService.registrar(session, {
      accion: "actualizar",
      entidad: "inventario",
      entidadId: id,
      descripcion: `Artículo actualizado: ${parsed.data.nombre}`,
      detalle: parsed.data,
    });
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
    const session = await requireAdmin();
    const existente = await inventarioService.obtener(id);
    if (!existente) {
      return { success: false, message: "El artículo no existe." };
    }

    await inventarioService.eliminar(id);
    await auditoriaService.registrar(session, {
      accion: "eliminar",
      entidad: "inventario",
      entidadId: id,
      descripcion: `Artículo eliminado: ${existente.nombre}`,
    });
    revalidatePath("/inventario");
    return { success: true, data: undefined, message: "Artículo eliminado." };
  } catch (error) {
    logger.error("Error al eliminar inventario", error);
    return { success: false, message: "No se pudo eliminar el artículo." };
  }
}
