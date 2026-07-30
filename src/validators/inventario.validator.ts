import { z } from "zod";

/** Validación para crear o editar un artículo de inventario. */
export const inventarioSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(120, "El nombre no puede superar los 120 caracteres."),
  cantidad: z.coerce
    .number({ invalid_type_error: "La cantidad debe ser un número." })
    .int("Debe ser un número entero.")
    .min(0, "No puede ser negativa.")
    .max(1000000, "Valor demasiado alto."),
});

export type InventarioInput = z.infer<typeof inventarioSchema>;
