"use server";

import { revalidatePath } from "next/cache";
import { impresionService } from "@/services/impresion.service";
import { proyectoService } from "@/services/proyecto.service";
import { auditoriaService } from "@/services/auditoria.service";
import {
  impresionSchema,
  impresionEditSchema,
} from "@/validators/impresion.validator";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

const MENSAJE_BLOQUEADO =
  "El proyecto está bloqueado. Desbloquéalo para hacer cambios.";

/** Crea una impresión dentro de un proyecto. */
export async function crearImpresion(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = impresionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la impresión.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (await proyectoService.estaBloqueado(parsed.data.proyectoId)) {
      return { success: false, message: MENSAJE_BLOQUEADO };
    }

    const impresion = await impresionService.crear(parsed.data);
    await auditoriaService.registrar(session, {
      accion: "crear",
      entidad: "impresion",
      entidadId: impresion.id,
      descripcion: `Impresión añadida: ${impresion.nombre}`,
      detalle: parsed.data,
    });
    revalidatePath(`/proyectos/${parsed.data.proyectoId}`);
    revalidatePath("/proyectos");
    revalidatePath("/dashboard");
    return { success: true, data: undefined, message: "Impresión añadida." };
  } catch (error) {
    logger.error("Error al crear impresión", error);
    return { success: false, message: "No se pudo añadir la impresión." };
  }
}

/** Actualiza una impresión existente. */
export async function actualizarImpresion(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = impresionEditSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la impresión.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existente = await impresionService.obtener(id);
    if (!existente) {
      return { success: false, message: "La impresión no existe." };
    }
    if (await proyectoService.estaBloqueado(existente.proyectoId)) {
      return { success: false, message: MENSAJE_BLOQUEADO };
    }

    await impresionService.actualizar(id, parsed.data);
    await auditoriaService.registrar(session, {
      accion: "actualizar",
      entidad: "impresion",
      entidadId: id,
      descripcion: `Impresión actualizada: ${parsed.data.nombre}`,
      detalle: parsed.data,
    });
    revalidatePath(`/proyectos/${existente.proyectoId}`);
    revalidatePath("/dashboard");
    return { success: true, data: undefined, message: "Impresión actualizada." };
  } catch (error) {
    logger.error("Error al actualizar impresión", error);
    return { success: false, message: "No se pudo actualizar la impresión." };
  }
}

/** Elimina una impresión. */
export async function eliminarImpresion(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const existente = await impresionService.obtener(id);
    if (!existente) {
      return { success: false, message: "La impresión no existe." };
    }
    if (await proyectoService.estaBloqueado(existente.proyectoId)) {
      return { success: false, message: MENSAJE_BLOQUEADO };
    }

    await impresionService.eliminar(id);
    await auditoriaService.registrar(session, {
      accion: "eliminar",
      entidad: "impresion",
      entidadId: id,
      descripcion: `Impresión eliminada: ${existente.nombre}`,
    });
    revalidatePath(`/proyectos/${existente.proyectoId}`);
    revalidatePath("/proyectos");
    revalidatePath("/dashboard");
    return { success: true, data: undefined, message: "Impresión eliminada." };
  } catch (error) {
    logger.error("Error al eliminar impresión", error);
    return { success: false, message: "No se pudo eliminar la impresión." };
  }
}
