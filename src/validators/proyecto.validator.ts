import { z } from "zod";

/** Validación para crear o editar un proyecto. */
export const proyectoSchema = z.object({
  titulo: z
    .string({ required_error: "El título es obligatorio." })
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres.")
    .max(120, "El título no puede superar los 120 caracteres."),
  descripcion: z
    .string()
    .trim()
    .max(2000, "La descripción no puede superar los 2000 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type ProyectoInput = z.infer<typeof proyectoSchema>;
