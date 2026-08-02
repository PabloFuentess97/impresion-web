import type { Prisma } from "@prisma/client";
import { recogidaRepository } from "@/repositories/recogida.repository";
import { salidaService } from "@/services/salida.service";
import { PAGINA_TAMANO } from "@/lib/constants";
import type { Paginado, RecogidaConProyecto } from "@/types";

export type FiltroEstadoRecogida = "PENDIENTE" | "APROBADA" | "DENEGADA" | "todas";

/**
 * Servicio de Recogidas. Registro público (pendiente) y resolución del
 * administrador (aprobar → genera Salida, o denegar).
 */
export const recogidaService = {
  async listar(opciones: {
    estado?: FiltroEstadoRecogida;
    pagina?: number;
  }): Promise<Paginado<RecogidaConProyecto>> {
    const pagina = Math.max(1, opciones.pagina ?? 1);
    const where: Prisma.RecogidaWhereInput =
      opciones.estado && opciones.estado !== "todas"
        ? { estado: opciones.estado }
        : {};

    const [total, registros] = await Promise.all([
      recogidaRepository.contar(where),
      recogidaRepository.listar({
        where,
        skip: (pagina - 1) * PAGINA_TAMANO,
        take: PAGINA_TAMANO,
      }),
    ]);

    return {
      items: registros as RecogidaConProyecto[],
      total,
      pagina,
      totalPaginas: Math.max(1, Math.ceil(total / PAGINA_TAMANO)),
      tamano: PAGINA_TAMANO,
    };
  },

  contarPendientes() {
    return recogidaRepository.contar({ estado: "PENDIENTE" });
  },

  obtener(id: string) {
    return recogidaRepository.obtener(id);
  },

  /** Crea una recogida en estado PENDIENTE (formulario público). */
  crear(data: {
    nbi: string;
    nombre: string;
    unidades: number;
    proyectoId: string;
  }) {
    return recogidaRepository.crear({
      nbi: data.nbi,
      nombre: data.nombre,
      unidades: data.unidades,
      proyecto: { connect: { id: data.proyectoId } },
    });
  },

  /**
   * Aprueba una recogida pendiente: genera una Salida del proyecto (descuento)
   * y marca la recogida como APROBADA enlazando la salida creada.
   */
  async aprobar(id: string): Promise<{ ok: true; proyectoId: string } | { ok: false; error: string }> {
    const recogida = await recogidaRepository.obtener(id);
    if (!recogida) return { ok: false, error: "La recogida no existe." };
    if (recogida.estado !== "PENDIENTE") {
      return { ok: false, error: "Esta recogida ya estaba resuelta." };
    }

    const salida = await salidaService.crear({
      proyectoId: recogida.proyectoId,
      cantidad: recogida.unidades,
      destino: recogida.nombre,
      nota: `Recogida de trabajador · NBI ${recogida.nbi}`,
    });

    await recogidaRepository.actualizar(id, {
      estado: "APROBADA",
      salidaId: salida.id,
      resueltoEn: new Date(),
    });

    return { ok: true, proyectoId: recogida.proyectoId };
  },

  /** Deniega una recogida pendiente (no se descuenta nada). */
  async denegar(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
    const recogida = await recogidaRepository.obtener(id);
    if (!recogida) return { ok: false, error: "La recogida no existe." };
    if (recogida.estado !== "PENDIENTE") {
      return { ok: false, error: "Esta recogida ya estaba resuelta." };
    }

    await recogidaRepository.actualizar(id, {
      estado: "DENEGADA",
      resueltoEn: new Date(),
    });

    return { ok: true };
  },
};
