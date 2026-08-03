"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import { mapaService } from "@/services/mapa.service";
import {
  estanciaSchema,
  ubicacionSchema,
  zonaPosicionSchema,
  zonaSchema,
} from "@/validators/mapa.validator";
import type { ActionResult } from "@/types";

const MAPA_PATH = "/mapa";

export async function crearEstancia(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = estanciaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la estancia.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await mapaService.crearEstancia(parsed.data);
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Estancia creada." };
  } catch (error) {
    logger.error("Error al crear estancia", error);
    return { success: false, message: "No se pudo crear la estancia." };
  }
}

export async function actualizarEstancia(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = estanciaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la estancia.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await mapaService.actualizarEstancia(id, parsed.data);
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Estancia actualizada." };
  } catch (error) {
    logger.error("Error al actualizar estancia", error);
    return { success: false, message: "No se pudo actualizar la estancia." };
  }
}

export async function eliminarEstancia(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await mapaService.eliminarEstancia(id);
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Estancia eliminada." };
  } catch (error) {
    logger.error("Error al eliminar estancia", error);
    return { success: false, message: "No se pudo eliminar la estancia." };
  }
}

export async function crearZona(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = zonaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la zona.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await mapaService.crearZona(parsed.data);
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Zona creada." };
  } catch (error) {
    logger.error("Error al crear zona", error);
    return { success: false, message: "No se pudo crear la zona." };
  }
}

export async function actualizarZona(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = zonaSchema.omit({ estanciaId: true }).safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la zona.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await mapaService.actualizarZona(id, parsed.data);
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Zona actualizada." };
  } catch (error) {
    logger.error("Error al actualizar zona", error);
    return { success: false, message: "No se pudo actualizar la zona." };
  }
}

export async function actualizarZonaPosicion(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = zonaPosicionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: "La posición de la zona no es válida." };
    }
    await mapaService.actualizarZonaPosicion(id, parsed.data);
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Ubicación guardada." };
  } catch (error) {
    logger.error("Error al mover zona", error);
    return { success: false, message: "No se pudo guardar la ubicación." };
  }
}

export async function eliminarZona(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await mapaService.eliminarZona(id);
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Zona eliminada." };
  } catch (error) {
    logger.error("Error al eliminar zona", error);
    return { success: false, message: "No se pudo eliminar la zona." };
  }
}

export async function guardarUbicacion(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = ubicacionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa la asignación de la impresión.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await mapaService.guardarUbicacion(parsed.data);
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Impresión ubicada." };
  } catch (error) {
    logger.error("Error al guardar ubicación", error);
    return { success: false, message: "No se pudo ubicar la impresión." };
  }
}

export async function eliminarUbicacion(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await mapaService.eliminarUbicacion(id);
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Ubicación retirada." };
  } catch (error) {
    logger.error("Error al retirar ubicación", error);
    return { success: false, message: "No se pudo retirar la ubicación." };
  }
}
