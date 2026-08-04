"use server";

import { revalidatePath } from "next/cache";
import { papelService } from "@/services/papel.service";
import { auditoriaService } from "@/services/auditoria.service";
import {
  crearPapelSchema,
  actualizarPapelSchema,
  editarPapelSchema,
} from "@/validators/papel.validator";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Crea un tipo de papel con su número de rollos inicial. */
export async function crearPapel(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = crearPapelSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del papel.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const papel = await papelService.crear(parsed.data.nombre, parsed.data.rollos);
    await auditoriaService.registrar(session, {
      accion: "crear",
      entidad: "papel",
      entidadId: papel.id,
      descripcion: `Papel añadido: ${papel.nombre}`,
      detalle: parsed.data,
    });
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
    const session = await requireAdmin();
    const parsed = actualizarPapelSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Datos no válidos.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await papelService.actualizarRollos(parsed.data.id, parsed.data.rollos);
    await auditoriaService.registrar(session, {
      accion: "actualizar",
      entidad: "papel",
      entidadId: parsed.data.id,
      descripcion: "Rollos de papel actualizados.",
      detalle: parsed.data,
    });
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
    const session = await requireAdmin();
    const parsed = editarPapelSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Datos no válidos.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await papelService.editar(parsed.data.id, parsed.data.nombre);
    await auditoriaService.registrar(session, {
      accion: "actualizar",
      entidad: "papel",
      entidadId: parsed.data.id,
      descripcion: `Papel actualizado: ${parsed.data.nombre}`,
      detalle: { nombre: parsed.data.nombre },
    });
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
    const session = await requireAdmin();
    await papelService.eliminar(id);
    await auditoriaService.registrar(session, {
      accion: "eliminar",
      entidad: "papel",
      entidadId: id,
      descripcion: "Papel eliminado.",
    });
    revalidatePath("/tintas");
    return { success: true, data: undefined, message: "Papel eliminado." };
  } catch (error) {
    logger.error("Error al eliminar papel", error);
    return { success: false, message: "No se pudo eliminar el papel." };
  }
}
