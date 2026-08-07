import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ESTADOS_PROYECTO, PRIORIDADES_PROYECTO } from "@/lib/constants";
import {
  formatearFecha,
  formatearNumero,
  formatearTiempo,
} from "@/lib/format";
import type { ReporteProyectosCompleto } from "@/services/proyecto-reporte.service";

function finalAutoTableY(doc: jsPDF, fallback: number) {
  return (
    (
      doc as jsPDF & {
        lastAutoTable?: { finalY?: number };
      }
    ).lastAutoTable?.finalY ?? fallback
  );
}

function asegurarEspacio(doc: jsPDF, cursorY: number, altoNecesario = 90) {
  const altoPagina = doc.internal.pageSize.getHeight();
  if (cursorY + altoNecesario < altoPagina - 40) return cursorY;
  doc.addPage();
  return 48;
}

/** Genera y descarga el reporte global de proyectos en PDF. */
export function exportarReporteProyectosPDF(
  reporte: ReporteProyectosCompleto,
  nombreEmpresa: string,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const margen = 40;

  doc.setFontSize(18);
  doc.setTextColor(30, 30, 40);
  doc.text(nombreEmpresa, margen, 50);
  doc.setFontSize(13);
  doc.setTextColor(90, 90, 100);
  doc.text("Reporte global de proyectos", margen, 70);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 130);
  doc.text(`Generado el ${formatearFecha(reporte.generadoEl)}`, margen, 88);

  doc.setDrawColor(230, 230, 235);
  doc.line(margen, 98, anchoPagina - margen, 98);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 70);
  const resumen = [
    `Proyectos: ${reporte.resumen.totalProyectos}`,
    `Impresiones: ${reporte.resumen.totalImpresiones}`,
    `Unidades impresas: ${formatearNumero(reporte.resumen.cantidadImpresaTotal)}`,
    `Salidas: ${formatearNumero(reporte.resumen.cantidadSalidasTotal)}`,
    `Restantes: ${formatearNumero(reporte.resumen.unidadesRestantesTotal)}`,
    `Tiempo: ${formatearTiempo(reporte.resumen.tiempoTotal)}`,
  ];
  doc.text(resumen.join("     ·     "), margen, 116);

  let cursorY = 148;

  doc.setFontSize(11);
  doc.setTextColor(40, 40, 50);
  doc.text("Resumen por proyecto", margen, cursorY - 8);
  autoTable(doc, {
    startY: cursorY,
    head: [
      [
        "Proyecto",
        "Estado",
        "Prioridad",
        "Objetivo",
        "Impreso",
        "Salidas",
        "Restantes",
        "Tiempo",
      ],
    ],
    body: reporte.proyectos.map((proyecto) => [
      proyecto.titulo,
      ESTADOS_PROYECTO[proyecto.estado].label,
      PRIORIDADES_PROYECTO[proyecto.prioridad].label,
      proyecto.cantidadProduccion == null
        ? "Sin objetivo"
        : formatearNumero(proyecto.cantidadProduccion),
      formatearNumero(proyecto.cantidadImpresa),
      formatearNumero(proyecto.cantidadSalidas),
      proyecto.unidadesRestantes == null
        ? "Sin objetivo"
        : formatearNumero(proyecto.unidadesRestantes),
      formatearTiempo(proyecto.tiempoTotal),
    ]),
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: margen, right: margen },
  });

  cursorY = finalAutoTableY(doc, cursorY) + 32;

  for (const proyecto of reporte.proyectos) {
    cursorY = asegurarEspacio(doc, cursorY, 130);
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 40);
    doc.text(proyecto.titulo, margen, cursorY);
    cursorY += 16;

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 100);
    const detalle = [
      `Estado: ${ESTADOS_PROYECTO[proyecto.estado].label}`,
      `Prioridad: ${PRIORIDADES_PROYECTO[proyecto.prioridad].label}`,
      `Objetivo: ${
        proyecto.cantidadProduccion == null
          ? "Sin objetivo"
          : formatearNumero(proyecto.cantidadProduccion)
      }`,
      `Impreso: ${formatearNumero(proyecto.cantidadImpresa)}`,
      `Salidas: ${formatearNumero(proyecto.cantidadSalidas)}`,
      `Restantes: ${
        proyecto.unidadesRestantes == null
          ? "Sin objetivo"
          : formatearNumero(proyecto.unidadesRestantes)
      }`,
    ];
    doc.text(detalle.join("  ·  "), margen, cursorY);
    cursorY += 18;

    const impresiones = reporte.impresiones.filter(
      (impresion) => impresion.proyectoId === proyecto.id,
    );
    autoTable(doc, {
      startY: cursorY,
      head: [["Impresión", "Cantidad", "Tiempo", "Fecha"]],
      body:
        impresiones.length > 0
          ? impresiones.map((impresion) => [
              impresion.nombre,
              formatearNumero(impresion.cantidad),
              formatearTiempo(impresion.tiempo),
              formatearFecha(impresion.fecha),
            ])
          : [["Sin impresiones registradas", "", "", ""]],
      headStyles: { fillColor: [31, 41, 55], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: margen, right: margen },
    });
    cursorY = finalAutoTableY(doc, cursorY) + 18;

    cursorY = asegurarEspacio(doc, cursorY, 80);
    const salidas = reporte.salidas.filter(
      (salida) => salida.proyectoId === proyecto.id,
    );
    autoTable(doc, {
      startY: cursorY,
      head: [["Destino", "Unidades", "Fecha", "Nota"]],
      body:
        salidas.length > 0
          ? salidas.map((salida) => [
              salida.destino,
              formatearNumero(salida.cantidad),
              formatearFecha(salida.fecha),
              salida.nota ?? "",
            ])
          : [["Sin salidas registradas", "", "", ""]],
      headStyles: { fillColor: [31, 41, 55], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 3: { cellWidth: 180 } },
      margin: { left: margen, right: margen },
    });
    cursorY = finalAutoTableY(doc, cursorY) + 34;
  }

  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 160);
    doc.text(
      `Reporte de proyectos · Página ${i} de ${totalPaginas}`,
      anchoPagina / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" },
    );
  }

  doc.save(
    `reporte-proyectos-${formatearFecha(new Date()).replace(/\//g, "-")}.pdf`,
  );
}
