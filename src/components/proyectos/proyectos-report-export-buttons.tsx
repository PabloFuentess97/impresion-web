"use client";

import * as React from "react";
import { FileDown, FileSpreadsheet, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportarReporteProyectosPDF } from "@/lib/export/pdf-proyectos-report";
import { exportarReporteProyectosExcel } from "@/lib/export/excel-proyectos-report";
import type { ReporteProyectosCompleto } from "@/services/proyecto-reporte.service";

/** Botones de exportación para el reporte global de proyectos. */
export function ProyectosReportExportButtons({
  reporte,
  nombreEmpresa,
}: {
  reporte: ReporteProyectosCompleto;
  nombreEmpresa: string;
}) {
  const [cargandoPdf, setCargandoPdf] = React.useState(false);
  const [cargandoExcel, setCargandoExcel] = React.useState(false);

  function manejarPDF() {
    try {
      setCargandoPdf(true);
      exportarReporteProyectosPDF(reporte, nombreEmpresa);
      toast.success("PDF generado correctamente.");
    } catch {
      toast.error("No se pudo generar el PDF.");
    } finally {
      setCargandoPdf(false);
    }
  }

  async function manejarExcel() {
    try {
      setCargandoExcel(true);
      await exportarReporteProyectosExcel(reporte, nombreEmpresa);
      toast.success("Excel generado correctamente.");
    } catch {
      toast.error("No se pudo generar el Excel.");
    } finally {
      setCargandoExcel(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 no-imprimir">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Imprimir
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={manejarPDF}
        disabled={cargandoPdf}
      >
        {cargandoPdf ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={manejarExcel}
        disabled={cargandoExcel}
      >
        {cargandoExcel ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        Excel
      </Button>
    </div>
  );
}
