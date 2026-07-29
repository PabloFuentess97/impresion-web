"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Hook para leer y actualizar los parámetros de la URL (query string)
 * de forma sencilla, preservando el resto de parámetros.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (nuevos: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(nuevos).forEach(([clave, valor]) => {
        if (valor === null || valor === undefined || valor === "") {
          params.delete(clave);
        } else {
          params.set(clave, String(valor));
        }
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const getParam = useCallback(
    (clave: string) => searchParams.get(clave) ?? "",
    [searchParams],
  );

  return { setParams, getParam, searchParams };
}
