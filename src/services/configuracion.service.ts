import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { configuracionRepository } from "@/repositories/configuracion.repository";
import { moduloRepository } from "@/repositories/modulo.repository";
import { usuarioRepository } from "@/repositories/usuario.repository";
import {
  MODULOS_ACTIVABLES,
  HREFS_LECTOR,
  obtenerModuloDefinicion,
  type ClaveModulo,
} from "@/lib/modules";
import type {
  ConfiguracionInput,
  AdminInput,
  LectorInput,
  ModuloConfiguracionInput,
} from "@/validators/configuracion.validator";

/**
 * Servicio de Configuración.
 */
export const configuracionService = {
  obtener() {
    return configuracionRepository.obtenerOCrear();
  },

  async obtenerModulos() {
    const registros = await moduloRepository.listar();
    const porClave = new Map(registros.map((registro) => [registro.clave, registro]));

    return MODULOS_ACTIVABLES.map((definicion) => {
      const registro = porClave.get(definicion.clave);
      return {
        ...definicion,
        activo: registro?.activo ?? true,
        id: registro?.id ?? definicion.clave,
      };
    });
  },

  async moduloActivo(clave: ClaveModulo) {
    const modulo = await moduloRepository.obtener(clave);
    return modulo?.activo ?? true;
  },

  async obtenerModulo(clave: ClaveModulo) {
    const [activo, definicion] = await Promise.all([
      this.moduloActivo(clave),
      Promise.resolve(obtenerModuloDefinicion(clave)),
    ]);
    return definicion ? { ...definicion, activo } : null;
  },

  async actualizarModulo(data: ModuloConfiguracionInput) {
    return moduloRepository.actualizar(data.clave, data.activo);
  },

  async obtenerRutaInicio(esLector = false) {
    const modulos = await this.obtenerModulos();
    const modulo = modulos.find((item) => {
      const permitido = !esLector || HREFS_LECTOR.includes(item.href as never);
      return item.activo && permitido;
    });

    if (modulo) return modulo.href;
    return esLector ? "/proyectos" : "/configuracion";
  },

  /** Genera un nuevo token para el enlace del QR de recogidas y lo guarda. */
  async regenerarTokenRecogida(): Promise<string> {
    const token = randomBytes(24).toString("base64url");
    await configuracionRepository.establecerRecogidaToken(token);
    return token;
  },

  /** Devuelve el usuario de solo lectura (o null si no existe). */
  obtenerLector() {
    return usuarioRepository.primeroPorRol("LECTOR");
  },

  /**
   * Actualiza el correo y (opcionalmente) la contraseña del usuario de solo
   * lectura. Si no existe todavía, lo crea (requiere contraseña).
   */
  async actualizarLector(
    data: LectorInput,
  ): Promise<{ ok: true } | { ok: false; error: string; campo?: string }> {
    const lector = await usuarioRepository.primeroPorRol("LECTOR");
    const emailNuevo = data.email.toLowerCase();

    // El correo no puede coincidir con el de otro usuario (p. ej. el admin).
    const existente = await usuarioRepository.obtenerPorEmail(emailNuevo);
    if (existente && existente.id !== lector?.id) {
      return { ok: false, error: "Ese correo ya está en uso.", campo: "email" };
    }

    if (lector) {
      const cambios: { email: string; password?: string } = {
        email: emailNuevo,
      };
      if (data.password) {
        cambios.password = await bcrypt.hash(data.password, 12);
      }
      await usuarioRepository.actualizar(lector.id, cambios);
      return { ok: true };
    }

    // No existe: lo creamos (la contraseña es obligatoria en este caso).
    if (!data.password) {
      return {
        ok: false,
        error: "Define una contraseña para crear el usuario de solo lectura.",
        campo: "password",
      };
    }
    await usuarioRepository.crear({
      email: emailNuevo,
      password: await bcrypt.hash(data.password, 12),
      nombre: "Lector",
      rol: "LECTOR",
    });
    return { ok: true };
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
