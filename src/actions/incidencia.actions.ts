"use server";

import { revalidatePath } from "next/cache";
import { incidenciaService } from "@/services/incidencia.service";
import { auditoriaService } from "@/services/auditoria.service";
import { incidenciaSchema } from "@/validators/incidencia.validator";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Crea una nueva incidencia. */
export async function crearIncidencia(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();
    const parsed = incidenciaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la incidencia.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const incidencia = await incidenciaService.crear(parsed.data);
    await auditoriaService.registrar(session, {
      accion: "crear",
      entidad: "incidencia",
      entidadId: incidencia.id,
      descripcion: `Incidencia creada: ${incidencia.titulo}`,
      detalle: { titulo: parsed.data.titulo, estado: parsed.data.estado },
    });
    revalidatePath("/incidencias");
    revalidatePath("/dashboard");
    return {
      success: true,
      data: { id: incidencia.id },
      message: "Incidencia creada correctamente.",
    };
  } catch (error) {
    logger.error("Error al crear incidencia", error);
    return { success: false, message: "No se pudo crear la incidencia." };
  }
}

/** Actualiza una incidencia existente. */
export async function actualizarIncidencia(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = incidenciaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la incidencia.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existente = await incidenciaService.obtener(id);
    if (!existente) {
      return { success: false, message: "La incidencia no existe." };
    }

    await incidenciaService.actualizar(id, parsed.data);
    await auditoriaService.registrar(session, {
      accion: "actualizar",
      entidad: "incidencia",
      entidadId: id,
      descripcion: `Incidencia actualizada: ${parsed.data.titulo}`,
      detalle: { titulo: parsed.data.titulo, estado: parsed.data.estado },
    });
    revalidatePath("/incidencias");
    revalidatePath("/dashboard");
    return { success: true, data: undefined, message: "Incidencia actualizada." };
  } catch (error) {
    logger.error("Error al actualizar incidencia", error);
    return { success: false, message: "No se pudo actualizar la incidencia." };
  }
}

/** Elimina una incidencia. */
export async function eliminarIncidencia(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const existente = await incidenciaService.obtener(id);
    if (!existente) {
      return { success: false, message: "La incidencia no existe." };
    }

    await incidenciaService.eliminar(id);
    await auditoriaService.registrar(session, {
      accion: "eliminar",
      entidad: "incidencia",
      entidadId: id,
      descripcion: `Incidencia eliminada: ${existente.titulo}`,
    });
    revalidatePath("/incidencias");
    revalidatePath("/dashboard");
    return { success: true, data: undefined, message: "Incidencia eliminada." };
  } catch (error) {
    logger.error("Error al eliminar incidencia", error);
    return { success: false, message: "No se pudo eliminar la incidencia." };
  }
}
