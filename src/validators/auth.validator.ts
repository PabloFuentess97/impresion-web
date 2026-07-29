import { z } from "zod";

/** Esquema de validación para el inicio de sesión. */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "El correo es obligatorio." })
    .min(1, "El correo es obligatorio.")
    .email("Introduce un correo electrónico válido."),
  password: z
    .string({ required_error: "La contraseña es obligatoria." })
    .min(1, "La contraseña es obligatoria."),
});

export type LoginInput = z.infer<typeof loginSchema>;
