"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQueryParams } from "@/hooks/use-query-params";

interface SearchBarProps {
  placeholder?: string;
  /** Nombre del parámetro en la URL. Por defecto "q". */
  paramName?: string;
  className?: string;
}

/**
 * Buscador con "debounce" que sincroniza el término con la URL.
 * Reinicia a la página 1 en cada búsqueda.
 */
export function SearchBar({
  placeholder = "Buscar...",
  paramName = "q",
  className,
}: SearchBarProps) {
  const { getParam, setParams } = useQueryParams();
  const [valor, setValor] = React.useState(getParam(paramName));

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (valor !== getParam(paramName)) {
        setParams({ [paramName]: valor || null, pagina: null });
      }
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <div className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {valor && (
          <button
            type="button"
            onClick={() => setValor("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
