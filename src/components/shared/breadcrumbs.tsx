import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Miga {
  label: string;
  href?: string;
}

/** Migas de pan (breadcrumbs) para la navegación jerárquica. */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Miga[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Ruta de navegación"
      className={cn("flex items-center gap-1.5 text-sm", className)}
    >
      {items.map((item, i) => {
        const esUltimo = i === items.length - 1;
        return (
          <div key={i} className="flex items-center gap-1.5">
            {item.href && !esUltimo ? (
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  esUltimo ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            )}
            {!esUltimo && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
