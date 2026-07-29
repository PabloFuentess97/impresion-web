import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { configuracionService } from "@/services/configuracion.service";
import { APP_NOMBRE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NOMBRE} · Gestión de impresiones`,
    template: `%s · ${APP_NOMBRE}`,
  },
  description:
    "Panel de administración para la gestión de proyectos de impresión, incidencias, salidas y reportes.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Tema por defecto configurado por el administrador.
  let temaDefecto = "system";
  try {
    const config = await configuracionService.obtener();
    temaDefecto = config.tema ?? "system";
  } catch {
    // Si la BD aún no está disponible, se usa el tema del sistema.
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme={temaDefecto}
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
