"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { DistribucionEstado } from "@/types";

const COLORES: Record<string, string> = {
  ABIERTA: "hsl(38 92% 50%)",
  EN_PROCESO: "hsl(217 91% 60%)",
  RESUELTA: "hsl(152 60% 42%)",
};

/** Gráfico de tarta con la distribución de incidencias por estado. */
export function IncidenciasChart({ datos }: { datos: DistribucionEstado[] }) {
  const total = datos.reduce((a, d) => a + d.total, 0);
  const serie = datos.filter((d) => d.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidencias por estado</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribución actual · {total} en total
        </p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            No hay incidencias registradas.
          </div>
        ) : (
          <>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serie}
                    dataKey="total"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {serie.map((entry) => (
                      <Cell key={entry.estado} fill={COLORES[entry.estado]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "0.8rem",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {datos.map((d) => (
                <div
                  key={d.estado}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORES[d.estado] }}
                    />
                    <span className="text-muted-foreground">{d.label}</span>
                  </div>
                  <span className="font-medium text-foreground">{d.total}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
