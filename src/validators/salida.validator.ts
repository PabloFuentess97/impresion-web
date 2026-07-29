import { z } from "zod";

/** Validación para crear o editar una salida. */
export const salidaSchema = z.object({
  proyectoId: z
    .string({ required_error: "El proyecto es obligatorio." })
    .min(1, "Selecciona un proyecto."),
  cantidad: z.coerce
    .number({ invalid_type_error: "La cantidad debe ser un número." })
    .int("La cantidad debe ser un número entero.")
    .min(1, "La cantidad mínima es 1.")
    .max(1000000, "La cantidad es demasiado alta."),
  destino: z
    .string({ required_error: "El destino es obligatorio." })
    .trim()
    .min(2, "El destino debe tener al menos 2 caracteres.")
    .max(160, "El destino no puede superar los 160 caracteres."),
  nota: z
    .string()
    .trim()
    .max(500, "La nota no puede superar los 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type SalidaInput = z.infer<typeof salidaSchema>;

/** Esquema para editar una salida (sin necesidad de cambiar el proyecto). */
export const salidaEditSchema = salidaSchema.omit({ proyectoId: true });
export type SalidaEditInput = z.infer<typeof salidaEditSchema>;
