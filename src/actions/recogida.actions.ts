"use server";

import { revalidatePath } from "next/cache";
import { recogidaService } from "@/services/recogida.service";
import { configuracionService } from "@/services/configuracion.service";
import { auditoriaService } from "@/services/auditoria.service";
import {
  crearRecogidaSchema,
  solicitarRecogidaSchema,
} from "@/validators/recogida.validator";
import { requireAuth, requireAdmin } from "@/lib/session";
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

/**
 * Solicitud de recogida desde dentro de la app por un usuario autenticado
 * (p. ej. el lector, sin escanear el QR). Queda PENDIENTE de aprobación.
 */
export async function solicitarRecogida(
  input: unknown,
): Promise<ActionResult> {
  try {
    const session = await requireAuth();
    const parsed = solicitarRecogidaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del formulario.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const recogida = await recogidaService.crear({
      nbi: parsed.data.nbi,
      nombre: parsed.data.nombre,
      unidades: parsed.data.unidades,
      proyectoId: parsed.data.proyectoId,
    });
    await auditoriaService.registrar(session, {
      accion: "crear",
      entidad: "recogida",
      entidadId: recogida.id,
      descripcion: `Recogida solicitada desde la app: ${recogida.nombre}`,
      detalle: {
        nbi: parsed.data.nbi,
        nombre: parsed.data.nombre,
        unidades: parsed.data.unidades,
        proyectoId: parsed.data.proyectoId,
      },
    });

    revalidatePath("/recogidas");
    return {
      success: true,
      data: undefined,
      message: "Solicitud enviada. Queda pendiente de aprobación.",
    };
  } catch (error) {
    logger.error("Error al solicitar recogida", error);
    return { success: false, message: "No se pudo enviar la solicitud." };
  }
}

/** Aprueba una recogida pendiente (genera salida y descuenta). */
export async function aprobarRecogida(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const resultado = await recogidaService.aprobar(id);
    if (!resultado.ok) {
      return { success: false, message: resultado.error };
    }
    await auditoriaService.registrar(session, {
      accion: "aprobar",
      entidad: "recogida",
      entidadId: id,
      descripcion: "Recogida aprobada y convertida en salida.",
      detalle: { proyectoId: resultado.proyectoId },
    });

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
    const session = await requireAdmin();
    const resultado = await recogidaService.denegar(id);
    if (!resultado.ok) {
      return { success: false, message: resultado.error };
    }
    await auditoriaService.registrar(session, {
      accion: "denegar",
      entidad: "recogida",
      entidadId: id,
      descripcion: "Recogida denegada.",
    });

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
    const session = await requireAdmin();
    await configuracionService.regenerarTokenRecogida();
    await auditoriaService.registrar(session, {
      accion: "regenerar",
      entidad: "recogida_qr",
      descripcion: "Token del QR de recogidas regenerado.",
    });
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
