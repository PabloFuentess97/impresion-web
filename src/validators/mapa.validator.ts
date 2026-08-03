import { z } from "zod";

const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser hexadecimal.");

export const estanciaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede superar 80 caracteres."),
  descripcion: z.string().trim().max(300).optional().or(z.literal("")),
  ancho: z.coerce.number().int().min(600).max(2400).default(1200),
  alto: z.coerce.number().int().min(400).max(1600).default(800),
});

export const zonaSchema = z.object({
  estanciaId: z.string().min(1, "Selecciona una estancia."),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede superar 80 caracteres."),
  descripcion: z.string().trim().max(300).optional().or(z.literal("")),
  x: z.coerce.number().min(0).max(100),
  y: z.coerce.number().min(0).max(100),
  ancho: z.coerce.number().min(1).max(100),
  alto: z.coerce.number().min(1).max(100),
  color: colorSchema.default("#6366F1"),
});

export const zonaPosicionSchema = zonaSchema.pick({
  x: true,
  y: true,
  ancho: true,
  alto: true,
});

export const ubicacionSchema = z.object({
  impresionId: z.string().min(1, "Selecciona una impresión."),
  zonaId: z.string().min(1, "Selecciona una zona."),
  cantidad: z.coerce.number().int().min(1).optional().nullable(),
  nota: z.string().trim().max(240).optional().or(z.literal("")),
});

export type EstanciaInput = z.infer<typeof estanciaSchema>;
export type ZonaInput = z.infer<typeof zonaSchema>;
export type ZonaPosicionInput = z.infer<typeof zonaPosicionSchema>;
export type UbicacionInput = z.infer<typeof ubicacionSchema>;
