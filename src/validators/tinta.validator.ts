import { z } from "zod";

/** Números de tintas permitidos. */
export const NUMEROS_TINTAS = [4, 6, 9] as const;

/** Validación para configurar el número de tintas del sistema. */
export const configurarTintasSchema = z.object({
  numero: z.coerce
    .number({ invalid_type_error: "Selecciona un número válido." })
    .refine((n) => NUMEROS_TINTAS.includes(n as 4 | 6 | 9), {
      message: "El número de tintas debe ser 4, 6 o 9.",
    }),
});

export type ConfigurarTintasInput = z.infer<typeof configurarTintasSchema>;

/** Validación para actualizar el porcentaje de una tinta. */
export const actualizarTintaSchema = z.object({
  id: z.string().min(1, "Tinta no válida."),
  porcentaje: z.coerce
    .number({ invalid_type_error: "El porcentaje debe ser un número." })
    .min(0, "El mínimo es 0%.")
    .max(100, "El máximo es 100%."),
});

export type ActualizarTintaInput = z.infer<typeof actualizarTintaSchema>;

/** Validación para editar nombre y color de una tinta. */
export const editarTintaSchema = z.object({
  id: z.string().min(1, "Tinta no válida."),
  nombre: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(60, "El nombre es demasiado largo."),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, "Color hexadecimal no válido.")
    .optional()
    .or(z.literal("")),
});

export type EditarTintaInput = z.infer<typeof editarTintaSchema>;
