"use client";

import * as React from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Droplets,
  FileBarChart,
  FolderKanban,
  Map,
  Package,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { CATEGORIAS, type Articulo, type Categoria } from "./kb-data";
import { ILUSTRACIONES } from "./kb-illustrations";

/** Iconos disponibles por nombre para las categorías. */
const ICONOS: Record<string, LucideIcon> = {
  Rocket,
  ShieldCheck,
  FolderKanban,
  Map,
  Truck,
  Package,
  Droplets,
  AlertTriangle,
  FileBarChart,
  Settings,
};

/** Normaliza texto para comparaciones de búsqueda (sin acentos ni mayúsculas). */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Comprueba si un artículo coincide con el término de búsqueda. */
function coincide(articulo: Articulo, termino: string): boolean {
  if (!termino) return true;
  const t = normalizar(termino);
  const contenido = normalizar(
    [articulo.titulo, articulo.resumen, ...articulo.puntos, ...articulo.etiquetas].join(" "),
  );
  return contenido.includes(t);
}

/** Un artículo expandible dentro de una categoría. */
function ArticuloItem({
  articulo,
  abierto,
  onToggle,
}: {
  articulo: Articulo;
  abierto: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">{articulo.titulo}</h3>
          <p className="text-xs text-muted-foreground">{articulo.resumen}</p>
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            abierto && "rotate-180",
          )}
        />
      </button>
      {abierto && (
        <div className="animate-fade-in border-t border-border bg-muted/30 px-4 py-3.5">
          <ul className="space-y-2.5">
            {articulo.puntos.map((punto, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{punto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Bloque de una categoría: ilustración + lista de artículos. */
function CategoriaBloque({
  categoria,
  articulos,
  abiertos,
  onToggle,
}: {
  categoria: Categoria;
  articulos: Articulo[];
  abiertos: Set<string>;
  onToggle: (id: string) => void;
}) {
  const Icono = ICONOS[categoria.icono] ?? BookOpen;
  const Ilustracion = ILUSTRACIONES[categoria.ilustracion];

  return (
    <section id={categoria.id} className="scroll-mt-24">
      <Card className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_1.15fr]">
          {/* Ilustración */}
          <div className="relative flex items-center justify-center border-b border-border bg-gradient-to-br from-accent/50 to-muted/40 p-6 lg:border-b-0 lg:border-r">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border shadow-sm">
              <Ilustracion />
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:h-5 [&_svg]:w-5">
                <Icono />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {categoria.titulo}
                </h2>
                <p className="text-sm text-muted-foreground">{categoria.descripcion}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {articulos.map((articulo) => (
                <ArticuloItem
                  key={articulo.id}
                  articulo={articulo}
                  abierto={abiertos.has(articulo.id)}
                  onToggle={() => onToggle(articulo.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

/** Base de conocimiento interactiva del panel. */
export function BaseConocimiento() {
  const [termino, setTermino] = React.useState("");
  const [categoriaActiva, setCategoriaActiva] = React.useState<string>("todas");
  const [abiertos, setAbiertos] = React.useState<Set<string>>(new Set());

  const toggleArticulo = React.useCallback((id: string) => {
    setAbiertos((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }, []);

  // Filtra categorías y artículos según búsqueda y categoría activa.
  const categoriasFiltradas = React.useMemo(() => {
    return CATEGORIAS.map((categoria) => {
      if (categoriaActiva !== "todas" && categoria.id !== categoriaActiva) {
        return { categoria, articulos: [] as Articulo[] };
      }
      const articulos = categoria.articulos.filter((a) => coincide(a, termino));
      return { categoria, articulos };
    }).filter(({ articulos }) => articulos.length > 0);
  }, [termino, categoriaActiva]);

  const totalArticulos = React.useMemo(
    () => categoriasFiltradas.reduce((n, c) => n + c.articulos.length, 0),
    [categoriasFiltradas],
  );

  // Al buscar, abre automáticamente los artículos coincidentes.
  React.useEffect(() => {
    if (!termino) return;
    const ids = new Set<string>();
    for (const { articulos } of categoriasFiltradas) {
      for (const a of articulos) ids.add(a.id);
    }
    setAbiertos(ids);
  }, [termino, categoriasFiltradas]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-accent/60 via-card to-card">
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm sm:flex [&_svg]:h-7 [&_svg]:w-7">
              <BookOpen />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Centro de ayuda privado
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Base de conocimiento
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Guías, buenas prácticas y respuestas para sacar el máximo partido a
                ImpresiónWeb. Contenido exclusivo para usuarios con sesión iniciada.
              </p>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              placeholder="Busca un tema: proyectos, tintas, reportes, copias…"
              className="h-11 pl-10 pr-10 text-base"
              aria-label="Buscar en la base de conocimiento"
            />
            {termino && (
              <button
                type="button"
                onClick={() => setTermino("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2">
        <FiltroChip
          activo={categoriaActiva === "todas"}
          onClick={() => setCategoriaActiva("todas")}
          icono={BookOpen}
        >
          Todo
        </FiltroChip>
        {CATEGORIAS.map((categoria) => {
          const Icono = ICONOS[categoria.icono] ?? BookOpen;
          return (
            <FiltroChip
              key={categoria.id}
              activo={categoriaActiva === categoria.id}
              onClick={() => setCategoriaActiva(categoria.id)}
              icono={Icono}
            >
              {categoria.titulo}
            </FiltroChip>
          );
        })}
      </div>

      {/* Resultados */}
      {categoriasFiltradas.length === 0 ? (
        <EmptyState
          icono={<Search />}
          titulo="Sin resultados"
          descripcion={`No encontramos artículos para "${termino}". Prueba con otras palabras o revisa otra categoría.`}
        />
      ) : (
        <>
          {termino && (
            <p className="text-sm text-muted-foreground">
              {totalArticulos}{" "}
              {totalArticulos === 1 ? "resultado" : "resultados"} para{" "}
              <span className="font-medium text-foreground">&ldquo;{termino}&rdquo;</span>
            </p>
          )}
          <div className="space-y-6">
            {categoriasFiltradas.map(({ categoria, articulos }) => (
              <CategoriaBloque
                key={categoria.id}
                categoria={categoria}
                articulos={articulos}
                abiertos={abiertos}
                onToggle={toggleArticulo}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Chip de filtro por categoría. */
function FiltroChip({
  activo,
  onClick,
  icono: Icono,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  icono: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        activo
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      <Icono className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
