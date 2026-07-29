import { z } from "zod";

/** Validación de la configuración general de la empresa. */
export const configuracionSchema = z.object({
  nombreEmpresa: z
    .string({ required_error: "El nombre de la empresa es obligatorio." })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120, "El nombre no puede superar los 120 caracteres."),
  logoUrl: z
    .string()
    .trim()
    .url("Introduce una URL válida.")
    .optional()
    .or(z.literal("")),
  tema: z.enum(["light", "dark", "system"], {
    invalid_type_error: "Tema no válido.",
  }),
});

export type ConfiguracionInput = z.infer<typeof configuracionSchema>;

/** Validación de los datos del administrador. */
export const adminSchema = z
  .object({
    nombre: z
      .string({ required_error: "El nombre es obligatorio." })
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(120, "El nombre es demasiado largo."),
    email: z
      .string({ required_error: "El correo es obligatorio." })
      .trim()
      .email("Introduce un correo electrónico válido."),
    passwordActual: z.string().optional().or(z.literal("")),
    passwordNueva: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres.")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) =>
      // Si se indica una nueva contraseña, la actual es obligatoria.
      !data.passwordNueva || (data.passwordActual && data.passwordActual.length > 0),
    {
      message: "Debes introducir tu contraseña actual para cambiarla.",
      path: ["passwordActual"],
    },
  );

export type AdminInput = z.infer<typeof adminSchema>;
