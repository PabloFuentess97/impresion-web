import { papelRepository } from "@/repositories/papel.repository";
import type { Papel } from "@prisma/client";

export interface ConsumoPapel {
  id: string;
  nombre: string;
  rollosAnterior: number;
  rollosActual: number;
  gastado: number;
}

/**
 * Servicio de Papel. Misma lógica que las tintas pero contando rollos.
 */
export const papelService = {
  listar() {
    return papelRepository.listar();
  },

  contar() {
    return papelRepository.contar();
  },

  /** Crea un tipo de papel y registra su lectura inicial. */
  async crear(nombre: string, rollos: number) {
    const total = await papelRepository.contar();
    const papel = await papelRepository.crear({
      nombre,
      rollos,
      orden: total,
    });
    await papelRepository.crearLectura(papel.id, rollos);
    return papel;
  },

  /** Actualiza el número de rollos y registra una lectura histórica. */
  async actualizarRollos(id: string, rollos: number) {
    const papel = await papelRepository.obtener(id);
    if (!papel) throw new Error("Papel no encontrado.");
    await papelRepository.actualizar(id, { rollos });
    await papelRepository.crearLectura(id, rollos);
    return papelRepository.obtener(id);
  },

  editar(id: string, nombre: string) {
    return papelRepository.actualizar(id, { nombre });
  },

  eliminar(id: string) {
    return papelRepository.eliminar(id);
  },

  /**
   * Consumo de papel en un rango:
   *  - rollosAnterior: última lectura anterior al inicio del período
   *    (o la primera del período si no hay anteriores).
   *  - rollosActual: última lectura hasta el final del período.
   *  - gastado: diferencia (nunca negativa).
   */
  async consumoEnRango(desde: Date, hasta: Date): Promise<ConsumoPapel[]> {
    const papeles = await papelRepository.listar();

    return Promise.all(
      papeles.map(async (p: Papel) => {
        const anterior =
          (await papelRepository.lecturaAntesDe(p.id, desde)) ??
          (await papelRepository.primeraLecturaDesde(p.id, desde));
        const actual = await papelRepository.lecturaHasta(p.id, hasta);

        const rollosAnterior = anterior?.rollos ?? p.rollos;
        const rollosActual = actual?.rollos ?? rollosAnterior;
        const gastado = Math.max(0, rollosAnterior - rollosActual);

        return {
          id: p.id,
          nombre: p.nombre,
          rollosAnterior,
          rollosActual,
          gastado,
        };
      }),
    );
  },
};
