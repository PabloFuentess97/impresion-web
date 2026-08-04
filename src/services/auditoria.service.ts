import type { Prisma } from "@prisma/client";
import type { Session } from "next-auth";

import { auditoriaRepository } from "@/repositories/auditoria.repository";
import { normalizarTamanoPagina } from "@/lib/constants";
import type { Auditoria, Paginado } from "@/types";

export interface RegistrarAuditoriaInput {
  accion: string;
  entidad: string;
  entidadId?: string | null;
  descripcion: string;
  detalle?: unknown;
}

function normalizarDetalle(detalle: unknown): Prisma.InputJsonValue | undefined {
  if (detalle === undefined) return undefined;
  return JSON.parse(JSON.stringify(detalle)) as Prisma.InputJsonValue;
}

/** Servicio del historial de auditoria. */
export const auditoriaService = {
  async listar(opciones: {
    busqueda?: string;
    pagina?: number;
    tamano?: number;
  }): Promise<Paginado<Auditoria>> {
    const pagina = Math.max(1, opciones.pagina ?? 1);
    const tamano = normalizarTamanoPagina(opciones.tamano);
    const busqueda = opciones.busqueda?.trim();

    const where: Prisma.AuditoriaWhereInput = busqueda
      ? {
          OR: [
            { accion: { contains: busqueda, mode: "insensitive" } },
            { entidad: { contains: busqueda, mode: "insensitive" } },
            { descripcion: { contains: busqueda, mode: "insensitive" } },
            { usuarioEmail: { contains: busqueda, mode: "insensitive" } },
            { usuarioNombre: { contains: busqueda, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, items] = await Promise.all([
      auditoriaRepository.contar(where),
      auditoriaRepository.listar({
        where,
        skip: (pagina - 1) * tamano,
        take: tamano,
      }),
    ]);

    return {
      items,
      total,
      pagina,
      totalPaginas: Math.max(1, Math.ceil(total / tamano)),
      tamano,
    };
  },

  registrar(session: Session, input: RegistrarAuditoriaInput) {
    const user = session.user;
    return auditoriaRepository.crear({
      accion: input.accion,
      entidad: input.entidad,
      entidadId: input.entidadId ?? null,
      descripcion: input.descripcion,
      detalle: normalizarDetalle(input.detalle),
      usuario: user.id ? { connect: { id: user.id } } : undefined,
      usuarioEmail: user.email ?? null,
      usuarioNombre: user.nombre || user.name || null,
    });
  },
};
