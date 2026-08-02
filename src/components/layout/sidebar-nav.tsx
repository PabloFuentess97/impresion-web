"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, HREFS_LECTOR } from "./nav-config";

/** Lista de enlaces de navegación con estado activo. */
export function SidebarNav({
  onNavigate,
  esLector = false,
}: {
  onNavigate?: () => void;
  esLector?: boolean;
}) {
  const pathname = usePathname();

  const items = esLector
    ? NAV_ITEMS.filter((item) => HREFS_LECTOR.includes(item.href))
    : NAV_ITEMS;

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const activo =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icono = item.icono;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              activo
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icono
              className={cn(
                "h-[18px] w-[18px] transition-colors",
                activo
                  ? "text-primary-foreground"
                  : "text-muted-foreground group-hover:text-accent-foreground",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
