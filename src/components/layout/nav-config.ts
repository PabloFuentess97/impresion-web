import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  Truck,
  Droplets,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icono: LucideIcon;
}

/** Elementos de navegación principal del panel. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icono: LayoutDashboard },
  { label: "Proyectos", href: "/proyectos", icono: FolderKanban },
  { label: "Salidas", href: "/salidas", icono: Truck },
  { label: "Tintas y papel", href: "/tintas", icono: Droplets },
  { label: "Incidencias", href: "/incidencias", icono: AlertTriangle },
  { label: "Reportes", href: "/reportes", icono: FileBarChart },
  { label: "Configuración", href: "/configuracion", icono: Settings },
];
