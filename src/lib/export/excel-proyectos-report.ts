import ExcelJS from "exceljs";
import { ESTADOS_PROYECTO, PRIORIDADES_PROYECTO } from "@/lib/constants";
import {
  formatearFecha,
  formatearTiempo,
} from "@/lib/format";
import type { ReporteProyectosCompleto } from "@/services/proyecto-reporte.service";

const COLOR_CABECERA = "FF4F46E5";

function estilizarCabecera(fila: ExcelJS.Row) {
  fila.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_CABECERA },
    };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.alignment = { vertical: "middle" };
  });
}

/** Genera y descarga el reporte global de proyectos en Excel. */
export async function exportarReporteProyectosExcel(
  reporte: ReporteProyectosCompleto,
  nombreEmpresa: string,
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = nombreEmpresa;
  wb.created = new Date();

  const resumen = wb.addWorksheet("Resumen");
  resumen.columns = [
    { header: "Concepto", key: "concepto", width: 34 },
    { header: "Valor", key: "valor", width: 28 },
  ];
  estilizarCabecera(resumen.getRow(1));
  resumen.addRows([
    { concepto: "Empresa", valor: nombreEmpresa },
    { concepto: "Generado el", valor: formatearFecha(reporte.generadoEl) },
    { concepto: "Total de proyectos", valor: reporte.resumen.totalProyectos },
    { concepto: "Total de impresiones", valor: reporte.resumen.totalImpresiones },
    {
      concepto: "Unidades impresas",
      valor: reporte.resumen.cantidadImpresaTotal,
    },
    { concepto: "Tiempo total", valor: formatearTiempo(reporte.resumen.tiempoTotal) },
    { concepto: "Registros de salida", valor: reporte.resumen.totalSalidas },
    {
      concepto: "Unidades salidas",
      valor: reporte.resumen.cantidadSalidasTotal,
    },
    {
      concepto: "Unidades restantes",
      valor: reporte.resumen.unidadesRestantesTotal,
    },
  ]);

  const proyectos = wb.addWorksheet("Proyectos");
  proyectos.columns = [
    { header: "Proyecto", key: "titulo", width: 34 },
    { header: "Descripción", key: "descripcion", width: 46 },
    { header: "Ruta impresión", key: "rutaImpresion", width: 38 },
    { header: "Estado", key: "estado", width: 18 },
    { header: "Prioridad", key: "prioridad", width: 14 },
    { header: "Objetivo", key: "objetivo", width: 14 },
    { header: "Unidades impresas", key: "cantidadImpresa", width: 18 },
    { header: "Registros impresión", key: "totalImpresiones", width: 18 },
    { header: "Tiempo", key: "tiempo", width: 18 },
    { header: "Unidades salidas", key: "cantidadSalidas", width: 18 },
    { header: "Registros salida", key: "totalSalidas", width: 16 },
    { header: "Unidades restantes", key: "unidadesRestantes", width: 20 },
    { header: "Creado", key: "createdAt", width: 16 },
    { header: "Inicio", key: "fechaInicio", width: 16 },
    { header: "Entrega", key: "fechaEntrega", width: 16 },
  ];
  estilizarCabecera(proyectos.getRow(1));
  reporte.proyectos.forEach((proyecto) =>
    proyectos.addRow({
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion ?? "",
      rutaImpresion: proyecto.rutaImpresion ?? "",
      estado: ESTADOS_PROYECTO[proyecto.estado].label,
      prioridad: PRIORIDADES_PROYECTO[proyecto.prioridad].label,
      objetivo: proyecto.cantidadProduccion ?? "Sin objetivo",
      cantidadImpresa: proyecto.cantidadImpresa,
      totalImpresiones: proyecto.totalImpresiones,
      tiempo: formatearTiempo(proyecto.tiempoTotal),
      cantidadSalidas: proyecto.cantidadSalidas,
      totalSalidas: proyecto.totalSalidas,
      unidadesRestantes: proyecto.unidadesRestantes ?? "Sin objetivo",
      createdAt: formatearFecha(proyecto.createdAt),
      fechaInicio: proyecto.fechaInicio ? formatearFecha(proyecto.fechaInicio) : "",
      fechaEntrega: proyecto.fechaEntrega
        ? formatearFecha(proyecto.fechaEntrega)
        : "",
    }),
  );

  const impresiones = wb.addWorksheet("Impresiones");
  impresiones.columns = [
    { header: "Proyecto", key: "proyecto", width: 34 },
    { header: "Impresión", key: "nombre", width: 34 },
    { header: "Cantidad", key: "cantidad", width: 14 },
    { header: "Tiempo", key: "tiempo", width: 18 },
    { header: "Fecha", key: "fecha", width: 16 },
  ];
  estilizarCabecera(impresiones.getRow(1));
  reporte.impresiones.forEach((impresion) =>
    impresiones.addRow({
      proyecto: impresion.proyecto,
      nombre: impresion.nombre,
      cantidad: impresion.cantidad,
      tiempo: formatearTiempo(impresion.tiempo),
      fecha: formatearFecha(impresion.fecha),
    }),
  );

  const salidas = wb.addWorksheet("Salidas");
  salidas.columns = [
    { header: "Proyecto", key: "proyecto", width: 34 },
    { header: "Destino", key: "destino", width: 32 },
    { header: "Unidades", key: "cantidad", width: 14 },
    { header: "Fecha", key: "fecha", width: 16 },
    { header: "Nota", key: "nota", width: 50 },
  ];
  estilizarCabecera(salidas.getRow(1));
  reporte.salidas.forEach((salida) =>
    salidas.addRow({
      proyecto: salida.proyecto,
      destino: salida.destino,
      cantidad: salida.cantidad,
      fecha: formatearFecha(salida.fecha),
      nota: salida.nota ?? "",
    }),
  );

  for (const hoja of wb.worksheets) {
    hoja.views = [{ state: "frozen", ySplit: 1 }];
    hoja.eachRow((fila) => {
      fila.alignment = { vertical: "top", wrapText: true };
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte-proyectos-${formatearFecha(new Date()).replace(/\//g, "-")}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
