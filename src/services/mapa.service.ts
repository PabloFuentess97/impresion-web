import { mapaRepository } from "@/repositories/mapa.repository";
import type {
  EstanciaInput,
  UbicacionInput,
  ZonaInput,
  ZonaPosicionInput,
} from "@/validators/mapa.validator";

function clamp(valor: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, valor));
}

function normalizarRectangulo(data: ZonaInput | ZonaPosicionInput) {
  const ancho = clamp(data.ancho, 1, 100);
  const alto = clamp(data.alto, 1, 100);
  return {
    x: clamp(data.x, 0, 100 - ancho),
    y: clamp(data.y, 0, 100 - alto),
    ancho,
    alto,
  };
}

export const mapaService = {
  async obtenerMapa() {
    const [estancias, impresiones] = await Promise.all([
      mapaRepository.listarEstancias(),
      mapaRepository.listarImpresiones(),
    ]);

    const impresionesSinUbicar = impresiones.filter(
      (imp) => imp.ubicaciones.length === 0,
    );

    return { estancias, impresiones, impresionesSinUbicar };
  },

  async crearEstancia(data: EstanciaInput) {
    const total = await mapaRepository.contarEstancias();
    return mapaRepository.crearEstancia({
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      ancho: data.ancho,
      alto: data.alto,
      orden: total,
    });
  },

  actualizarEstancia(id: string, data: EstanciaInput) {
    return mapaRepository.actualizarEstancia(id, {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      ancho: data.ancho,
      alto: data.alto,
    });
  },

  eliminarEstancia(id: string) {
    return mapaRepository.eliminarEstancia(id);
  },

  crearZona(data: ZonaInput) {
    const rect = normalizarRectangulo(data);
    return mapaRepository.crearZona({
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      color: data.color,
      ...rect,
      estancia: { connect: { id: data.estanciaId } },
    });
  },

  actualizarZona(id: string, data: Omit<ZonaInput, "estanciaId">) {
    const rect = normalizarRectangulo(data);
    return mapaRepository.actualizarZona(id, {
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      color: data.color,
      ...rect,
    });
  },

  actualizarZonaPosicion(id: string, data: ZonaPosicionInput) {
    return mapaRepository.actualizarZona(id, normalizarRectangulo(data));
  },

  eliminarZona(id: string) {
    return mapaRepository.eliminarZona(id);
  },

  async guardarUbicacion(data: UbicacionInput) {
    const existentes = await mapaRepository.listarImpresiones();
    const impresion = existentes.find((i) => i.id === data.impresionId);
    const ubicacion = impresion?.ubicaciones.find((u) => u.zona.id === data.zonaId);

    const payload = {
      cantidad: data.cantidad ?? null,
      nota: data.nota || null,
    };

    if (ubicacion) {
      return mapaRepository.actualizarUbicacion(ubicacion.id, payload);
    }

    return mapaRepository.crearUbicacion({
      ...payload,
      impresion: { connect: { id: data.impresionId } },
      zona: { connect: { id: data.zonaId } },
    });
  },

  eliminarUbicacion(id: string) {
    return mapaRepository.eliminarUbicacion(id);
  },
};
