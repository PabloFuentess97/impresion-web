import { Printer } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";

/** Barra lateral fija (escritorio). */
export function Sidebar({ nombreEmpresa }: { nombreEmpresa: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
          <Printer className="h-5 w-5" />
        </div>
        <span className="truncate text-base font-bold tracking-tight">
          {nombreEmpresa}
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto py-4 scrollbar-thin">
        <SidebarNav />
      </div>
      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} · v1.0
        </p>
      </div>
    </aside>
  );
}
