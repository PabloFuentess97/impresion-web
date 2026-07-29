import ExcelJS from "exceljs";
import { formatearFecha, formatearTiempo } from "@/lib/format";
import { ESTADOS_INCIDENCIA } from "@/lib/constants";
import { htmlATexto } from "@/lib/sanitize";
import type { ReporteCompleto } from "@/services/reporte.service";

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

/** Genera y descarga un archivo Excel (.xlsx) con el reporte completo. */
export async function exportarReporteExcel(
  reporte: ReporteCompleto,
  nombreEmpresa: string,
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = nombreEmpresa;
  wb.created = new Date();

  // --- Hoja: Resumen ---
  const resumen = wb.addWorksheet("Resumen");
  resumen.columns = [
    { header: "Concepto", key: "concepto", width: 32 },
    { header: "Valor", key: "valor", width: 28 },
  ];
  estilizarCabecera(resumen.getRow(1));
  resumen.addRows([
    { concepto: "Empresa", valor: nombreEmpresa },
    { concepto: "Período", valor: reporte.periodo },
    {
      concepto: "Desde",
      valor: formatearFecha(reporte.desde),
    },
    { concepto: "Hasta", valor: formatearFecha(reporte.hasta) },
    { concepto: "Proyectos con actividad", valor: reporte.resumen.totalProyectos },
    { concepto: "Impresiones", valor: reporte.resumen.totalImpresiones },
    { concepto: "Unidades totales", valor: reporte.resumen.cantidadTotal },
    { concepto: "Tiempo total", valor: formatearTiempo(reporte.resumen.tiempoTotal) },
    { concepto: "Incidencias", valor: reporte.resumen.totalIncidencias },
  ]);

  // --- Hoja: Proyectos ---
  const proyectos = wb.addWorksheet("Proyectos");
  proyectos.columns = [
    { header: "Proyecto", key: "titulo", width: 36 },
    { header: "Impresiones", key: "totalImpresiones", width: 14 },
    { header: "Cantidad", key: "cantidadTotal", width: 14 },
    { header: "Tiempo", key: "tiempo", width: 18 },
  ];
  estilizarCabecera(proyectos.getRow(1));
  reporte.proyectos.forEach((p) =>
    proyectos.addRow({
      titulo: p.titulo,
      totalImpresiones: p.totalImpresiones,
      cantidadTotal: p.cantidadTotal,
      tiempo: formatearTiempo(p.tiempoTotal),
    }),
  );

  // --- Hoja: Impresiones ---
  const impresiones = wb.addWorksheet("Impresiones");
  impresiones.columns = [
    { header: "Proyecto", key: "proyecto", width: 30 },
    { header: "Impresión", key: "impresion", width: 30 },
    { header: "Cantidad", key: "cantidad", width: 12 },
    { header: "Tiempo", key: "tiempo", width: 16 },
    { header: "Fecha", key: "fecha", width: 16 },
  ];
  estilizarCabecera(impresiones.getRow(1));
  reporte.impresiones.forEach((i) =>
    impresiones.addRow({
      proyecto: i.proyecto,
      impresion: i.impresion,
      cantidad: i.cantidad,
      tiempo: formatearTiempo(i.tiempo),
      fecha: formatearFecha(i.fecha),
    }),
  );

  // --- Hoja: Incidencias ---
  const incidencias = wb.addWorksheet("Incidencias");
  incidencias.columns = [
    { header: "Título", key: "titulo", width: 34 },
    { header: "Estado", key: "estado", width: 16 },
    { header: "Fecha", key: "fecha", width: 16 },
    { header: "Descripción", key: "descripcion", width: 60 },
  ];
  estilizarCabecera(incidencias.getRow(1));
  reporte.incidencias.forEach((i) =>
    incidencias.addRow({
      titulo: i.titulo,
      estado: ESTADOS_INCIDENCIA[i.estado].label,
      fecha: formatearFecha(i.fecha),
      descripcion: htmlATexto(i.descripcion),
    }),
  );

  // --- Hoja: Tintas ---
  if (reporte.tintas.length > 0) {
    const tintas = wb.addWorksheet("Tintas");
    tintas.columns = [
      { header: "Tinta", key: "nombre", width: 24 },
      { header: "% anterior", key: "anterior", width: 14 },
      { header: "% actual", key: "actual", width: 14 },
      { header: "% gastado", key: "gastado", width: 14 },
    ];
    estilizarCabecera(tintas.getRow(1));
    reporte.tintas.forEach((t) =>
      tintas.addRow({
        nombre: t.nombre,
        anterior: Math.round(t.nivelAnterior),
        actual: Math.round(t.nivelActual),
        gastado: t.gastado,
      }),
    );
  }

  // Descargar
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte-${reporte.periodo}-${formatearFecha(new Date()).replace(/\//g, "-")}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
