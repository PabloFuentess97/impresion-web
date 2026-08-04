"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { backupService } from "@/services/backup.service";
import { auditoriaService } from "@/services/auditoria.service";
import { usuarioRepository } from "@/repositories/usuario.repository";
import { requireAdmin } from "@/lib/session";
import { logger } from "@/lib/logger";
import type { ActionResult } from "@/types";

/** Claves de tabla esperadas dentro de `datos`. */
const TABLAS = [
  "usuarios",
  "proyectos",
  "impresiones",
  "salidas",
  "recogidas",
  "incidencias",
  "tintas",
  "lecturasTinta",
  "papel",
  "lecturasPapel",
  "inventario",
  "estanciasMapa",
  "zonasMapa",
  "ubicacionesImpresion",
  "auditoria",
  "configuracion",
  "modulosConfiguracion",
];

/**
 * Restaura una copia de seguridad. OPERACIÓN DESTRUCTIVA: reemplaza todos
 * los datos actuales por los del archivo. La confirmación se exige en la UI.
 */
export async function restaurarBackup(
  payload: unknown,
): Promise<ActionResult<{ total: number }>> {
  try {
    const session = await requireAdmin();

    const entrada = payload as {
      backup?: { datos?: unknown } | null;
      confirmacion?: unknown;
      passwordActual?: unknown;
    } | null;

    if (entrada?.confirmacion !== "RESTAURAR") {
      return {
        success: false,
        message: "Confirmación no válida.",
      };
    }

    if (
      typeof entrada.passwordActual !== "string" ||
      entrada.passwordActual.length === 0
    ) {
      return {
        success: false,
        message: "Introduce tu contraseña actual para restaurar.",
      };
    }

    const usuario = await usuarioRepository.obtener(session.user.id);
    const passwordValida =
      usuario && (await bcrypt.compare(entrada.passwordActual, usuario.password));
    if (!passwordValida) {
      return {
        success: false,
        message: "La contraseña actual no es correcta.",
      };
    }

    const datos = entrada?.backup?.datos;
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
    await auditoriaService.registrar(session, {
      accion: "restaurar_backup",
      entidad: "backup",
      descripcion: `Copia de seguridad restaurada: ${total} registros.`,
      detalle: { total },
    });

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
