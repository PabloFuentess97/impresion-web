"use server";

import { revalidatePath } from "next/cache";
import { proyectoService } from "@/services/proyecto.service";
import { auditoriaService } from "@/services/auditoria.service";
import {
  proyectoSchema,
  notasProyectoSchema,
} from "@/validators/proyecto.validator";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Crea un nuevo proyecto. */
export async function crearProyecto(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin();
    const parsed = proyectoSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del formulario.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const proyecto = await proyectoService.crear(parsed.data);
    await auditoriaService.registrar(session, {
      accion: "crear",
      entidad: "proyecto",
      entidadId: proyecto.id,
      descripcion: `Proyecto creado: ${proyecto.titulo}`,
      detalle: parsed.data,
    });
    revalidatePath("/proyectos");
    revalidatePath("/dashboard");
    return {
      success: true,
      data: { id: proyecto.id },
      message: "Proyecto creado correctamente.",
    };
  } catch (error) {
    logger.error("Error al crear proyecto", error);
    return { success: false, message: "No se pudo crear el proyecto." };
  }
}

/** Actualiza un proyecto existente. */
export async function actualizarProyecto(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = proyectoSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Revisa los datos del formulario.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existente = await proyectoService.obtener(id);
    if (!existente) {
      return { success: false, message: "El proyecto no existe." };
    }
    if (existente.bloqueado) {
      return {
        success: false,
        message: "El proyecto está bloqueado. Desbloquéalo para editarlo.",
      };
    }

    await proyectoService.actualizar(id, parsed.data);
    await auditoriaService.registrar(session, {
      accion: "actualizar",
      entidad: "proyecto",
      entidadId: id,
      descripcion: `Proyecto actualizado: ${parsed.data.titulo}`,
      detalle: parsed.data,
    });
    revalidatePath("/proyectos");
    revalidatePath(`/proyectos/${id}`);
    revalidatePath("/dashboard");
    return { success: true, data: undefined, message: "Proyecto actualizado." };
  } catch (error) {
    logger.error("Error al actualizar proyecto", error);
    return { success: false, message: "No se pudo actualizar el proyecto." };
  }
}

/** Guarda las notas enriquecidas (WYSIWYG) de un proyecto. */
export async function guardarNotasProyecto(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = notasProyectoSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: "Las notas no son válidas.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existente = await proyectoService.obtener(id);
    if (!existente) {
      return { success: false, message: "El proyecto no existe." };
    }
    if (existente.bloqueado) {
      return {
        success: false,
        message: "El proyecto está bloqueado. Desbloquéalo para editar las notas.",
      };
    }

    await proyectoService.guardarNotas(id, parsed.data.notas ?? "");
    await auditoriaService.registrar(session, {
      accion: "actualizar_notas",
      entidad: "proyecto",
      entidadId: id,
      descripcion: `Notas actualizadas: ${existente.titulo}`,
    });
    revalidatePath(`/proyectos/${id}`);
    return { success: true, data: undefined, message: "Notas guardadas." };
  } catch (error) {
    logger.error("Error al guardar las notas del proyecto", error);
    return { success: false, message: "No se pudieron guardar las notas." };
  }
}

/** Bloquea o desbloquea un proyecto. */
export async function alternarBloqueoProyecto(
  id: string,
  bloqueado: boolean,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const existente = await proyectoService.obtener(id);
    if (!existente) {
      return { success: false, message: "El proyecto no existe." };
    }

    await proyectoService.alternarBloqueo(id, bloqueado);
    await auditoriaService.registrar(session, {
      accion: bloqueado ? "bloquear" : "desbloquear",
      entidad: "proyecto",
      entidadId: id,
      descripcion: `${bloqueado ? "Proyecto bloqueado" : "Proyecto desbloqueado"}: ${existente.titulo}`,
      detalle: { bloqueado },
    });
    revalidatePath("/proyectos");
    revalidatePath(`/proyectos/${id}`);
    return {
      success: true,
      data: undefined,
      message: bloqueado ? "Proyecto bloqueado." : "Proyecto desbloqueado.",
    };
  } catch (error) {
    logger.error("Error al cambiar el bloqueo del proyecto", error);
    return {
      success: false,
      message: "No se pudo cambiar el estado del proyecto.",
    };
  }
}

/** Elimina un proyecto y todas sus impresiones (cascada). */
export async function eliminarProyecto(id: string): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const existente = await proyectoService.obtener(id);
    if (!existente) {
      return { success: false, message: "El proyecto no existe." };
    }
    if (existente.bloqueado) {
      return {
        success: false,
        message: "El proyecto está bloqueado. Desbloquéalo para eliminarlo.",
      };
    }

    await proyectoService.eliminar(id);
    await auditoriaService.registrar(session, {
      accion: "eliminar",
      entidad: "proyecto",
      entidadId: id,
      descripcion: `Proyecto eliminado: ${existente.titulo}`,
    });
    revalidatePath("/proyectos");
    revalidatePath("/dashboard");
    return { success: true, data: undefined, message: "Proyecto eliminado." };
  } catch (error) {
    logger.error("Error al eliminar proyecto", error);
    return { success: false, message: "No se pudo eliminar el proyecto." };
  }
}
