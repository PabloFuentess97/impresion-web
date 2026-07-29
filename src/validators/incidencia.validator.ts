import { z } from "zod";

/** Validación para crear o editar una incidencia. */
export const incidenciaSchema = z.object({
  titulo: z
    .string({ required_error: "El título es obligatorio." })
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres.")
    .max(160, "El título no puede superar los 160 caracteres."),
  descripcion: z
    .string({ required_error: "La descripción es obligatoria." })
    .trim()
    .min(1, "La descripción es obligatoria.")
    .refine(
      (val) => val.replace(/<[^>]*>/g, "").trim().length > 0,
      "La descripción no puede estar vacía.",
    ),
  estado: z.enum(["ABIERTA", "EN_PROCESO", "RESUELTA"], {
    required_error: "El estado es obligatorio.",
    invalid_type_error: "Estado no válido.",
  }),
});

export type IncidenciaInput = z.infer<typeof incidenciaSchema>;
