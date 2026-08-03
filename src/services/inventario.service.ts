import type { Prisma } from "@prisma/client";
import { inventarioRepository } from "@/repositories/inventario.repository";
import { normalizarTamanoPagina } from "@/lib/constants";
import type { Inventario, Paginado } from "@/types";
import type { InventarioInput } from "@/validators/inventario.validator";

export type OrdenInventario = "reciente" | "antiguo" | "nombre" | "cantidad";

/**
 * Servicio de Inventario. Búsqueda, ordenación y paginación de artículos.
 */
export const inventarioService = {
  async listar(opciones: {
    busqueda?: string;
    pagina?: number;
    tamano?: number;
    orden?: OrdenInventario;
  }): Promise<Paginado<Inventario>> {
    const pagina = Math.max(1, opciones.pagina ?? 1);
    const tamano = normalizarTamanoPagina(opciones.tamano);
    const busqueda = opciones.busqueda?.trim();

    const where: Prisma.InventarioWhereInput = busqueda
      ? { nombre: { contains: busqueda, mode: "insensitive" } }
      : {};

    const orderBy: Prisma.InventarioOrderByWithRelationInput =
      opciones.orden === "antiguo"
        ? { createdAt: "asc" }
        : opciones.orden === "nombre"
          ? { nombre: "asc" }
          : opciones.orden === "cantidad"
            ? { cantidad: "desc" }
            : { createdAt: "desc" };

    const total = await inventarioRepository.contar(where);
    const items = await inventarioRepository.listar({
      where,
      orderBy,
      skip: (pagina - 1) * tamano,
      take: tamano,
    });

    return {
      items,
      total,
      pagina,
      totalPaginas: Math.max(1, Math.ceil(total / tamano)),
      tamano,
    };
  },

  obtener(id: string) {
    return inventarioRepository.obtener(id);
  },

  crear(data: InventarioInput) {
    return inventarioRepository.crear({
      nombre: data.nombre,
      cantidad: data.cantidad,
    });
  },

  actualizar(id: string, data: InventarioInput) {
    return inventarioRepository.actualizar(id, {
      nombre: data.nombre,
      cantidad: data.cantidad,
    });
  },

  eliminar(id: string) {
    return inventarioRepository.eliminar(id);
  },
};
