import { prisma } from "@/lib/prisma";

/**
 * Servicio de copias de seguridad.
 *
 * `exportar` genera un volcado completo de todas las tablas.
 * `restaurar` reemplaza TODOS los datos actuales por los del volcado
 * (operación destructiva, protegida con confirmación en la interfaz).
 */

export const BACKUP_VERSION = 1;

/** Convierte a Date los campos de fecha indicados de cada registro. */
function conFechas<T extends Record<string, unknown>>(
  filas: T[] | undefined,
  campos: string[],
): Record<string, unknown>[] {
  return (filas ?? []).map((fila) => {
    const copia: Record<string, unknown> = { ...fila };
    for (const campo of campos) {
      if (copia[campo] != null) copia[campo] = new Date(copia[campo] as string);
    }
    return copia;
  });
}

export const backupService = {
  /** Lee todas las tablas y devuelve un objeto serializable a JSON. */
  async exportar() {
    // Secuencial para no saturar el límite de conexiones de la base de datos.
    const usuarios = await prisma.usuario.findMany();
    const proyectos = await prisma.proyecto.findMany();
    const impresiones = await prisma.impresion.findMany();
    const salidas = await prisma.salida.findMany();
    const recogidas = await prisma.recogida.findMany();
    const incidencias = await prisma.incidencia.findMany();
    const tintas = await prisma.tinta.findMany();
    const lecturasTinta = await prisma.lecturaTinta.findMany();
    const papel = await prisma.papel.findMany();
    const lecturasPapel = await prisma.lecturaPapel.findMany();
    const inventario = await prisma.inventario.findMany();
    const estanciasMapa = await prisma.estanciaMapa.findMany();
    const zonasMapa = await prisma.zonaMapa.findMany();
    const ubicacionesImpresion = await prisma.ubicacionImpresion.findMany();
    const auditoria = await prisma.auditoria.findMany();
    const configuracion = await prisma.configuracion.findMany();
    const modulosConfiguracion = await prisma.moduloConfiguracion.findMany();

    return {
      version: BACKUP_VERSION,
      app: "ImpresiónWeb",
      exportadoEl: new Date().toISOString(),
      datos: {
        usuarios,
        proyectos,
        impresiones,
        salidas,
        recogidas,
        incidencias,
        tintas,
        lecturasTinta,
        papel,
        lecturasPapel,
        inventario,
        estanciasMapa,
        zonasMapa,
        ubicacionesImpresion,
        auditoria,
        configuracion,
        modulosConfiguracion,
      },
    };
  },

  /**
   * Reemplaza todos los datos por los del volcado. Borra las tablas en orden
   * seguro (hijos antes que padres) y las recrea (padres antes que hijos).
   * Todo dentro de una transacción: si algo falla, no se aplica nada.
   * Devuelve el número total de registros restaurados.
   */
  async restaurar(datos: Record<string, unknown[]>): Promise<number> {
    const usuarios = conFechas(datos.usuarios as never, ["createdAt", "updatedAt"]);
    const proyectos = conFechas(datos.proyectos as never, [
      "createdAt",
      "updatedAt",
      "fechaInicio",
      "fechaEntrega",
    ]);
    const impresiones = conFechas(datos.impresiones as never, [
      "fecha",
      "createdAt",
      "updatedAt",
    ]);
    const salidas = conFechas(datos.salidas as never, [
      "fecha",
      "createdAt",
      "updatedAt",
    ]);
    const recogidas = conFechas(datos.recogidas as never, [
      "fecha",
      "createdAt",
      "resueltoEn",
    ]);
    const incidencias = conFechas(datos.incidencias as never, [
      "createdAt",
      "updatedAt",
    ]);
    const tintas = conFechas(datos.tintas as never, ["createdAt", "updatedAt"]);
    const lecturasTinta = conFechas(datos.lecturasTinta as never, [
      "fecha",
      "createdAt",
    ]);
    const papel = conFechas(datos.papel as never, ["createdAt", "updatedAt"]);
    const lecturasPapel = conFechas(datos.lecturasPapel as never, [
      "fecha",
      "createdAt",
    ]);
    const inventario = conFechas(datos.inventario as never, [
      "createdAt",
      "updatedAt",
    ]);
    const estanciasMapa = conFechas(datos.estanciasMapa as never, [
      "createdAt",
      "updatedAt",
    ]);
    const zonasMapa = conFechas(datos.zonasMapa as never, [
      "createdAt",
      "updatedAt",
    ]);
    const ubicacionesImpresion = conFechas(
      datos.ubicacionesImpresion as never,
      ["createdAt", "updatedAt"],
    );
    const auditoria = conFechas(datos.auditoria as never, ["createdAt"]);
    const configuracion = conFechas(datos.configuracion as never, ["updatedAt"]);
    const modulosConfiguracion = conFechas(
      datos.modulosConfiguracion as never,
      ["createdAt", "updatedAt"],
    );

    await prisma.$transaction(
      async (tx) => {
        // 1) Borrar hijos primero (respetando claves foráneas).
        await tx.lecturaTinta.deleteMany();
        await tx.lecturaPapel.deleteMany();
        await tx.ubicacionImpresion.deleteMany();
        await tx.impresion.deleteMany();
        await tx.salida.deleteMany();
        await tx.recogida.deleteMany();
        await tx.zonaMapa.deleteMany();
        await tx.auditoria.deleteMany();
        // 2) Borrar padres.
        await tx.estanciaMapa.deleteMany();
        await tx.tinta.deleteMany();
        await tx.papel.deleteMany();
        await tx.proyecto.deleteMany();
        await tx.incidencia.deleteMany();
        await tx.inventario.deleteMany();
        await tx.moduloConfiguracion.deleteMany();
        await tx.configuracion.deleteMany();
        await tx.usuario.deleteMany();

        // 3) Recrear padres.
        if (usuarios.length)
          await tx.usuario.createMany({ data: usuarios as never });
        if (configuracion.length)
          await tx.configuracion.createMany({ data: configuracion as never });
        if (modulosConfiguracion.length)
          await tx.moduloConfiguracion.createMany({
            data: modulosConfiguracion as never,
          });
        if (incidencias.length)
          await tx.incidencia.createMany({ data: incidencias as never });
        if (inventario.length)
          await tx.inventario.createMany({ data: inventario as never });
        if (proyectos.length)
          await tx.proyecto.createMany({ data: proyectos as never });
        if (estanciasMapa.length)
          await tx.estanciaMapa.createMany({ data: estanciasMapa as never });
        if (tintas.length) await tx.tinta.createMany({ data: tintas as never });
        if (papel.length) await tx.papel.createMany({ data: papel as never });

        // 4) Recrear hijos.
        if (impresiones.length)
          await tx.impresion.createMany({ data: impresiones as never });
        if (zonasMapa.length)
          await tx.zonaMapa.createMany({ data: zonasMapa as never });
        if (salidas.length)
          await tx.salida.createMany({ data: salidas as never });
        if (recogidas.length)
          await tx.recogida.createMany({ data: recogidas as never });
        if (ubicacionesImpresion.length)
          await tx.ubicacionImpresion.createMany({
            data: ubicacionesImpresion as never,
          });
        if (lecturasTinta.length)
          await tx.lecturaTinta.createMany({ data: lecturasTinta as never });
        if (lecturasPapel.length)
          await tx.lecturaPapel.createMany({ data: lecturasPapel as never });
        if (auditoria.length)
          await tx.auditoria.createMany({ data: auditoria as never });
      },
      { timeout: 30000 },
    );

    return (
      usuarios.length +
      proyectos.length +
      impresiones.length +
      salidas.length +
      recogidas.length +
      incidencias.length +
      tintas.length +
      lecturasTinta.length +
      papel.length +
      lecturasPapel.length +
      inventario.length +
      estanciasMapa.length +
      zonasMapa.length +
      ubicacionesImpresion.length +
      auditoria.length +
      configuracion.length +
      modulosConfiguracion.length
    );
  },
};
