"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/use-query-params";

interface PaginationProps {
  pagina: number;
  totalPaginas: number;
  total: number;
}

/** Controles de paginación sincronizados con la URL. */
export function Pagination({ pagina, totalPaginas, total }: PaginationProps) {
  const { setParams } = useQueryParams();

  if (totalPaginas <= 1) {
    return (
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "resultado" : "resultados"}
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Página {pagina} de {totalPaginas} · {total} resultados
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagina <= 1}
          onClick={() => setParams({ pagina: pagina - 1 })}
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pagina >= totalPaginas}
          onClick={() => setParams({ pagina: pagina + 1 })}
        >
          Siguiente <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
