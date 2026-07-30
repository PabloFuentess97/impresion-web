import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { backupService } from "@/services/backup.service";
import { logger } from "@/lib/logger";

/**
 * Descarga una copia de seguridad completa (JSON) de la base de datos.
 * Solo accesible para el administrador autenticado.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return new NextResponse("No autorizado.", { status: 401 });
  }

  try {
    const backup = await backupService.exportar();
    const fecha = backup.exportadoEl.slice(0, 10);
    const cuerpo = JSON.stringify(backup, null, 2);

    return new NextResponse(cuerpo, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup-impresionweb-${fecha}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error("Error al exportar copia de seguridad", error);
    return new NextResponse("No se pudo generar la copia de seguridad.", {
      status: 500,
    });
  }
}
