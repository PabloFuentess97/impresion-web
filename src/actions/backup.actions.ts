"use server";

import { revalidatePath } from "next/cache";
import { backupService } from "@/services/backup.service";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Claves de tabla esperadas dentro de `datos`. */
const TABLAS = [
  "usuarios",
  "proyectos",
  "impresiones",
  "salidas",
  "incidencias",
  "tintas",
  "lecturasTinta",
  "papel",
  "lecturasPapel",
  "inventario",
  "configuracion",
];

/**
 * Restaura una copia de seguridad. OPERACIÓN DESTRUCTIVA: reemplaza todos
 * los datos actuales por los del archivo. La confirmación se exige en la UI.
 */
export async function restaurarBackup(
  payload: unknown,
): Promise<ActionResult<{ total: number }>> {
  try {
    await requireAdmin();

    const datos = (payload as { datos?: unknown } | null)?.datos;
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      return {
        success: false,
        message: "El archivo no es una copia de seguridad válida.",
      };
    }

    // Comprobación básica: al menos una tabla conocida con formato de lista.
    const registro = datos as Record<string, unknown>;
    const tieneTablas = TABLAS.some((t) => Array.isArray(registro[t]));
    if (!tieneTablas) {
      return {
        success: false,
        message: "El archivo no tiene el formato esperado.",
      };
    }
    for (const t of TABLAS) {
      if (registro[t] !== undefined && !Array.isArray(registro[t])) {
        return {
          success: false,
          message: `El archivo está dañado (tabla "${t}" no válida).`,
        };
      }
    }

    const total = await backupService.restaurar(
      registro as Record<string, unknown[]>,
    );

    revalidatePath("/", "layout");
    return {
      success: true,
      data: { total },
      message: `Copia restaurada: ${total} registros.`,
    };
  } catch (error) {
    logger.error("Error al restaurar copia de seguridad", error);
    return {
      success: false,
      message: "No se pudo restaurar la copia. No se ha modificado nada.",
    };
  }
}
