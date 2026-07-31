/**
 * Ilustraciones de la aplicación para la base de conocimiento.
 *
 * Son maquetas SVG que reproducen las pantallas reales del panel
 * (dashboard, proyectos, tintas, incidencias, reportes…). Usan los tokens
 * de tema de Tailwind (`fill-*`, `stroke-*`) para adaptarse automáticamente
 * a los modos claro y oscuro.
 */
import * as React from "react";

type SvgProps = React.SVGProps<SVGSVGElement>;

/** Marco de ventana común: barra de título + carril lateral. */
function Marco({
  children,
  ...props
}: SvgProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 250"
      role="img"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      {/* Fondo de la ventana */}
      <rect
        x="1"
        y="1"
        width="398"
        height="248"
        rx="14"
        className="fill-background stroke-border"
        strokeWidth="1.5"
      />
      {/* Barra de título */}
      <path
        d="M1 15 a14 14 0 0 1 14 -14 h370 a14 14 0 0 1 14 14 v14 h-398 z"
        className="fill-muted"
      />
      <circle cx="18" cy="15" r="3.5" className="fill-destructive" opacity="0.7" />
      <circle cx="30" cy="15" r="3.5" className="fill-warning" opacity="0.7" />
      <circle cx="42" cy="15" r="3.5" className="fill-success" opacity="0.7" />
      {/* Carril lateral */}
      <rect x="1" y="29" width="86" height="220" className="fill-card" />
      <line x1="87" y1="29" x2="87" y2="249" className="stroke-border" strokeWidth="1.5" />
      <rect x="12" y="42" width="64" height="9" rx="3" className="fill-primary/25" />
      {[64, 82, 100, 118, 136].map((y, i) => (
        <rect
          key={y}
          x="12"
          y={y}
          width={i === 0 ? 64 : 52}
          height="7"
          rx="3.5"
          className={i === 0 ? "fill-primary" : "fill-muted-foreground/30"}
        />
      ))}
      {children}
    </svg>
  );
}

/** Dashboard: tarjetas de estadísticas + gráficos. */
export function IlustracionDashboard(props: SvgProps) {
  return (
    <Marco {...props}>
      <rect x="104" y="42" width="120" height="10" rx="4" className="fill-foreground/70" />
      {/* Tarjetas de estadísticas */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${104 + i * 96}, 66)`}>
          <rect width="86" height="46" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
          <rect x="10" y="11" width="34" height="6" rx="3" className="fill-muted-foreground/40" />
          <rect x="10" y="24" width="24" height="10" rx="3" className="fill-foreground/80" />
          <rect x="62" y="12" width="16" height="16" rx="5" className="fill-primary/15" />
          <circle cx="70" cy="20" r="3.5" className="fill-primary" />
        </g>
      ))}
      {/* Gráfico de barras */}
      <g transform="translate(104, 126)">
        <rect width="182" height="112" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="12" y="12" width="60" height="6" rx="3" className="fill-foreground/60" />
        {[34, 52, 26, 60, 40, 48, 30].map((h, i) => (
          <rect
            key={i}
            x={14 + i * 23}
            y={92 - h}
            width="14"
            height={h}
            rx="3"
            className="fill-primary"
            opacity={0.55 + i * 0.06}
          />
        ))}
      </g>
      {/* Gráfico donut */}
      <g transform="translate(296, 126)">
        <rect width="92" height="112" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <circle cx="46" cy="58" r="28" className="fill-none stroke-muted" strokeWidth="10" />
        <circle
          cx="46"
          cy="58"
          r="28"
          className="fill-none stroke-primary"
          strokeWidth="10"
          strokeDasharray="120 176"
          strokeLinecap="round"
          transform="rotate(-90 46 58)"
        />
        <circle
          cx="46"
          cy="58"
          r="28"
          className="fill-none stroke-warning"
          strokeWidth="10"
          strokeDasharray="46 176"
          strokeDashoffset="-120"
          strokeLinecap="round"
          transform="rotate(-90 46 58)"
        />
      </g>
    </Marco>
  );
}

/** Cabecera de tabla + filas reutilizable. */
function Tabla({
  filas,
  destacada = -1,
}: {
  filas: number;
  destacada?: number;
}) {
  return (
    <g transform="translate(104, 78)">
      <rect width="284" height="160" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
      {/* Cabecera */}
      <rect x="0" y="0" width="284" height="26" rx="8" className="fill-muted" />
      {[16, 120, 200, 250].map((x, i) => (
        <rect key={x} x={x} y="10" width={i === 0 ? 70 : 44} height="6" rx="3" className="fill-muted-foreground/50" />
      ))}
      {/* Filas */}
      {Array.from({ length: filas }).map((_, r) => {
        const y = 26 + r * ((160 - 26) / filas);
        const alto = (160 - 26) / filas;
        const esDestacada = r === destacada;
        return (
          <g key={r} transform={`translate(0, ${y})`}>
            {esDestacada && (
              <rect x="1" y="1" width="282" height={alto - 2} className="fill-warning/10" />
            )}
            <line x1="0" y1={alto} x2="284" y2={alto} className="stroke-border" strokeWidth="1" />
            <rect x="16" y={alto / 2 - 3} width="72" height="6" rx="3" className={esDestacada ? "fill-warning" : "fill-foreground/70"} />
            <rect x="120" y={alto / 2 - 3} width="40" height="6" rx="3" className="fill-muted-foreground/40" />
            <rect x="200" y={alto / 2 - 3} width="30" height="6" rx="3" className="fill-muted-foreground/40" />
            <circle cx="262" cy={alto / 2} r="2" className="fill-muted-foreground/50" />
            <circle cx="268" cy={alto / 2} r="2" className="fill-muted-foreground/50" />
            <circle cx="274" cy={alto / 2} r="2" className="fill-muted-foreground/50" />
          </g>
        );
      })}
    </g>
  );
}

/** Proyectos: buscador + tabla con una fila bloqueada resaltada. */
export function IlustracionProyectos(props: SvgProps) {
  return (
    <Marco {...props}>
      <rect x="104" y="42" width="90" height="10" rx="4" className="fill-foreground/70" />
      <rect x="104" y="60" width="150" height="14" rx="7" className="fill-card stroke-border" strokeWidth="1.5" />
      <circle cx="114" cy="67" r="3" className="fill-none stroke-muted-foreground" strokeWidth="1.5" />
      <rect x="342" y="58" width="46" height="16" rx="8" className="fill-primary" />
      <Tabla filas={5} destacada={2} />
    </Marco>
  );
}

/** Salidas: tabla de envíos de material a destinos. */
export function IlustracionSalidas(props: SvgProps) {
  return (
    <Marco {...props}>
      <rect x="104" y="42" width="80" height="10" rx="4" className="fill-foreground/70" />
      <rect x="332" y="40" width="56" height="16" rx="8" className="fill-primary" />
      <g transform="translate(104, 64)">
        <rect width="284" height="174" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="0" y="0" width="284" height="26" rx="8" className="fill-muted" />
        {[16, 120, 210].map((x) => (
          <rect key={x} x={x} y="10" width="50" height="6" rx="3" className="fill-muted-foreground/50" />
        ))}
        {[0, 1, 2, 3, 4].map((r) => {
          const y = 26 + r * 29.6;
          return (
            <g key={r} transform={`translate(0, ${y})`}>
              <line x1="0" y1="29.6" x2="284" y2="29.6" className="stroke-border" strokeWidth="1" />
              <rect x="16" y="10" width="80" height="6" rx="3" className="fill-foreground/70" />
              <rect x="120" y="8" width="52" height="12" rx="6" className="fill-accent" />
              <rect x="210" y="9" width="26" height="10" rx="4" className="fill-primary/20" />
            </g>
          );
        })}
      </g>
    </Marco>
  );
}

/** Inventario: lista de artículos con cantidades. */
export function IlustracionInventario(props: SvgProps) {
  return (
    <Marco {...props}>
      <rect x="104" y="42" width="86" height="10" rx="4" className="fill-foreground/70" />
      <rect x="336" y="40" width="52" height="16" rx="8" className="fill-primary" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(104, ${68 + i * 42})`}>
          <rect width="284" height="34" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
          <rect x="12" y="11" width="16" height="12" rx="3" className="fill-primary/15" />
          <path d="M16 17 h8 M20 13 v8" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="40" y="10" width="90" height="6" rx="3" className="fill-foreground/70" />
          <rect x="40" y="21" width="60" height="5" rx="2.5" className="fill-muted-foreground/40" />
          <rect x="238" y="11" width="34" height="13" rx="6" className="fill-success/15" />
          <rect x="246" y="15" width="18" height="5" rx="2.5" className="fill-success" />
        </g>
      ))}
    </Marco>
  );
}

/** Tintas y papel: niveles CMYK + stock de rollos. */
export function IlustracionTintas(props: SvgProps) {
  const tintas = [
    { c: "fill-[hsl(190_90%_45%)]", nivel: 0.8 },
    { c: "fill-[hsl(320_80%_55%)]", nivel: 0.55 },
    { c: "fill-warning", nivel: 0.3 },
    { c: "fill-foreground/80", nivel: 0.65 },
  ];
  return (
    <Marco {...props}>
      <rect x="104" y="42" width="100" height="10" rx="4" className="fill-foreground/70" />
      {/* Barras de nivel de tinta */}
      <g transform="translate(104, 66)">
        <rect width="182" height="120" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="12" y="12" width="50" height="6" rx="3" className="fill-foreground/60" />
        {tintas.map((t, i) => {
          const x = 18 + i * 42;
          const altoMax = 66;
          const alto = altoMax * t.nivel;
          return (
            <g key={i}>
              <rect x={x} y={34} width="26" height={altoMax} rx="6" className="fill-muted" />
              <rect x={x} y={34 + (altoMax - alto)} width="26" height={alto} rx="6" className={t.c} />
              <rect x={x + 4} y={106} width="18" height="5" rx="2.5" className="fill-muted-foreground/40" />
            </g>
          );
        })}
      </g>
      {/* Rollos de papel */}
      <g transform="translate(296, 66)">
        <rect width="92" height="120" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="12" y="12" width="46" height="6" rx="3" className="fill-foreground/60" />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${18 + i * 34}, 40)`}>
            <ellipse cx="12" cy="10" rx="12" ry="6" className="fill-primary/25 stroke-primary" strokeWidth="1.5" />
            <path d="M0 10 v34 a12 6 0 0 0 24 0 v-34" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
            <ellipse cx="12" cy="10" rx="4" ry="2" className="fill-primary" />
          </g>
        ))}
        <rect x="24" y="96" width="44" height="14" rx="7" className="fill-accent" />
      </g>
    </Marco>
  );
}

/** Incidencias: lista con estados de color y texto enriquecido. */
export function IlustracionIncidencias(props: SvgProps) {
  const estados = ["fill-warning", "fill-destructive", "fill-success", "fill-primary"];
  return (
    <Marco {...props}>
      <rect x="104" y="42" width="94" height="10" rx="4" className="fill-foreground/70" />
      <rect x="330" y="40" width="58" height="16" rx="8" className="fill-primary" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(104, ${68 + i * 42})`}>
          <rect width="284" height="34" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
          <path
            d="M14 10 l7 12 h-14 z"
            className="fill-warning/70"
            transform={`translate(${0}, ${5})`}
          />
          <rect x="34" y="9" width="120" height="6" rx="3" className="fill-foreground/70" />
          <rect x="34" y="20" width="170" height="5" rx="2.5" className="fill-muted-foreground/35" />
          <rect x="228" y="11" width="46" height="13" rx="6.5" className={`${estados[i]}/15`} />
          <circle cx="238" cy="17.5" r="2.5" className={estados[i]} />
          <rect x="245" y="15" width="24" height="5" rx="2.5" className={estados[i]} />
        </g>
      ))}
    </Marco>
  );
}

/** Reportes: rango de fechas, gráfico y botones de exportación. */
export function IlustracionReportes(props: SvgProps) {
  return (
    <Marco {...props}>
      <rect x="104" y="42" width="80" height="10" rx="4" className="fill-foreground/70" />
      {/* Chips de rango */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={104 + i * 44}
          y="60"
          width="38"
          height="15"
          rx="7.5"
          className={i === 1 ? "fill-primary" : "fill-card stroke-border"}
          strokeWidth="1.5"
        />
      ))}
      {/* Botones exportar */}
      <rect x="296" y="60" width="42" height="15" rx="4" className="fill-destructive/15 stroke-destructive/40" strokeWidth="1" />
      <rect x="302" y="65" width="30" height="5" rx="2.5" className="fill-destructive" />
      <rect x="344" y="60" width="44" height="15" rx="4" className="fill-success/15 stroke-success/40" strokeWidth="1" />
      <rect x="350" y="65" width="32" height="5" rx="2.5" className="fill-success" />
      {/* Gráfico de líneas */}
      <g transform="translate(104, 86)">
        <rect width="284" height="152" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        {[40, 72, 104, 136].map((y) => (
          <line key={y} x1="16" y1={y} x2="268" y2={y} className="stroke-border" strokeWidth="1" opacity="0.6" />
        ))}
        <polyline
          points="20,120 60,90 100,102 140,60 180,74 220,40 264,54"
          className="fill-none stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points="20,120 60,90 100,102 140,60 180,74 220,40 264,54 264,140 20,140"
          className="fill-primary/10"
        />
        {[[20, 120], [60, 90], [100, 102], [140, 60], [180, 74], [220, 40], [264, 54]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" className="fill-background stroke-primary" strokeWidth="2" />
        ))}
      </g>
    </Marco>
  );
}

/** Configuración: formulario de empresa + logo + tema. */
export function IlustracionConfiguracion(props: SvgProps) {
  return (
    <Marco {...props}>
      <rect x="104" y="42" width="96" height="10" rx="4" className="fill-foreground/70" />
      <g transform="translate(104, 64)">
        <rect width="182" height="174" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="16" y="16" width="70" height="7" rx="3.5" className="fill-foreground/60" />
        {/* Logo */}
        <rect x="16" y="30" width="38" height="38" rx="9" className="fill-primary/15" />
        <path d="M35 42 v14 M28 49 h14" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        {/* Campos */}
        {[80, 108, 136].map((y) => (
          <g key={y}>
            <rect x="16" y={y} width="46" height="5" rx="2.5" className="fill-muted-foreground/40" />
            <rect x="16" y={y + 9} width="150" height="14" rx="4" className="fill-background stroke-border" strokeWidth="1.5" />
          </g>
        ))}
      </g>
      {/* Panel tema */}
      <g transform="translate(296, 64)">
        <rect width="92" height="80" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="14" y="14" width="46" height="6" rx="3" className="fill-foreground/60" />
        <rect x="14" y="30" width="30" height="16" rx="8" className="fill-primary" />
        <circle cx="52" cy="38" r="6" className="fill-primary-foreground" />
        <rect x="14" y="56" width="64" height="6" rx="3" className="fill-muted-foreground/30" />
      </g>
      {/* Panel guardar */}
      <g transform="translate(296, 154)">
        <rect width="92" height="84" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="14" y="16" width="50" height="6" rx="3" className="fill-muted-foreground/40" />
        <rect x="14" y="30" width="64" height="6" rx="3" className="fill-muted-foreground/25" />
        <rect x="14" y="56" width="64" height="16" rx="6" className="fill-primary" />
      </g>
    </Marco>
  );
}

/** Seguridad / acceso: pantalla de inicio de sesión con candado. */
export function IlustracionSeguridad(props: SvgProps) {
  return (
    <svg
      viewBox="0 0 400 250"
      role="img"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <rect x="1" y="1" width="398" height="248" rx="14" className="fill-muted/40 stroke-border" strokeWidth="1.5" />
      {/* Tarjeta de login */}
      <g transform="translate(120, 45)">
        <rect width="160" height="160" rx="14" className="fill-card stroke-border" strokeWidth="1.5" />
        {/* Candado */}
        <g transform="translate(66, 24)">
          <rect x="0" y="14" width="28" height="22" rx="5" className="fill-primary" />
          <path d="M6 14 v-5 a8 8 0 0 1 16 0 v5" className="fill-none stroke-primary" strokeWidth="3.5" />
          <circle cx="14" cy="24" r="3.5" className="fill-primary-foreground" />
          <rect x="12.5" y="24" width="3" height="7" rx="1.5" className="fill-primary-foreground" />
        </g>
        <rect x="40" y="70" width="80" height="8" rx="4" className="fill-foreground/70" />
        {/* Campos */}
        <rect x="24" y="90" width="112" height="16" rx="5" className="fill-background stroke-border" strokeWidth="1.5" />
        <rect x="24" y="112" width="112" height="16" rx="5" className="fill-background stroke-border" strokeWidth="1.5" />
        <rect x="24" y="136" width="112" height="16" rx="5" className="fill-primary" />
      </g>
    </svg>
  );
}

/** Copias de seguridad: exportación e importación de datos. */
export function IlustracionBackup(props: SvgProps) {
  return (
    <Marco {...props}>
      <rect x="104" y="42" width="120" height="10" rx="4" className="fill-foreground/70" />
      <g transform="translate(104, 66)">
        <rect width="284" height="172" rx="8" className="fill-card stroke-border" strokeWidth="1.5" />
        {/* Base de datos */}
        <g transform="translate(122, 24)">
          <ellipse cx="20" cy="8" rx="20" ry="8" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
          <path d="M0 8 v30 a20 8 0 0 0 40 0 v-30" className="fill-primary/10 stroke-primary" strokeWidth="1.5" />
          <path d="M0 23 a20 8 0 0 0 40 0" className="fill-none stroke-primary" strokeWidth="1.5" />
        </g>
        {/* Descargar */}
        <g transform="translate(40, 96)">
          <rect width="90" height="52" rx="8" className="fill-success/10 stroke-success/40" strokeWidth="1.5" />
          <path d="M45 12 v20 M37 25 l8 8 l8 -8" className="fill-none stroke-success" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="26" y="40" width="38" height="5" rx="2.5" className="fill-success/70" />
        </g>
        {/* Restaurar */}
        <g transform="translate(154, 96)">
          <rect width="90" height="52" rx="8" className="fill-warning/10 stroke-warning/40" strokeWidth="1.5" />
          <path d="M45 32 v-20 M37 19 l8 -8 l8 8" className="fill-none stroke-warning" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="26" y="40" width="38" height="5" rx="2.5" className="fill-warning/70" />
        </g>
      </g>
    </Marco>
  );
}

/** Mapa de nombres de ilustración → componente. */
export const ILUSTRACIONES = {
  dashboard: IlustracionDashboard,
  proyectos: IlustracionProyectos,
  salidas: IlustracionSalidas,
  inventario: IlustracionInventario,
  tintas: IlustracionTintas,
  incidencias: IlustracionIncidencias,
  reportes: IlustracionReportes,
  configuracion: IlustracionConfiguracion,
  seguridad: IlustracionSeguridad,
  backup: IlustracionBackup,
} as const;

export type NombreIlustracion = keyof typeof ILUSTRACIONES;
