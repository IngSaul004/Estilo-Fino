import { formatMoney } from "@/lib/dateHelpers";

function Card({ label, data, featured }) {
  const positivo = data.neto >= 0;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 ${
        featured
          ? "border-gold/60 bg-charcoal text-ivory dark:bg-charcoal"
          : "border-chrome/20 bg-white/60 dark:bg-charcoal/60"
      }`}
    >
      <div className="absolute right-0 top-0 h-14 w-14 -translate-y-6 translate-x-6 rotate-45 barber-stripe opacity-20" />
      <p className="display text-sm uppercase tracking-[0.2em] text-chrome">
        {label}
      </p>
      <p
        className={`figure mt-3 text-4xl font-bold ${
          positivo ? "text-gold" : "text-pole-red"
        }`}
      >
        {formatMoney(data.neto)}
      </p>
      <div className="mt-4 flex justify-between text-xs text-chrome">
        <span>Ingresos: <span className="figure">{formatMoney(data.ingresos)}</span></span>
        <span>Gastos: <span className="figure">{formatMoney(data.gastos)}</span></span>
      </div>
    </div>
  );
}

export default function SummaryCards({ totals }) {
  return (
    // "grid-cols-1" es la base para celular: sin ella, Tailwind no define
    // ninguna columna en pantallas chicas y las 3 tarjetas se amontonan
    // en una sola fila en vez de apilarse. sm:grid-cols-3 solo cambia
    // ese valor a partir de pantallas medianas hacia arriba.
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card label="Hoy" data={totals.hoy} featured />
      <Card label="Esta semana" data={totals.semana} />
      <Card label="Este mes" data={totals.mes} />
    </div>
  );
}