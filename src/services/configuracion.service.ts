import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { configuracionRepository } from "@/repositories/configuracion.repository";
import { usuarioRepository } from "@/repositories/usuario.repository";
import type { ConfiguracionInput, AdminInput } from "@/validators/configuracion.validator";

/**
 * Servicio de Configuración.
 */
export const configuracionService = {
  obtener() {
    return configuracionRepository.obtenerOCrear();
  },

  /** Genera un nuevo token para el enlace del QR de recogidas y lo guarda. */
  async regenerarTokenRecogida(): Promise<string> {
    const token = randomBytes(24).toString("base64url");
    await configuracionRepository.establecerRecogidaToken(token);
    return token;
  },

  actualizar(data: ConfiguracionInput) {
    return configuracionRepository.actualizar({
      nombreEmpresa: data.nombreEmpresa,
      logoUrl: data.logoUrl || null,
      tema: data.tema,
    });
  },

  /**
   * Actualiza los datos del administrador. Si se indica una nueva contraseña,
   * valida la actual y almacena el nuevo hash.
   * Devuelve un código de error cuando la validación de negocio falla.
   */
  async actualizarAdmin(
    usuarioId: string,
    data: AdminInput,
  ): Promise<{ ok: true } | { ok: false; error: string; campo?: string }> {
    const usuario = await usuarioRepository.obtener(usuarioId);
    if (!usuario) {
      return { ok: false, error: "Usuario no encontrado." };
    }

    // Comprobar que el email no esté en uso por otro usuario.
    if (data.email.toLowerCase() !== usuario.email.toLowerCase()) {
      const existente = await usuarioRepository.obtenerPorEmail(data.email);
      if (existente && existente.id !== usuarioId) {
        return {
          ok: false,
          error: "Ese correo ya está en uso.",
          campo: "email",
        };
      }
    }

    const datosActualizacion: {
      nombre: string;
      email: string;
      password?: string;
    } = {
      nombre: data.nombre,
      email: data.email.toLowerCase(),
    };

    // Cambio de contraseña (opcional).
    if (data.passwordNueva) {
      const actualValida = await bcrypt.compare(
        data.passwordActual ?? "",
        usuario.password,
      );
      if (!actualValida) {
        return {
          ok: false,
          error: "La contraseña actual no es correcta.",
          campo: "passwordActual",
        };
      }
      datosActualizacion.password = await bcrypt.hash(data.passwordNueva, 12);
    }

    await usuarioRepository.actualizar(usuarioId, datosActualizacion);
    return { ok: true };
  },
};
