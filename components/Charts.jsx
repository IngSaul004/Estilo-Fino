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

export function DailyChart({ data }) {
  return (
    <div className="rounded-2xl border border-chrome/20 bg-white/60 p-6 dark:bg-charcoal/60">
      <h3 className="display text-sm uppercase tracking-[0.2em] text-chrome mb-4">
        Últimos 14 días
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#8B93A122" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8B93A1" }} />
          <YAxis tick={{ fontSize: 11, fill: "#8B93A1" }} />
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
    <div className="rounded-2xl border border-chrome/20 bg-white/60 p-6 dark:bg-charcoal/60">
      <h3 className="display text-sm uppercase tracking-[0.2em] text-chrome mb-4">
        Tendencia mensual (ganancia neta)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#8B93A122" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8B93A1" }} />
          <YAxis tick={{ fontSize: 11, fill: "#8B93A1" }} />
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
