import { z } from "zod";

/** Validación para crear un tipo de papel. */
export const crearPapelSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(60, "El nombre es demasiado largo."),
  rollos: z.coerce
    .number({ invalid_type_error: "Los rollos deben ser un número." })
    .int("Debe ser un número entero.")
    .min(0, "No puede ser negativo.")
    .max(1000000, "Valor demasiado alto."),
});

export type CrearPapelInput = z.infer<typeof crearPapelSchema>;

/** Validación para actualizar el número de rollos. */
export const actualizarPapelSchema = z.object({
  id: z.string().min(1, "Papel no válido."),
  rollos: z.coerce
    .number({ invalid_type_error: "Los rollos deben ser un número." })
    .int("Debe ser un número entero.")
    .min(0, "No puede ser negativo.")
    .max(1000000, "Valor demasiado alto."),
});

export type ActualizarPapelInput = z.infer<typeof actualizarPapelSchema>;

/** Validación para editar el nombre de un papel. */
export const editarPapelSchema = z.object({
  id: z.string().min(1, "Papel no válido."),
  nombre: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(60, "El nombre es demasiado largo."),
});

export type EditarPapelInput = z.infer<typeof editarPapelSchema>;
