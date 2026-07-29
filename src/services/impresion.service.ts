import { impresionRepository } from "@/repositories/impresion.repository";
import type { ImpresionInput } from "@/validators/impresion.validator";

/**
 * Servicio de Impresiones.
 */
export const impresionService = {
  obtener(id: string) {
    return impresionRepository.obtener(id);
  },

  /** Crea una impresión. La fecha se registra automáticamente (solo día). */
  crear(data: ImpresionInput) {
    return impresionRepository.crear({
      proyectoId: data.proyectoId,
      nombre: data.nombre,
      cantidad: data.cantidad,
      tiempo: data.tiempo,
      // fecha se asigna por defecto (now, @db.Date) en la base de datos.
    });
  },

  actualizar(id: string, data: Omit<ImpresionInput, "proyectoId">) {
    return impresionRepository.actualizar(id, {
      nombre: data.nombre,
      cantidad: data.cantidad,
      tiempo: data.tiempo,
    });
  },

  eliminar(id: string) {
    return impresionRepository.eliminar(id);
  },
};
