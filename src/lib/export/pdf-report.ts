import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatearFecha, formatearTiempo } from "@/lib/format";
import { ESTADOS_INCIDENCIA } from "@/lib/constants";
import { htmlATexto } from "@/lib/sanitize";
import type { ReporteCompleto } from "@/services/reporte.service";

const ETIQUETA_PERIODO: Record<string, string> = {
  hoy: "Hoy",
  semana: "Esta semana",
  mes: "Este mes",
  personalizado: "Rango personalizado",
};

/** Genera y descarga un PDF con el reporte completo. */
export function exportarReportePDF(
  reporte: ReporteCompleto,
  nombreEmpresa: string,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const margen = 40;

  // Cabecera
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 40);
  doc.text(nombreEmpresa, margen, 50);
  doc.setFontSize(13);
  doc.setTextColor(90, 90, 100);
  doc.text("Reporte de actividad", margen, 70);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 130);
  const periodoTexto = `Período: ${ETIQUETA_PERIODO[reporte.periodo] ?? reporte.periodo}`;
  const rangoTexto = `${formatearFecha(reporte.desde)} - ${formatearFecha(reporte.hasta)}`;
  doc.text(periodoTexto, margen, 88);
  doc.text(rangoTexto, anchoPagina - margen, 88, { align: "right" });

  // Resumen
  doc.setDrawColor(230, 230, 235);
  doc.line(margen, 98, anchoPagina - margen, 98);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 70);
  const resumen = [
    `Proyectos con actividad: ${reporte.resumen.totalProyectos}`,
    `Impresiones: ${reporte.resumen.totalImpresiones}`,
    `Unidades: ${reporte.resumen.cantidadTotal}`,
    `Tiempo total: ${formatearTiempo(reporte.resumen.tiempoTotal)}`,
    `Incidencias: ${reporte.resumen.totalIncidencias}`,
  ];
  doc.text(resumen.join("     ·     "), margen, 116);

  let cursorY = 140;

  // Tabla: Proyectos modificados
  autoTable(doc, {
    startY: cursorY,
    head: [["Proyecto", "Impresiones", "Cantidad", "Tiempo"]],
    body: reporte.proyectos.map((p) => [
      p.titulo,
      String(p.totalImpresiones),
      String(p.cantidadTotal),
      formatearTiempo(p.tiempoTotal),
    ]),
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: margen, right: margen },
    didDrawPage: () => {
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 50);
      doc.text("Proyectos modificados", margen, cursorY - 8);
    },
  });

  // @ts-expect-error lastAutoTable lo añade el plugin
  cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 30;

  // Tabla: Impresiones realizadas
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 50);
  doc.text("Impresiones realizadas", margen, cursorY - 8);
  autoTable(doc, {
    startY: cursorY,
    head: [["Proyecto", "Impresión", "Cantidad", "Tiempo", "Fecha"]],
    body: reporte.impresiones.map((i) => [
      i.proyecto,
      i.impresion,
      String(i.cantidad),
      formatearTiempo(i.tiempo),
      formatearFecha(i.fecha),
    ]),
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: margen, right: margen },
  });

  // @ts-expect-error lastAutoTable lo añade el plugin
  cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 30;

  // Tabla: Incidencias
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 50);
  doc.text("Incidencias", margen, cursorY - 8);
  autoTable(doc, {
    startY: cursorY,
    head: [["Título", "Estado", "Fecha", "Descripción"]],
    body: reporte.incidencias.map((i) => [
      i.titulo,
      ESTADOS_INCIDENCIA[i.estado].label,
      formatearFecha(i.fecha),
      htmlATexto(i.descripcion).slice(0, 120),
    ]),
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 3: { cellWidth: 200 } },
    margin: { left: margen, right: margen },
  });

  // @ts-expect-error lastAutoTable lo añade el plugin
  cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 30;

  // Tabla: Consumo de tintas
  if (reporte.tintas.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 50);
    doc.text("Consumo de tintas", margen, cursorY - 8);
    autoTable(doc, {
      startY: cursorY,
      head: [["Tinta", "% anterior", "% actual", "% gastado"]],
      body: reporte.tintas.map((t) => [
        t.nombre,
        `${Math.round(t.nivelAnterior)}%`,
        `${Math.round(t.nivelActual)}%`,
        `${t.gastado}%`,
      ]),
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: margen, right: margen },
    });
  }

  // Tabla: Consumo de papel
  if (reporte.papel.length > 0) {
    // @ts-expect-error lastAutoTable lo añade el plugin
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 30;
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 50);
    doc.text("Consumo de papel", margen, cursorY - 8);
    autoTable(doc, {
      startY: cursorY,
      head: [["Papel", "Rollos anteriores", "Rollos actuales", "Rollos gastados"]],
      body: reporte.papel.map((p) => [
        p.nombre,
        String(p.rollosAnterior),
        String(p.rollosActual),
        String(p.gastado),
      ]),
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: margen, right: margen },
    });
  }

  // Pie de página con numeración
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 160);
    doc.text(
      `Generado el ${formatearFecha(new Date())} · Página ${i} de ${totalPaginas}`,
      anchoPagina / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" },
    );
  }

  doc.save(`reporte-${reporte.periodo}-${formatearFecha(new Date()).replace(/\//g, "-")}.pdf`);
}
