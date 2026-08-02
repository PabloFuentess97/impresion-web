"use server";

import { revalidatePath } from "next/cache";
import { recogidaService } from "@/services/recogida.service";
import { configuracionService } from "@/services/configuracion.service";
import { crearRecogidaSchema } from "@/validators/recogida.validator";
import { requireAuth } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/**
 * Registro público de una recogida (formulario del QR). NO requiere sesión,
 * pero valida el token secreto del enlace contra la configuración.
 */
export async function crearRecogidaPublica(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = crearRecogidaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del formulario.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // Comprobación del token secreto del enlace.
    const config = await configuracionService.obtener();
    if (!config.recogidaToken || config.recogidaToken !== parsed.data.token) {
      return {
        success: false,
        message: "Enlace no válido o caducado. Pide un QR actualizado.",
      };
    }

    await recogidaService.crear({
      nbi: parsed.data.nbi,
      nombre: parsed.data.nombre,
      unidades: parsed.data.unidades,
      proyectoId: parsed.data.proyectoId,
    });

    revalidatePath("/recogidas");
    return {
      success: true,
      data: undefined,
      message: "Registrado. Queda pendiente de aprobación.",
    };
  } catch (error) {
    logger.error("Error al registrar recogida", error);
    return { success: false, message: "No se pudo registrar la recogida." };
  }
}

/** Aprueba una recogida pendiente (genera salida y descuenta). */
export async function aprobarRecogida(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const resultado = await recogidaService.aprobar(id);
    if (!resultado.ok) {
      return { success: false, message: resultado.error };
    }

    revalidatePath("/recogidas");
    revalidatePath("/salidas");
    revalidatePath(`/proyectos/${resultado.proyectoId}`);
    revalidatePath("/dashboard");
    return {
      success: true,
      data: undefined,
      message: "Recogida aprobada. Se ha descontado del proyecto.",
    };
  } catch (error) {
    logger.error("Error al aprobar recogida", error);
    return { success: false, message: "No se pudo aprobar la recogida." };
  }
}

/** Deniega una recogida pendiente (no descuenta nada). */
export async function denegarRecogida(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const resultado = await recogidaService.denegar(id);
    if (!resultado.ok) {
      return { success: false, message: resultado.error };
    }

    revalidatePath("/recogidas");
    return { success: true, data: undefined, message: "Recogida denegada." };
  } catch (error) {
    logger.error("Error al denegar recogida", error);
    return { success: false, message: "No se pudo denegar la recogida." };
  }
}

/** Regenera el token del enlace del QR (invalida el QR anterior). */
export async function regenerarTokenRecogida(): Promise<ActionResult> {
  try {
    await requireAuth();
    await configuracionService.regenerarTokenRecogida();
    revalidatePath("/recogidas");
    return {
      success: true,
      data: undefined,
      message: "QR regenerado. El enlace anterior ya no funciona.",
    };
  } catch (error) {
    logger.error("Error al regenerar token de recogidas", error);
    return { success: false, message: "No se pudo regenerar el QR." };
  }
}
