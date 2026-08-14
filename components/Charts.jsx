"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatMoney } from "@/lib/dateHelpers";

const tooltipStyle = {
  backgroundColor: "var(--tooltip-bg, #20242F)",
  border: "1px solid #8B93A1",
  borderRadius: 8,
  color: "#F5F1E8",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
};

// Los ejes y la rejilla de las gráficas son SVG (no clases de Tailwind), así
// que no pueden usar "dark:". Por eso toman su color de las variables CSS
// --chart-tick / --chart-grid definidas en globals.css, que sí cambian
// entre tema claro y oscuro. Antes usaban "#8B93A1" fijo, que era casi
// invisible sobre el fondo claro.
const tickStyle = { fontSize: 11, fill: "var(--chart-tick)" };

export function DailyChart({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-chrome/20 dark:bg-charcoal/60 dark:shadow-none">
      <h3 className="display text-sm uppercase tracking-[0.2em] text-slate-600 dark:text-chrome mb-4">
        Últimos 14 días
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="label" tick={tickStyle} />
          <YAxis tick={tickStyle} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => formatMoney(value)}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="ingresos" name="Ingresos" fill="#C9A227" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gastos" name="Gastos" fill="#B3272D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyTrendChart({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-chrome/20 dark:bg-charcoal/60 dark:shadow-none">
      <h3 className="display text-sm uppercase tracking-[0.2em] text-slate-600 dark:text-chrome mb-4">
        Tendencia mensual (ganancia neta)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="label" tick={tickStyle} />
          <YAxis tick={tickStyle} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => formatMoney(value)}
          />
          <Line
            type="monotone"
            dataKey="neto"
            name="Neto"
            stroke="#C9A227"
            strokeWidth={3}
            dot={{ r: 4, fill: "#B3272D" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}