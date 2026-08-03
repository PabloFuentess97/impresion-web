"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryParams } from "@/hooks/use-query-params";
import { OPCIONES_TAMANO_PAGINA, PAGINA_TAMANO } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PaginationProps {
  pagina: number;
  totalPaginas: number;
  total: number;
  tamano?: number;
  pageParam?: string;
  sizeParam?: string;
  className?: string;
  extraParams?: Record<string, string | number | null | undefined>;
}

function paginasVisibles(actual: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set([1, total, actual, actual - 1, actual + 1]);
  if (actual <= 3) {
    paginas.add(2);
    paginas.add(3);
    paginas.add(4);
  }
  if (actual >= total - 2) {
    paginas.add(total - 3);
    paginas.add(total - 2);
    paginas.add(total - 1);
  }

  const ordenadas = [...paginas]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  return ordenadas.reduce<(number | "ellipsis")[]>((acc, p) => {
    const anterior = acc[acc.length - 1];
    if (typeof anterior === "number" && p - anterior > 1) acc.push("ellipsis");
    acc.push(p);
    return acc;
  }, []);
}

/** Controles de paginación sincronizados con la URL. */
export function Pagination({
  pagina,
  totalPaginas,
  total,
  tamano = PAGINA_TAMANO,
  pageParam = "pagina",
  sizeParam = "tamano",
  className,
  extraParams = {},
}: PaginationProps) {
  const { setParams } = useQueryParams();

  if (total <= PAGINA_TAMANO) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {total} {total === 1 ? "resultado" : "resultados"}
      </p>
    );
  }

  const inicio = total === 0 ? 0 : (pagina - 1) * tamano + 1;
  const fin = Math.min(total, pagina * tamano);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          Mostrando {inicio}-{fin} de {total}
        </p>
        <p className="text-xs text-muted-foreground">
          Página {pagina} de {totalPaginas}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Mostrar</span>
          <Select
            value={String(tamano)}
            onValueChange={(value) =>
              setParams({ ...extraParams, [sizeParam]: value, [pageParam]: null })
            }
          >
            <SelectTrigger className="h-8 w-[84px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {OPCIONES_TAMANO_PAGINA.map((opcion) => (
                <SelectItem key={opcion} value={String(opcion)}>
                  {opcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={pagina <= 1}
            onClick={() => setParams({ ...extraParams, [pageParam]: pagina - 1 })}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="hidden items-center gap-1 md:flex">
            {paginasVisibles(pagina, totalPaginas).map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={"ellipsis-" + index}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === pagina ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 px-0"
                  onClick={() => setParams({ ...extraParams, [pageParam]: item })}
                >
                  {item}
                </Button>
              ),
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={pagina >= totalPaginas}
            onClick={() => setParams({ ...extraParams, [pageParam]: pagina + 1 })}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
