export const CLAVES_MODULO = [
  "dashboard",
  "proyectos",
  "salidas",
  "recogidas",
  "mapa",
  "inventario",
  "tintas",
  "incidencias",
  "reportes",
  "base-conocimiento",
] as const;

export type ClaveModulo = (typeof CLAVES_MODULO)[number];

export interface ModuloDefinicion {
  clave: ClaveModulo;
  label: string;
  href: string;
  descripcion: string;
}

export const MODULOS_ACTIVABLES: ModuloDefinicion[] = [
  {
    clave: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    descripcion: "Resumen general, tarjetas estadísticas y gráficos de actividad.",
  },
  {
    clave: "proyectos",
    label: "Proyectos",
    href: "/proyectos",
    descripcion: "Gestión de proyectos, impresiones, rutas y bloqueos.",
  },
  {
    clave: "salidas",
    label: "Salidas",
    href: "/salidas",
    descripcion: "Registro y consulta de salidas de unidades de proyectos.",
  },
  {
    clave: "recogidas",
    label: "Recogidas",
    href: "/recogidas",
    descripcion: "Solicitudes por QR o lector pendientes de aprobación.",
  },
  {
    clave: "mapa",
    label: "Mapa visual",
    href: "/mapa",
    descripcion: "Estancias, zonas de almacenaje y ubicación de impresiones.",
  },
  {
    clave: "inventario",
    label: "Inventario",
    href: "/inventario",
    descripcion: "Artículos disponibles y cantidades en stock.",
  },
  {
    clave: "tintas",
    label: "Tintas y papel",
    href: "/tintas",
    descripcion: "Niveles de tinta y stock de rollos de papel.",
  },
  {
    clave: "incidencias",
    label: "Incidencias",
    href: "/incidencias",
    descripcion: "Registro y seguimiento de incidencias.",
  },
  {
    clave: "reportes",
    label: "Reportes",
    href: "/reportes",
    descripcion: "Reportes diarios, semanales, mensuales y exportaciones.",
  },
  {
    clave: "base-conocimiento",
    label: "Base de conocimiento",
    href: "/base-conocimiento",
    descripcion: "Centro privado de ayuda y guías de uso.",
  },
];

export const HREFS_LECTOR = ["/proyectos", "/salidas"] as const;

export function esClaveModulo(valor: string): valor is ClaveModulo {
  return (CLAVES_MODULO as readonly string[]).includes(valor);
}

export function obtenerModuloDefinicion(clave: ClaveModulo) {
  return MODULOS_ACTIVABLES.find((modulo) => modulo.clave === clave);
}
