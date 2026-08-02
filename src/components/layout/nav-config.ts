import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  Truck,
  Droplets,
  Package,
  PackageCheck,
  FileBarChart,
  BookOpen,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icono: LucideIcon;
}

/** Rutas que puede ver el usuario de solo lectura (rol LECTOR). */
export const HREFS_LECTOR = ["/proyectos", "/salidas"];

/** Elementos de navegación principal del panel. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icono: LayoutDashboard },
  { label: "Proyectos", href: "/proyectos", icono: FolderKanban },
  { label: "Salidas", href: "/salidas", icono: Truck },
  { label: "Recogidas", href: "/recogidas", icono: PackageCheck },
  { label: "Inventario", href: "/inventario", icono: Package },
  { label: "Tintas y papel", href: "/tintas", icono: Droplets },
  { label: "Incidencias", href: "/incidencias", icono: AlertTriangle },
  { label: "Reportes", href: "/reportes", icono: FileBarChart },
  { label: "Base de conocimiento", href: "/base-conocimiento", icono: BookOpen },
  { label: "Configuración", href: "/configuracion", icono: Settings },
];
