import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

  actualizar(id: string, data: Prisma.UsuarioUpdateInput) {
    return prisma.usuario.update({ where: { id }, data });
  },
};
