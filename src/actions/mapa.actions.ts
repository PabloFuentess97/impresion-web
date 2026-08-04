"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import { mapaService } from "@/services/mapa.service";
import { auditoriaService } from "@/services/auditoria.service";
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
    const session = await requireAdmin();
    const parsed = estanciaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la estancia.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    const estancia = await mapaService.crearEstancia(parsed.data);
    await auditoriaService.registrar(session, {
      accion: "crear",
      entidad: "estancia_mapa",
      entidadId: estancia.id,
      descripcion: `Estancia creada: ${estancia.nombre}`,
      detalle: parsed.data,
    });
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
    const session = await requireAdmin();
    const parsed = estanciaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la estancia.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await mapaService.actualizarEstancia(id, parsed.data);
    await auditoriaService.registrar(session, {
      accion: "actualizar",
      entidad: "estancia_mapa",
      entidadId: id,
      descripcion: `Estancia actualizada: ${parsed.data.nombre}`,
      detalle: parsed.data,
    });
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Estancia actualizada." };
  } catch (error) {
    logger.error("Error al actualizar estancia", error);
    return { success: false, message: "No se pudo actualizar la estancia." };
  }
}

export async function eliminarEstancia(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await mapaService.eliminarEstancia(id);
    await auditoriaService.registrar(session, {
      accion: "eliminar",
      entidad: "estancia_mapa",
      entidadId: id,
      descripcion: "Estancia eliminada.",
    });
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Estancia eliminada." };
  } catch (error) {
    logger.error("Error al eliminar estancia", error);
    return { success: false, message: "No se pudo eliminar la estancia." };
  }
}

export async function crearZona(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = zonaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la zona.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    const zona = await mapaService.crearZona(parsed.data);
    await auditoriaService.registrar(session, {
      accion: "crear",
      entidad: "zona_mapa",
      entidadId: zona.id,
      descripcion: `Zona creada: ${zona.nombre}`,
      detalle: parsed.data,
    });
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
    const session = await requireAdmin();
    const parsed = zonaSchema.omit({ estanciaId: true }).safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos de la zona.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    await mapaService.actualizarZona(id, parsed.data);
    await auditoriaService.registrar(session, {
      accion: "actualizar",
      entidad: "zona_mapa",
      entidadId: id,
      descripcion: `Zona actualizada: ${parsed.data.nombre}`,
      detalle: parsed.data,
    });
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
    const session = await requireAdmin();
    await mapaService.eliminarZona(id);
    await auditoriaService.registrar(session, {
      accion: "eliminar",
      entidad: "zona_mapa",
      entidadId: id,
      descripcion: "Zona eliminada.",
    });
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Zona eliminada." };
  } catch (error) {
    logger.error("Error al eliminar zona", error);
    return { success: false, message: "No se pudo eliminar la zona." };
  }
}

export async function guardarUbicacion(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = ubicacionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa la asignación de la impresión.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    const ubicacion = await mapaService.guardarUbicacion(parsed.data);
    await auditoriaService.registrar(session, {
      accion: "crear",
      entidad: "ubicacion_impresion",
      entidadId: ubicacion.id,
      descripcion: "Impresión ubicada en el mapa.",
      detalle: parsed.data,
    });
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Impresión ubicada." };
  } catch (error) {
    logger.error("Error al guardar ubicación", error);
    return { success: false, message: "No se pudo ubicar la impresión." };
  }
}

export async function eliminarUbicacion(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    await mapaService.eliminarUbicacion(id);
    await auditoriaService.registrar(session, {
      accion: "eliminar",
      entidad: "ubicacion_impresion",
      entidadId: id,
      descripcion: "Ubicación retirada del mapa.",
    });
    revalidatePath(MAPA_PATH);
    return { success: true, data: undefined, message: "Ubicación retirada." };
  } catch (error) {
    logger.error("Error al retirar ubicación", error);
    return { success: false, message: "No se pudo retirar la ubicación." };
  }
}
