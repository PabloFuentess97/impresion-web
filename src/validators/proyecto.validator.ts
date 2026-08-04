import { z } from "zod";

/** Convierte cadenas vacías o nulas en `undefined` (campo opcional). */
const opcionalNumero = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

const opcionalFecha = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : v;

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
  rutaImpresion: z
    .string()
    .trim()
    .max(500, "La ruta no puede superar los 500 caracteres.")
    .optional()
    .or(z.literal("")),
  cantidadProduccion: z.preprocess(
    opcionalNumero,
    z.coerce
      .number({ invalid_type_error: "La cantidad debe ser un número." })
      .int("La cantidad debe ser un número entero.")
      .min(0, "La cantidad no puede ser negativa.")
      .max(10_000_000, "La cantidad es demasiado grande.")
      .optional(),
  ),
  estado: z
    .enum(["PENDIENTE", "EN_PRODUCCION", "PAUSADO", "TERMINADO", "CANCELADO"])
    .default("PENDIENTE"),
  prioridad: z
    .enum(["BAJA", "MEDIA", "ALTA", "URGENTE"])
    .default("MEDIA"),
  fechaInicio: z.preprocess(opcionalFecha, z.coerce.date().optional()),
  fechaEntrega: z.preprocess(opcionalFecha, z.coerce.date().optional()),
});

export type ProyectoInput = z.infer<typeof proyectoSchema>;

/** Validación de las notas enriquecidas (WYSIWYG) de un proyecto. */
export const notasProyectoSchema = z.object({
  notas: z
    .string()
    .max(50_000, "Las notas son demasiado largas.")
    .optional()
    .or(z.literal("")),
});

export type NotasProyectoInput = z.infer<typeof notasProyectoSchema>;
