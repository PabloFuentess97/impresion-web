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
  CalendarDays,
  History,
  Map,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { HREFS_LECTOR, type ClaveModulo } from "@/lib/modules";

export interface NavItem {
  label: string;
  href: string;
  icono: LucideIcon;
  clave?: ClaveModulo;
}

/** Elementos de navegacion principal del panel. */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icono: LayoutDashboard,
    clave: "dashboard",
  },
  {
    label: "Proyectos",
    href: "/proyectos",
    icono: FolderKanban,
    clave: "proyectos",
  },
  { label: "Salidas", href: "/salidas", icono: Truck, clave: "salidas" },
  {
    label: "Recogidas",
    href: "/recogidas",
    icono: PackageCheck,
    clave: "recogidas",
  },
  {
    label: "Calendario",
    href: "/calendario",
    icono: CalendarDays,
    clave: "calendario",
  },
  { label: "Mapa visual", href: "/mapa", icono: Map, clave: "mapa" },
  {
    label: "Inventario",
    href: "/inventario",
    icono: Package,
    clave: "inventario",
  },
  {
    label: "Tintas y papel",
    href: "/tintas",
    icono: Droplets,
    clave: "tintas",
  },
  {
    label: "Incidencias",
    href: "/incidencias",
    icono: AlertTriangle,
    clave: "incidencias",
  },
  {
    label: "Reportes",
    href: "/reportes",
    icono: FileBarChart,
    clave: "reportes",
  },
  {
    label: "Base de conocimiento",
    href: "/base-conocimiento",
    icono: BookOpen,
    clave: "base-conocimiento",
  },
  { label: "Auditoría", href: "/auditoria", icono: History, clave: "auditoria" },
  { label: "Configuración", href: "/configuracion", icono: Settings },
];

export { HREFS_LECTOR };
