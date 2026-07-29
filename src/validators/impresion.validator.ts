import { z } from "zod";

/** Validación para crear o editar una impresión. */
export const impresionSchema = z.object({
  proyectoId: z
    .string({ required_error: "El proyecto es obligatorio." })
    .min(1, "El proyecto es obligatorio."),
  nombre: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede superar los 120 caracteres."),
  cantidad: z.coerce
    .number({ invalid_type_error: "La cantidad debe ser un número." })
    .int("La cantidad debe ser un número entero.")
    .min(1, "La cantidad mínima es 1.")
    .max(1000000, "La cantidad es demasiado alta."),
  tiempo: z.coerce
    .number({ invalid_type_error: "El tiempo debe ser un número." })
    .int("El tiempo debe expresarse en minutos enteros.")
    .min(0, "El tiempo no puede ser negativo.")
    .max(1000000, "El tiempo es demasiado alto."),
});

export type ImpresionInput = z.infer<typeof impresionSchema>;

/** Esquema para editar una impresión (sin necesidad de proyectoId). */
export const impresionEditSchema = impresionSchema.omit({ proyectoId: true });
export type ImpresionEditInput = z.infer<typeof impresionEditSchema>;
