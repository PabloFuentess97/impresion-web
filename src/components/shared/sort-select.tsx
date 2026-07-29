"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryParams } from "@/hooks/use-query-params";

interface OpcionOrden {
  value: string;
  label: string;
}

/** Selector de ordenación sincronizado con la URL. */
export function SortSelect({
  opciones,
  paramName = "orden",
  defecto,
}: {
  opciones: OpcionOrden[];
  paramName?: string;
  defecto: string;
}) {
  const { getParam, setParams } = useQueryParams();
  const valor = getParam(paramName) || defecto;

  return (
    <Select
      value={valor}
      onValueChange={(v) => setParams({ [paramName]: v, pagina: null })}
    >
      <SelectTrigger className="w-full sm:w-[190px]">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {opciones.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
