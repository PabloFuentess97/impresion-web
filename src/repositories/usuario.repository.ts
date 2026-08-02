import { prisma } from "@/lib/prisma";
import type { Prisma, RolUsuario } from "@prisma/client";

/**
 * Repositorio de Usuarios.
 */
export const usuarioRepository = {
  obtenerPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
  },

  obtener(id: string) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  /** Primer usuario con un rol dado (p. ej. el usuario de solo lectura). */
  primeroPorRol(rol: RolUsuario) {
    return prisma.usuario.findFirst({ where: { rol } });
  },

  crear(data: Prisma.UsuarioCreateInput) {
    return prisma.usuario.create({ data });
  },

  actualizar(id: string, data: Prisma.UsuarioUpdateInput) {
    return prisma.usuario.update({ where: { id }, data });
  },
};
