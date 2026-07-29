import { tintaRepository } from "@/repositories/tinta.repository";
import type { Tinta } from "@prisma/client";

/** Definiciones por defecto de tintas (hasta 9). */
const TINTAS_DEFECTO = [
  { nombre: "Cian", color: "#00AEEF" },
  { nombre: "Magenta", color: "#EC008C" },
  { nombre: "Amarillo", color: "#FFD100" },
  { nombre: "Negro", color: "#231F20" },
  { nombre: "Cian claro", color: "#7FD4F5" },
  { nombre: "Magenta claro", color: "#F49AC2" },
  { nombre: "Naranja", color: "#F58220" },
  { nombre: "Verde", color: "#00A651" },
  { nombre: "Violeta", color: "#92278F" },
];

export interface ConsumoTinta {
  id: string;
  nombre: string;
  color: string;
  nivelAnterior: number;
  nivelActual: number;
  gastado: number;
}

/**
 * Servicio de Tintas.
 */
export const tintaService = {
  listar() {
    return tintaRepository.listar();
  },

  async contar() {
    return tintaRepository.contar();
  },

  /**
   * Configura el número de tintas activas (4, 6 o 9).
   * Añade tintas por defecto si faltan y elimina las sobrantes.
   */
  async configurar(numero: number) {
    const actuales = await tintaRepository.listar();

    if (numero > actuales.length) {
      // Añadir las que faltan.
      const nuevas = TINTAS_DEFECTO.slice(actuales.length, numero).map(
        (t, i) => ({
          nombre: t.nombre,
          color: t.color,
          orden: actuales.length + i,
          porcentaje: 100,
        }),
      );
      await tintaRepository.crearVarias(nuevas);
      // Registrar lectura inicial de las nuevas.
      const todas = await tintaRepository.listar();
      const creadas = todas.filter((t) => t.orden >= actuales.length);
      await Promise.all(
        creadas.map((t) => tintaRepository.crearLectura(t.id, t.porcentaje)),
      );
    } else if (numero < actuales.length) {
      // Eliminar las sobrantes (orden >= numero).
      await tintaRepository.eliminarDesdeOrden(numero);
    }

    return tintaRepository.listar();
  },

  /** Actualiza el porcentaje actual y registra una lectura histórica. */
  async actualizarPorcentaje(id: string, porcentaje: number) {
    const tinta = await tintaRepository.obtener(id);
    if (!tinta) throw new Error("Tinta no encontrada.");

    await tintaRepository.actualizar(id, { porcentaje });
    await tintaRepository.crearLectura(id, porcentaje);
    return tintaRepository.obtener(id);
  },

  /** Edita el nombre y color de una tinta. */
  editar(id: string, nombre: string, color?: string) {
    return tintaRepository.actualizar(id, {
      nombre,
      ...(color ? { color } : {}),
    });
  },

  /**
   * Calcula el consumo de cada tinta en un rango:
   *  - nivelAnterior: última lectura anterior al inicio del período
   *    (o la primera del período si no hay anteriores).
   *  - nivelActual: última lectura hasta el final del período.
   *  - gastado: diferencia (nunca negativa).
   */
  async consumoEnRango(desde: Date, hasta: Date): Promise<ConsumoTinta[]> {
    const tintas = await tintaRepository.listar();

    return Promise.all(
      tintas.map(async (t: Tinta) => {
        const anterior =
          (await tintaRepository.lecturaAntesDe(t.id, desde)) ??
          (await tintaRepository.primeraLecturaDesde(t.id, desde));
        const actual = await tintaRepository.lecturaHasta(t.id, hasta);

        const nivelAnterior = anterior?.porcentaje ?? t.porcentaje;
        const nivelActual = actual?.porcentaje ?? nivelAnterior;
        const gastado = Math.max(
          0,
          Math.round((nivelAnterior - nivelActual) * 10) / 10,
        );

        return {
          id: t.id,
          nombre: t.nombre,
          color: t.color,
          nivelAnterior,
          nivelActual,
          gastado,
        };
      }),
    );
  },
};
