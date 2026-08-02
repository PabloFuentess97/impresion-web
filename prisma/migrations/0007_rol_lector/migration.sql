-- AlterEnum
-- Añade el rol LECTOR (usuario de solo lectura, limitado a Proyectos y Salidas).
ALTER TYPE "RolUsuario" ADD VALUE 'LECTOR';
