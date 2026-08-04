import { configuracionService } from "@/services/configuracion.service";
import { obtenerModuloDefinicion, type ClaveModulo } from "@/lib/modules";

export async function obtenerEstadoModulo(clave: ClaveModulo) {
  const [activo, definicion] = await Promise.all([
    configuracionService.moduloActivo(clave),
    Promise.resolve(obtenerModuloDefinicion(clave)),
  ]);

  return {
    activo,
    nombre: definicion?.label ?? clave,
  };
}
