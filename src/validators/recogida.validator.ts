import { z } from "zod";

/**
 * Validación del formulario público de recogida (escaneando el QR).
 * El `token` se comprueba además en el servidor contra la configuración.
 */
export const crearRecogidaSchema = z.object({
  token: z.string().min(1, "Enlace no válido."),
  proyectoId: z
    .string({ required_error: "Selecciona un proyecto." })
    .min(1, "Selecciona un proyecto."),
  nbi: z
    .string({ required_error: "El NBI es obligatorio." })
    .trim()
    .min(1, "El NBI es obligatorio.")
    .max(40, "El NBI es demasiado largo."),
  nombre: z
    .string({ required_error: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre es obligatorio.")
    .max(120, "El nombre es demasiado largo."),
  unidades: z.coerce
    .number({ invalid_type_error: "Las unidades deben ser un número." })
    .int("Debe ser un número entero.")
    .min(1, "La cantidad mínima es 1.")
    .max(1000000, "Valor demasiado alto."),
});

export type CrearRecogidaInput = z.infer<typeof crearRecogidaSchema>;
