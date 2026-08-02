import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  nombreEmpresa: string;
  nombreUsuario: string;
  emailUsuario: string;
  esLector?: boolean;
}

/** Barra superior con navegación móvil, tema y menú de usuario. */
export function Header({
  nombreEmpresa,
  nombreUsuario,
  emailUsuario,
  esLector = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <MobileNav nombreEmpresa={nombreEmpresa} esLector={esLector} />
        <span className="text-sm font-medium text-muted-foreground lg:hidden">
          {nombreEmpresa}
        </span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {esLector && (
          <span className="hidden rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline">
            Solo lectura
          </span>
        )}
        <ThemeToggle />
        <UserMenu nombre={nombreUsuario} email={emailUsuario} esLector={esLector} />
      </div>
    </header>
  );
}
