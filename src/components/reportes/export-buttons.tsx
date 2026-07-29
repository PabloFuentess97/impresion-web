"use client";

import * as React from "react";
import { FileDown, FileSpreadsheet, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportarReportePDF } from "@/lib/export/pdf-report";
import { exportarReporteExcel } from "@/lib/export/excel-report";
import type { ReporteCompleto } from "@/services/reporte.service";

/** Botones de exportación e impresión del reporte. */
export function ExportButtons({
  reporte,
  nombreEmpresa,
}: {
  reporte: ReporteCompleto;
  nombreEmpresa: string;
}) {
  const [cargandoPdf, setCargandoPdf] = React.useState(false);
  const [cargandoExcel, setCargandoExcel] = React.useState(false);

  function manejarPDF() {
    try {
      setCargandoPdf(true);
      exportarReportePDF(reporte, nombreEmpresa);
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
      await exportarReporteExcel(reporte, nombreEmpresa);
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
